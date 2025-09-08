from flask import Flask, redirect, request, jsonify, send_file, session
import requests
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
import os
from io import BytesIO
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime, timezone
from google_integration import GoogleIntegration
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict

# Load environment variables
load_dotenv()

# Configuration
REDIRECT_URI = "http://localhost:4000/callback"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
CORS(app, supports_credentials=True)

# Google Integration
google_integration = GoogleIntegration(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

# Helper function to get credentials
def get_credentials():
    if 'pardot_credentials' not in session:
        raise Exception("No credentials found")
    return session['pardot_credentials']

# Helper function to extract access token
def extract_access_token(auth_header):
    if not auth_header:
        return None
    return auth_header[7:] if auth_header.lower().startswith("bearer ") else auth_header

# ===== Routes =====
@app.route("/setup", methods=["POST"])
def setup():
    data = request.json
    required_fields = ['client_id', 'client_secret', 'business_unit_id']
    
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400
    
    # Store only necessary credentials, use client_secret immediately
    session['pardot_credentials'] = {
        'client_id': data['client_id'],
        'business_unit_id': data['business_unit_id']
    }
    # Store client_secret temporarily for OAuth flow only
    session['temp_client_secret'] = data['client_secret']
    
    return jsonify({"message": "Credentials stored successfully"})

@app.route("/login")
def login():
    try:
        credentials = get_credentials()
        auth_url = (
            "https://login.salesforce.com/services/oauth2/authorize"
            f"?response_type=code&client_id={credentials['client_id']}&redirect_uri={REDIRECT_URI}"
        )
        return redirect(auth_url)
    except Exception:
        return jsonify({"error": "Please setup credentials first"}), 400

@app.route("/callback")
def callback():
    auth_code = request.args.get("code")
    if not auth_code:
        return jsonify({"error": "No code received"}), 400

    try:
        credentials = get_credentials()
        client_secret = session.get('temp_client_secret')
        if not client_secret:
            return jsonify({"error": "OAuth session expired"}), 400
            
        token_response = requests.post("https://login.salesforce.com/services/oauth2/token", data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": credentials['client_id'],
            "client_secret": client_secret,
            "redirect_uri": REDIRECT_URI
        })
        
        # Clear temporary client_secret after use
        session.pop('temp_client_secret', None)

        if token_response.status_code != 200:
            return jsonify({"error": token_response.text}), 500

        access_token = token_response.json().get("access_token")
        # Store token securely in session instead of URL
        session['access_token'] = access_token
        return redirect("http://localhost:5173/dashboard")
    except Exception:
        return jsonify({"error": "No credentials found"}), 400

@app.route("/get-email-stats", methods=["GET"])
def get_email_stats():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401

    try:
        get_credentials()  # Validate credentials exist
        day = request.args.get("day")
        month = request.args.get("month")
        year = request.args.get("year")
        
        print(f"Fetching emails with params: day={day}, month={month}, year={year}")
        
        emails = fetch_all_mails(access_token, day=day, month=month, year=year)
        print(f"Found {len(emails)} emails")
        
        stats_list = fetch_email_stats_parallel(access_token, emails)
        print(f"Processed stats for {len(stats_list)} emails")
        
        return jsonify(stats_list)
    except Exception as e:
        print(f"Error in get_email_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/download-pdf", methods=["POST"])
def download_pdf():
    try:
        data_type = request.json.get("data_type", "emails")
        data = request.json.get("data")
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        if data_type == "emails":
            filters = request.json.get("filters", {})
            day = filters.get("day")
            month = filters.get("month")
            year = filters.get("year")
            buffer = create_professional_pdf_report(data, day, month, year)
            filename = "email_campaign_report.pdf"
        elif data_type == "forms":
            buffer = create_form_pdf_report(data)
            filename = "form_stats_report.pdf"
        elif data_type == "prospects":
            buffer = create_prospect_pdf_report(data)
            filename = "prospect_health_report.pdf"
        else:
            return jsonify({"error": "Invalid data type"}), 400
        
        return send_file(buffer, as_attachment=True, download_name=filename, mimetype="application/pdf")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-form-stats", methods=["GET"])
def get_form_stats():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        print(f"Fetching forms and activities with headers: {headers}")
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            forms_future = executor.submit(
                requests.get,
                "https://pi.pardot.com/api/v5/objects/forms",
                headers=headers,
                params={"fields": "id,name", "limit": 200}
            )
            activities_future = executor.submit(fetch_all_activities, headers)
            
            forms_response = forms_future.result()
            activities = activities_future.result()
        
        print(f"Forms response status: {forms_response.status_code}")
        print(f"Activities count: {len(activities) if activities else 0}")
        
        if forms_response.status_code != 200:
            return jsonify({"error": f"Error fetching forms: {forms_response.text}"}), 500
        
        forms = forms_response.json().get("values", [])
        print(f"Found {len(forms)} forms")
        
        # Group activities by form_id
        activities_by_form = defaultdict(list)
        for activity in activities:
            form_id = str(activity.get("form_id", "")) or str(activity.get("form", {}).get("id", ""))
            if form_id:
                activities_by_form[form_id].append(activity)
        
        print(f"Activities grouped by {len(activities_by_form)} forms")
        
        # Calculate stats in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(calculate_form_stats, form, activities_by_form) for form in forms]
            form_stats = [future.result() for future in futures]
        
        print(f"Calculated stats for {len(form_stats)} forms")
        return jsonify(form_stats)
    except Exception as e:
        print(f"Error in get_form_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ===== Google Integration Routes =====
@app.route("/google-auth", methods=["GET"])
def google_auth():
    try:
        token = request.headers.get("Authorization")
        if token:
            session['pardot_token'] = token
        
        auth_url, flow = google_integration.get_auth_url()
        return jsonify({"auth_url": auth_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/google-callback")
def google_callback():
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({"error": "No code received"}), 400
        
        _, flow = google_integration.get_auth_url()
        credentials = google_integration.get_credentials(code, flow)
        session['google_credentials'] = credentials.to_json()
        
        stored_token = session.get('pardot_token', '')
        redirect_url = 'http://localhost:5173/dashboard?google_auth=success'
        if stored_token:
            clean_token = stored_token.replace("Bearer ", "").replace("bearer ", "")
            redirect_url += f'&token={clean_token}'
        return redirect(redirect_url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/export-to-sheets", methods=["POST"])
def export_to_sheets():
    if not session.get('google_credentials'):
        return jsonify({"error": "Google authentication required"}), 401
    
    try:
        from google.oauth2.credentials import Credentials
        import json
        
        credentials = Credentials.from_authorized_user_info(
            json.loads(session['google_credentials'])
        )
        
        title = request.json.get("title", "Stats")
        export_data = request.json.get("data", [])
        
        if not export_data:
            return jsonify({"error": "No data provided"}), 400
        
        spreadsheet_id = google_integration.create_spreadsheet(credentials, title, export_data)
        
        return jsonify({
            "success": True,
            "spreadsheet_id": spreadsheet_id,
            "url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/google-auth-status", methods=["GET"])
def google_auth_status():
    return jsonify({"authenticated": bool(session.get('google_credentials'))})

@app.route("/get-prospect-health", methods=["GET"])
def get_prospect_health():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        prospects = fetch_all_prospects(headers)
        health_data = analyze_prospect_health(prospects, headers)
        
        return jsonify(health_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-inactive-prospects", methods=["GET"])
def get_inactive_prospects():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        prospects = fetch_all_prospects(headers)
        inactive_prospects = find_inactive_prospects(prospects)
        
        return jsonify({
            "total_inactive": len(inactive_prospects),
            "inactive_prospects": inactive_prospects
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-duplicate-prospects", methods=["GET"])
def get_duplicate_prospects():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        prospects = fetch_all_prospects(headers)
        duplicates = find_duplicate_prospects(prospects)
        
        return jsonify({
            "total_duplicate_groups": len(duplicates),
            "duplicate_prospects": duplicates
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-missing-fields-prospects", methods=["GET"])
def get_missing_fields_prospects():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        prospects = fetch_all_prospects(headers)
        missing_fields = find_missing_critical_fields(prospects)
        
        return jsonify({
            "total_with_missing_fields": len(missing_fields),
            "prospects_missing_fields": missing_fields
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-scoring-issues-prospects", methods=["GET"])
def get_scoring_issues_prospects():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        prospects = fetch_all_prospects(headers)
        scoring_issues = find_scoring_inconsistencies(prospects)
        
        return jsonify({
            "total_scoring_issues": len(scoring_issues),
            "prospects_with_scoring_issues": scoring_issues
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-token", methods=["GET"])
def get_token():
    """Secure endpoint to get access token from session"""
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "No access token found"}), 401
    return jsonify({"token": access_token})

# ===== Prospect Health Functions =====
def fetch_all_prospects(headers):
    """Fetch all prospects with pagination"""
    all_prospects = []
    url = "https://pi.pardot.com/api/v5/objects/prospects"
    params = {
        "fields": "id,email,firstName,lastName,country,jobTitle,score,grade,lastActivityAt,createdAt",
        "limit": 200
    }
    
    while url:
        print(f"Fetching prospects from: {url}")
        response = requests.get(url, headers=headers, params=params if url.endswith("prospects") else None)
        
        if response.status_code != 200:
            print(f"Error fetching prospects: {response.status_code} - {response.text}")
            break
            
        data = response.json()
        prospects = data.get("values", [])
        all_prospects.extend(prospects)
        
        url = data.get("nextPageUrl")
        params = None  # Clear params for subsequent requests
        
        # Limit to prevent timeout (remove this in production)
        if len(all_prospects) >= 2000:
            break
    
    return all_prospects

def analyze_prospect_health(prospects, headers):
    """Analyze prospect database health"""
    from datetime import datetime, timedelta
    
    # Initialize counters
    duplicates = find_duplicate_prospects(prospects)
    inactive_prospects = find_inactive_prospects(prospects)
    missing_fields = find_missing_critical_fields(prospects)
    scoring_issues = find_scoring_inconsistencies(prospects)
    grading_analysis = analyze_grading_setup(prospects)
    
    return {
        "total_prospects": len(prospects),
        "duplicates": {
            "count": len(duplicates),
            "details": duplicates[:50]  # Limit to first 50 for performance
        },
        "inactive_prospects": {
            "count": len(inactive_prospects),
            "details": inactive_prospects[:50]
        },
        "missing_fields": {
            "count": len(missing_fields),
            "details": missing_fields[:50]
        },
        "scoring_issues": {
            "count": len(scoring_issues),
            "details": scoring_issues[:50]
        },
        "grading_analysis": grading_analysis
    }

def find_duplicate_prospects(prospects):
    """Find prospects with duplicate email addresses"""
    email_groups = {}
    
    for prospect in prospects:
        email = prospect.get('email', '').lower().strip()
        if email:
            if email not in email_groups:
                email_groups[email] = []
            email_groups[email].append(prospect)
    
    duplicates = []
    for email, group in email_groups.items():
        if len(group) > 1:
            duplicates.append({
                "email": email,
                "count": len(group),
                "prospects": [{
                    "id": p.get('id'),
                    "firstName": p.get('firstName', ''),
                    "lastName": p.get('lastName', ''),
                    "createdAt": p.get('createdAt', '')
                } for p in group]
            })
    
    return duplicates

def find_inactive_prospects(prospects):
    """Find prospects with no activity in 90+ days"""
    from datetime import datetime, timedelta
    
    cutoff_date = datetime.now() - timedelta(days=90)
    inactive = []
    
    for prospect in prospects:
        last_activity = prospect.get('lastActivityAt')
        if not last_activity:
            # No activity recorded
            inactive.append({
                "id": prospect.get('id'),
                "email": prospect.get('email', ''),
                "firstName": prospect.get('firstName', ''),
                "lastName": prospect.get('lastName', ''),
                "lastActivityAt": None,
                "daysSinceActivity": "Never"
            })
        else:
            try:
                # Parse the date string
                activity_date = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                if activity_date < cutoff_date:
                    days_inactive = (datetime.now() - activity_date.replace(tzinfo=None)).days
                    inactive.append({
                        "id": prospect.get('id'),
                        "email": prospect.get('email', ''),
                        "firstName": prospect.get('firstName', ''),
                        "lastName": prospect.get('lastName', ''),
                        "lastActivityAt": last_activity,
                        "daysSinceActivity": days_inactive
                    })
            except:
                # If date parsing fails, consider as inactive
                inactive.append({
                    "id": prospect.get('id'),
                    "email": prospect.get('email', ''),
                    "firstName": prospect.get('firstName', ''),
                    "lastName": prospect.get('lastName', ''),
                    "lastActivityAt": last_activity,
                    "daysSinceActivity": "Unknown"
                })
    
    return inactive

def find_missing_critical_fields(prospects):
    """Find prospects missing critical fields"""
    missing = []
    
    for prospect in prospects:
        missing_fields = []
        
        if not prospect.get('country'):
            missing_fields.append('country')
        if not prospect.get('jobTitle'):
            missing_fields.append('jobTitle')
        if not prospect.get('firstName'):
            missing_fields.append('firstName')
        if not prospect.get('lastName'):
            missing_fields.append('lastName')
        
        if missing_fields:
            missing.append({
                "id": prospect.get('id'),
                "email": prospect.get('email', ''),
                "firstName": prospect.get('firstName', ''),
                "lastName": prospect.get('lastName', ''),
                "missingFields": missing_fields
            })
    
    return missing

def find_scoring_inconsistencies(prospects):
    """Find prospects with scoring inconsistencies"""
    inconsistencies = []
    
    for prospect in prospects:
        score = prospect.get('score', 0)
        last_activity = prospect.get('lastActivityAt')
        
        # High score but no recent activity (potential issue)
        if score > 50 and not last_activity:
            inconsistencies.append({
                "id": prospect.get('id'),
                "email": prospect.get('email', ''),
                "firstName": prospect.get('firstName', ''),
                "lastName": prospect.get('lastName', ''),
                "score": score,
                "issue": "High score but no activity recorded",
                "lastActivityAt": last_activity
            })
        elif score > 75:
            # Check if high score aligns with recent activity
            try:
                if last_activity:
                    from datetime import datetime, timedelta
                    activity_date = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
                    days_since = (datetime.now() - activity_date.replace(tzinfo=None)).days
                    
                    if days_since > 30:
                        inconsistencies.append({
                            "id": prospect.get('id'),
                            "email": prospect.get('email', ''),
                            "firstName": prospect.get('firstName', ''),
                            "lastName": prospect.get('lastName', ''),
                            "score": score,
                            "issue": f"High score but no activity in {days_since} days",
                            "lastActivityAt": last_activity
                        })
            except:
                pass
    
    return inconsistencies

def analyze_grading_setup(prospects):
    """Analyze grading distribution and setup"""
    grade_distribution = {}
    total_graded = 0
    
    for prospect in prospects:
        grade = prospect.get('grade')
        if grade:
            total_graded += 1
            if grade not in grade_distribution:
                grade_distribution[grade] = 0
            grade_distribution[grade] += 1
    
    # Calculate percentages
    grade_percentages = {}
    if total_graded > 0:
        for grade, count in grade_distribution.items():
            grade_percentages[grade] = round((count / total_graded) * 100, 2)
    
    return {
        "total_prospects": len(prospects),
        "graded_prospects": total_graded,
        "ungraded_prospects": len(prospects) - total_graded,
        "grading_coverage": round((total_graded / len(prospects)) * 100, 2) if prospects else 0,
        "grade_distribution": grade_distribution,
        "grade_percentages": grade_percentages
    }

# ===== Helper Functions =====
def fetch_all_mails(access_token, fields="id,name,subject,createdAt", day=None, month=None, year=None):
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        print(f"Fetching mails with headers: {headers}")
        
        # Calculate date threshold
        if day and month and year:
            try:
                start_date = datetime(int(year), int(month), int(day), tzinfo=timezone.utc)
                print(f"Using date filter: {start_date}")
            except ValueError as e:
                print(f"Invalid date parameters: {e}")
                return []
        else:
            now = datetime.now(timezone.utc)
            start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)
            print(f"Using default date filter: {start_date}")

        date_threshold = start_date.isoformat().replace("+00:00", "Z")
        print(f"Date threshold: {date_threshold}")
        
        # Fetch emails with pagination
        all_mails = []
        url = "https://pi.pardot.com/api/v5/objects/list-emails"
        params = {"fields": fields, "limit": 200}
        
        while url:
            print(f"Fetching from URL: {url}")
            response = requests.get(url, headers=headers, params=params if url.endswith("list-emails") else None)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"API Error: {response.text}")
                break

            data = response.json()
            emails = data.get("values", [])
            print(f"Got {len(emails)} emails from API")
            
            for email in emails:
                email_date = email.get("createdAt", "")
                if email_date >= date_threshold:  # Use >= instead of >
                    all_mails.append(email)

            url = data.get("nextPageUrl")
            print(f"Next URL: {url}")

        print(f"Total emails after filtering: {len(all_mails)}")
        return all_mails
        
    except Exception as e:
        print(f"Error in fetch_all_mails: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def fetch_email_stats(access_token, email_id):
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }

        response = requests.get(f"https://pi.pardot.com/api/v5/objects/list-emails/{email_id}/stats", headers=headers)
        return response.json() if response.status_code == 200 else None
    except Exception:
        return None

def fetch_single_email_stats(args):
    try:
        access_token, email, business_unit_id = args
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": business_unit_id
        }

        email_id = email.get('id')
        if not email_id:
            print(f"No ID found for email: {email}")
            return None
            
        response = requests.get(f"https://pi.pardot.com/api/v5/objects/list-emails/{email_id}/stats", headers=headers)
        
        if response.status_code != 200:
            print(f"Failed to get stats for email {email_id}: {response.status_code} - {response.text}")
            return None
        
        return {
            "id": email_id,
            "name": email.get("name", "Unknown"),
            "subject": email.get("subject", ""),
            "createdat": email.get("createdAt", ""),
            "stats": response.json()
        }
        
    except Exception as e:
        print(f"Error processing email stats: {str(e)}")
        return None

def fetch_email_stats_parallel(access_token, emails):
    if not emails:
        print("No emails to process")
        return []
        
    try:
        credentials = get_credentials()
        business_unit_id = credentials['business_unit_id']
        
        print(f"Processing {len(emails)} emails with business_unit_id: {business_unit_id}")
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            args_list = [(access_token, email, business_unit_id) for email in emails]
            results = list(executor.map(fetch_single_email_stats, args_list))
        
        valid_results = [result for result in results if result is not None]
        print(f"Got valid stats for {len(valid_results)} out of {len(emails)} emails")
        return valid_results
        
    except Exception as e:
        print(f"Error in fetch_email_stats_parallel: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def fetch_all_activities(headers):
    all_activities = []
    limit = 200
    
    for offset in range(0, 10000, limit):
        response = requests.get(
            "https://pi.pardot.com/api/visitorActivity/version/4/do/query",
            headers=headers,
            params={
                "format": "json",
                "limit": limit,
                "offset": offset,
                "sort_by": "created_at",
                "sort_order": "descending"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            activities = data.get("result", {}).get("visitor_activity", [])
            if activities:
                all_activities.extend(activities)
            else:
                break
        else:
            print(f"Error fetching activities: {response.status_code} - {response.text}")
            break
    
    return all_activities

def calculate_form_stats(form, activities_by_form):
    form_id = str(form["id"])
    form_activities = activities_by_form.get(form_id, [])
    
    # Activity types: 2=View, 4=Success (Form Submission), 1,6=Clicks
    views = [a for a in form_activities if int(a.get("type", 0)) == 2]
    submissions = [a for a in form_activities if int(a.get("type", 0)) == 4]
    clicks = [a for a in form_activities if int(a.get("type", 0)) in [1, 6]]
    
    def get_unique_count(activities):
        return len({a.get("visitor_id") or a.get("prospect_id") for a in activities if a.get("visitor_id") or a.get("prospect_id")})
    
    return {
        "id": form_id,
        "name": form["name"],
        "views": len(views),
        "unique_views": get_unique_count(views),
        "submissions": len(submissions),
        "unique_submissions": get_unique_count(submissions),
        "clicks": len(clicks),
        "unique_clicks": get_unique_count(clicks),
        "conversions": len([a for a in submissions if a.get("prospect_id")])
    }



# ===== Professional PDF Report Generator =====
def create_professional_pdf_report(stats_list, day=None, month=None, year=None):
    """Generate a modern, compact professional PDF report"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    content = []
    
    # 1. HEADER & SUMMARY (Single Page)
    content.extend(create_modern_header_and_summary(stats_list, day, month, year))
    
    # 2. EMAIL PERFORMANCE TABLE (Compact)
    if stats_list:
        content.append(Spacer(1, 0.3*inch))
        content.extend(create_compact_email_table(stats_list))
        
        # 3. KEY INSIGHTS & RECOMMENDATIONS
        content.append(Spacer(1, 0.3*inch))
        content.extend(create_insights_section(stats_list))
    else:
        content.append(Paragraph("No email data available for the selected period.", getSampleStyleSheet()['Normal']))
    
    doc.build(content)
    buffer.seek(0)
    return buffer

def create_modern_header_and_summary(stats_list, day, month, year):
    """Create modern header with integrated summary"""
    styles = getSampleStyleSheet()
    content = []
    
    # Modern Header
    header_style = ParagraphStyle('ModernHeader', parent=styles['Heading1'], 
                                fontSize=20, spaceAfter=8, alignment=1, 
                                textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    subtitle_style = ParagraphStyle('ModernSubtitle', parent=styles['Normal'], 
                                  fontSize=12, spaceAfter=16, alignment=1, 
                                  textColor=colors.HexColor('#6b7280'))
    
    content.append(Paragraph("📊 EMAIL CAMPAIGN PERFORMANCE REPORT", header_style))
    
    # Date and generation info
    if day and month and year:
        date_str = f"Campaign Data From: {month}/{day}/{year} onwards • Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    else:
        date_str = f"All Campaign Data • Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    
    content.append(Paragraph(date_str, subtitle_style))
    
    # Executive Summary Cards
    if stats_list:
        totals = calculate_totals(stats_list)
        
        # Create summary cards in a table format
        summary_cards = [
            ['📧 TOTAL List Mails', '📤 EMAILS SENT', '📬 DELIVERED', '👁️ OPENS'],
            [f"{len(stats_list):,}", f"{totals['sent']:,}", f"{totals['delivered']:,}", f"{totals['opens']:,}"],
            ['🖱️ CLICKS', '📊 OPEN RATE', '🎯 CLICK RATE', '⚡ ENGAGEMENT'],
            [f"{totals['clicks']:,}", f"{totals['open_rate']:.1f}%", f"{totals['click_rate']:.1f}%", 
             f"{((totals['opens'] + totals['clicks']) / totals['delivered'] * 100):.1f}%" if totals['delivered'] > 0 else '0%']
        ]
        
        summary_table = Table(summary_cards, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        summary_table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Values row styling
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 14),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#1e40af')),
            
            # Second header row
            ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.white),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (-1, 2), 10),
            
            # Second values row
            ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#d1fae5')),
            ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 3), (-1, 3), 14),
            ('TEXTCOLOR', (0, 3), (-1, 3), colors.HexColor('#047857')),
            
            # Grid and padding
            ('GRID', (0, 0), (-1, -1), 1, colors.white),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [None]),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8)
        ]))
        
        content.append(summary_table)
        
        # Add performance chart for all campaigns
        content.append(Spacer(1, 0.2*inch))
        chart = create_campaign_performance_chart(stats_list)
        content.append(chart)
    
    return content

def create_compact_email_table(stats_list):
    """Create a compact table showing all email performance with pagination"""
    styles = getSampleStyleSheet()
    content = []
    
    # Section header
    section_style = ParagraphStyle('CompactSection', parent=styles['Heading2'], 
                                 fontSize=16, spaceAfter=12, 
                                 textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    content.append(Paragraph(f"📈 CAMPAIGN PERFORMANCE BREAKDOWN ({len(stats_list)} Campaigns)", section_style))
    
    # Split campaigns into chunks for better page management
    campaigns_per_page = 25  # Adjust based on page size
    
    for page_num, start_idx in enumerate(range(0, len(stats_list), campaigns_per_page)):
        end_idx = min(start_idx + campaigns_per_page, len(stats_list))
        page_campaigns = stats_list[start_idx:end_idx]
        
        # Add page break for subsequent pages
        if page_num > 0:
            content.append(PageBreak())
            content.append(Paragraph(f"📈 CAMPAIGN PERFORMANCE (Continued - Page {page_num + 1})", section_style))
        
        # Prepare table data for this page
        table_data = [['Campaign Name', 'Sent', 'Opens', 'Clicks', 'Open Rate', 'CTR', 'Status']]
        
        for email_data in page_campaigns:
            stats = email_data.get('stats', {})
            name = email_data.get('name', 'Unknown')[:30] + '...' if len(email_data.get('name', '')) > 30 else email_data.get('name', 'Unknown')
            sent = stats.get('sent', 0)
            delivered = stats.get('delivered', 0)
            opens = stats.get('opens', 0)
            clicks = stats.get('clicks', 0)
            
            open_rate = (opens / delivered * 100) if delivered > 0 else 0
            click_rate = (clicks / delivered * 100) if delivered > 0 else 0
            
            # Performance status
            if open_rate >= 25:
                status = "🟢 Excellent"
            elif open_rate >= 15:
                status = "🟡 Good"
            else:
                status = "🔴 Needs Work"
            
            table_data.append([
                name,
                f"{sent:,}",
                f"{opens:,}",
                f"{clicks:,}",
                f"{open_rate:.1f}%",
                f"{click_rate:.1f}%",
                status
            ])
        
        # Create table for this page
        email_table = Table(table_data, colWidths=[2.4*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.8*inch, 0.7*inch, 1.2*inch])
        email_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            
            # Campaign name column (left align)
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3)
        ]))
        
        content.append(email_table)
        
        # Add page summary for multi-page reports
        if len(stats_list) > campaigns_per_page:
            note_style = ParagraphStyle('PageNote', parent=styles['Normal'], 
                                      fontSize=8, spaceAfter=8, alignment=1, 
                                      textColor=colors.HexColor('#6b7280'), fontStyle='italic')
            content.append(Spacer(1, 6))
            content.append(Paragraph(f"Campaigns {start_idx + 1}-{end_idx} of {len(stats_list)} total", note_style))
    
    return content

def create_insights_section(stats_list):
    """Create insights and recommendations section"""
    styles = getSampleStyleSheet()
    content = []
    
    # Section header
    section_style = ParagraphStyle('InsightsSection', parent=styles['Heading2'], 
                                 fontSize=16, spaceAfter=12, 
                                 textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    content.append(Paragraph("🎯 KEY INSIGHTS & RECOMMENDATIONS", section_style))
    
    # Calculate insights
    totals = calculate_totals(stats_list)
    
    # Find best and worst performing campaigns
    best_campaign = max(stats_list, key=lambda x: x.get('stats', {}).get('opens', 0) / max(x.get('stats', {}).get('delivered', 1), 1))
    worst_campaign = min(stats_list, key=lambda x: x.get('stats', {}).get('opens', 0) / max(x.get('stats', {}).get('delivered', 1), 1))
    
    best_open_rate = (best_campaign.get('stats', {}).get('opens', 0) / max(best_campaign.get('stats', {}).get('delivered', 1), 1) * 100)
    worst_open_rate = (worst_campaign.get('stats', {}).get('opens', 0) / max(worst_campaign.get('stats', {}).get('delivered', 1), 1) * 100)
    
    # Create insights table
    insights_data = [
        ['📊 PERFORMANCE ANALYSIS', 'VALUE'],
        ['Overall Open Rate', f"{totals['open_rate']:.1f}%"],
        ['Overall Click Rate', f"{totals['click_rate']:.1f}%"],
        ['Best Performing Campaign', f"{best_campaign.get('name', 'Unknown')[:20]}..."],
        ['Lowest Performing Campaign', f"{worst_campaign.get('name', 'Unknown')[:20]}..."],
        ['Total Engagement', f"{((totals['opens'] + totals['clicks']) / totals['delivered'] * 100):.1f}%" if totals['delivered'] > 0 else '0%']
    ]
    
    insights_table = Table(insights_data, colWidths=[2.5*inch, 2*inch, 2.7*inch])
    insights_table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#faf5ff')]),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6)
    ]))
    
    content.append(insights_table)
    
    # Add industry benchmarks section
    content.append(Spacer(1, 0.2*inch))
    
    benchmark_style = ParagraphStyle('BenchmarkHeader', parent=styles['Heading3'], 
                                   fontSize=14, spaceAfter=8, 
                                   textColor=colors.HexColor('#dc2626'), fontName='Helvetica-Bold')
    
    content.append(Paragraph("🏆 INDUSTRY BENCHMARK COMPARISON", benchmark_style))
    
    # Industry benchmarks (typical email marketing benchmarks)
    benchmark_data = [
        ['Metric', 'Your Performance', 'Industry Average', 'Status'],
        ['Open Rate', f"{totals['open_rate']:.1f}%", '21.3%', 
         '🟢 Above Average' if totals['open_rate'] > 21.3 else '🟡 Average' if totals['open_rate'] > 15 else '🔴 Below Average'],
        ['Click Rate', f"{totals['click_rate']:.1f}%", '2.6%', 
         '🟢 Above Average' if totals['click_rate'] > 2.6 else '🟡 Average' if totals['click_rate'] > 1.5 else '🔴 Below Average'],
        ['Delivery Rate', f"{(totals['delivered']/totals['sent']*100):.1f}%" if totals['sent'] > 0 else '0%', '95.0%', 
         '🟢 Excellent' if (totals['delivered']/totals['sent']*100) > 95 else '🟡 Good' if (totals['delivered']/totals['sent']*100) > 90 else '🔴 Needs Work']
    ]
    
    benchmark_table = Table(benchmark_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 2.2*inch])
    benchmark_table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fef2f2')]),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4)
    ]))
    
    content.append(benchmark_table)
    
    # Add footer with generation info
    content.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], 
                                fontSize=8, alignment=1, 
                                textColor=colors.HexColor('#9ca3af'))
    
    footer_text = f"Report generated by Pardot Analytics Hub • {datetime.now().strftime('%B %d, %Y at %I:%M %p')} • Total Campaigns: {len(stats_list)} • Confidential"
    content.append(Paragraph(footer_text, footer_style))
    
    return content

def calculate_totals(stats_list):
    """Calculate overall totals and averages"""
    if not stats_list:
        return {}
    
    total_sent = sum(email.get('stats', {}).get('sent', 0) for email in stats_list)
    total_delivered = sum(email.get('stats', {}).get('delivered', 0) for email in stats_list)
    total_opens = sum(email.get('stats', {}).get('opens', 0) for email in stats_list)
    total_clicks = sum(email.get('stats', {}).get('clicks', 0) for email in stats_list)
    
    count = len(stats_list)
    
    return {
        'sent': total_sent,
        'delivered': total_delivered,
        'opens': total_opens,
        'clicks': total_clicks,
        'open_rate': (total_opens / total_delivered * 100) if total_delivered > 0 else 0,
        'click_rate': (total_clicks / total_delivered * 100) if total_delivered > 0 else 0,
        'avg_sent': total_sent / count,
        'avg_delivered': total_delivered / count,
        'avg_opens': total_opens / count,
        'avg_clicks': total_clicks / count,
        'avg_open_rate': sum((email.get('stats', {}).get('opens', 0) / max(email.get('stats', {}).get('delivered', 1), 1) * 100) for email in stats_list) / count,
        'avg_click_rate': sum((email.get('stats', {}).get('clicks', 0) / max(email.get('stats', {}).get('delivered', 1), 1) * 100) for email in stats_list) / count
    }

def create_campaign_performance_chart(stats_list):
    """Create bar chart showing total sent vs delivered for all campaigns"""
    drawing = Drawing(500, 200)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 30
    chart.height = 140
    chart.width = 400
    
    # Calculate totals
    totals = calculate_totals(stats_list)
    
    # Prepare data - showing total sent, delivered, opens, clicks
    chart.data = [
        [totals['sent'], totals['delivered'], totals['opens'], totals['clicks']]
    ]
    
    chart.categoryAxis.categoryNames = ['Total Sent', 'Delivered', 'Opens', 'Clicks']
    chart.categoryAxis.labels.fontSize = 10
    chart.categoryAxis.labels.dy = -5
    
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max(totals['sent'], 1000)  # Ensure reasonable scale
    chart.valueAxis.labels.fontSize = 9
    chart.valueAxis.labelTextFormat = '%s'
    
    # Color bars with different colors for each metric
    chart.bars[0].fillColor = colors.HexColor('#3b82f6')  # Blue for sent
    
    # Add chart title
    from reportlab.graphics.shapes import String
    title = String(250, 175, 'Overall Campaign Performance Metrics', textAnchor='middle')
    title.fontSize = 11
    title.fontName = 'Helvetica-Bold'
    title.fillColor = colors.HexColor('#1f2937')
    
    drawing.add(chart)
    drawing.add(title)
    
    return drawing

def create_form_pdf_report(form_stats):
    """Generate PDF report for form statistics"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    content = []
    styles = getSampleStyleSheet()
    
    # Header
    header_style = ParagraphStyle('FormHeader', parent=styles['Heading1'], 
                                fontSize=20, spaceAfter=16, alignment=1, 
                                textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    content.append(Paragraph("📝 FORM PERFORMANCE REPORT", header_style))
    content.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                           ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, spaceAfter=16, alignment=1, textColor=colors.HexColor('#6b7280'))))
    
    # Summary
    total_views = sum(form.get('views', 0) for form in form_stats)
    total_submissions = sum(form.get('submissions', 0) for form in form_stats)
    avg_conversion = (total_submissions / total_views * 100) if total_views > 0 else 0
    
    summary_data = [
        ['📊 FORM SUMMARY', 'VALUE'],
        ['Total Forms', f"{len(form_stats):,}"],
        ['Total Views', f"{total_views:,}"],
        ['Total Submissions', f"{total_submissions:,}"],
        ['Average Conversion Rate', f"{avg_conversion:.1f}%"]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#475569')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    
    content.append(summary_table)
    content.append(Spacer(1, 0.3*inch))
    
    # Form details table
    if form_stats:
        table_data = [['Form Name', 'Views', 'Submissions', 'Conversion Rate']]
        
        for form in form_stats[:20]:  # Limit to first 20 forms
            name = form.get('name', 'Unknown')[:30] + '...' if len(form.get('name', '')) > 30 else form.get('name', 'Unknown')
            views = form.get('views', 0)
            submissions = form.get('submissions', 0)
            conversion_rate = (submissions / views * 100) if views > 0 else 0
            
            table_data.append([
                name,
                f"{views:,}",
                f"{submissions:,}",
                f"{conversion_rate:.1f}%"
            ])
        
        form_table = Table(table_data, colWidths=[3*inch, 1*inch, 1*inch, 1.2*inch])
        form_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334155')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')])
        ]))
        
        content.append(Paragraph("📋 FORM PERFORMANCE DETAILS", 
                               ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontSize=16, spaceAfter=12, textColor=colors.HexColor('#1f2937'))))
        content.append(form_table)
    
    doc.build(content)
    buffer.seek(0)
    return buffer

def create_prospect_pdf_report(health_data):
    """Generate PDF report for prospect health analysis"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    content = []
    styles = getSampleStyleSheet()
    
    # Header
    header_style = ParagraphStyle('ProspectHeader', parent=styles['Heading1'], 
                                fontSize=20, spaceAfter=16, alignment=1, 
                                textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    content.append(Paragraph("🏥 PROSPECT DATABASE HEALTH REPORT", header_style))
    content.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                           ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, spaceAfter=16, alignment=1, textColor=colors.HexColor('#6b7280'))))
    
    # Health summary
    summary_data = [
        ['📊 DATABASE HEALTH SUMMARY', 'COUNT', 'PERCENTAGE'],
        ['Total Prospects', f"{health_data['total_prospects']:,}", '100%'],
        ['Duplicate Prospects', f"{health_data['duplicates']['count']:,}", f"{(health_data['duplicates']['count']/health_data['total_prospects']*100):.1f}%"],
        ['Inactive Prospects (90+ days)', f"{health_data['inactive_prospects']['count']:,}", f"{(health_data['inactive_prospects']['count']/health_data['total_prospects']*100):.1f}%"],
        ['Missing Critical Fields', f"{health_data['missing_fields']['count']:,}", f"{(health_data['missing_fields']['count']/health_data['total_prospects']*100):.1f}%"],
        ['Scoring Issues', f"{health_data['scoring_issues']['count']:,}", f"{(health_data['scoring_issues']['count']/health_data['total_prospects']*100):.1f}%"]
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 1.5*inch, 1.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#64748b')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')])
    ]))
    
    content.append(summary_table)
    content.append(Spacer(1, 0.3*inch))
    
    # Grading analysis
    grading = health_data.get('grading_analysis', {})
    if grading:
        content.append(Paragraph("📊 GRADING ANALYSIS", 
                               ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontSize=16, spaceAfter=12, textColor=colors.HexColor('#1f2937'))))
        
        grading_data = [
            ['Grading Metric', 'Value'],
            ['Grading Coverage', f"{grading.get('grading_coverage', 0):.1f}%"],
            ['Graded Prospects', f"{grading.get('graded_prospects', 0):,}"],
            ['Ungraded Prospects', f"{grading.get('ungraded_prospects', 0):,}"]
        ]
        
        grading_table = Table(grading_data, colWidths=[3*inch, 2*inch])
        grading_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#22c55e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fdf4')])
        ]))
        
        content.append(grading_table)
    
    doc.build(content)
    buffer.seek(0)
    return buffer

if __name__ == "__main__":
    app.run(port=4000, debug=True)