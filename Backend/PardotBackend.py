from flask import Flask, redirect, request, jsonify, send_file, session
import requests
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
import os
from io import BytesIO
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime,timezone
from google_integration import GoogleIntegration
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict


# Load env variables
load_dotenv()

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
BUSINESS_UNIT_ID = os.getenv("BUSINESS_UNIT_ID")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


app = Flask(__name__)
app.secret_key = 'your-secret-key-here'
CORS(app, supports_credentials=True)

# Google Integration

google_integration = GoogleIntegration(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
# ===== Step 1: Login Route =====
@app.route("/login")
def login():
    auth_url = (
        "https://login.salesforce.com/services/oauth2/authorize"
        f"?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}"
    )
    return redirect(auth_url)

# ===== Step 2: Callback Route (Auth) =====
@app.route("/callback")
def callback():
    auth_code = request.args.get("code")
    if not auth_code:
        return jsonify({"error": "No code received"}), 400

    token_url = "https://login.salesforce.com/services/oauth2/token"
    token_params = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI
    }
    token_response = requests.post(token_url, data=token_params)

    if token_response.status_code != 200:
        return jsonify({"error": token_response.text}), 500

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    return redirect(f"http://localhost:5173/dashboard?token={access_token}")

# ===== Step 3: Get Email Stats =====
@app.route("/get-email-stats", methods=["GET"])
def get_email_stats():
    access_token = request.headers.get("Authorization")
    print(f"Received token: {access_token}")
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    if access_token.lower().startswith("bearer "):
        access_token = access_token[7:]

    day = request.args.get("day")
    month = request.args.get("month")
    year = request.args.get("year")
    print(f"Date filters: day={day}, month={month}, year={year}")
    
    try:
        emails = fetch_all_mails(access_token,day=day,month=month,year=year)
        print(f"Found {len(emails)} emails")
        
        # Fetch stats in parallel
        stats_list = fetch_email_stats_parallel(access_token, emails)
        
        print(f"Returning {len(stats_list)} email stats")
        return jsonify(stats_list)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ===== Step 4: Download PDF =====
@app.route("/download-pdf", methods=["GET"])
def download_pdf():
    access_token = request.headers.get("Authorization")
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401

    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    content = []

    emails = fetch_all_mails(access_token)
    for e in emails:
        stats = fetch_email_stats(access_token, e["id"])
        if stats:
            content.append(Paragraph(f"Email ID: {e['id']} || Name: {e['name']}", styles['Heading2']))
            for k, v in stats.items():
                content.append(Paragraph(f"{k}: {v}", styles['Normal']))
            content.append(Spacer(1, 12))

    doc.build(content)
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name="email_stats.pdf", mimetype="application/pdf")



def fetch_all_mails(access_token, fields="id,name,subject,createdAt", day=None, month=None, year=None):
    base_url = "https://pi.pardot.com/api/v5/objects/list-emails"
    params = {"fields": fields, "limit": 200}
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Pardot-Business-Unit-Id": BUSINESS_UNIT_ID
    }
    print(day)
    print(year)
    print(month)
    print(access_token)
  
    if day and month and year:
        try:
            start_date = datetime(int(year), int(month), int(day), tzinfo=timezone.utc)
        except ValueError as e:
            print("Invalid date provided:", e)
            return []
    else:
        # Default to Jan 1 current year in UTC
        now = datetime.now(timezone.utc)
        start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)

    date_threshold = start_date.isoformat().replace("+00:00", "Z")
    print("Date threshold:", date_threshold)

    all_mails = []
    url = base_url
    print(url)
    
    while url:
        response = requests.get(url, headers=headers, params=params if url == base_url else None)
        if response.status_code != 200:
            break

        data = response.json()
        for e in data.get("values", []):
            if e.get("createdAt") > date_threshold:
                all_mails.append(e)

        url = data.get("nextPageUrl")

    return all_mails

def fetch_email_stats(access_token, email_id):
    base_url = f"https://pi.pardot.com/api/v5/objects/list-emails/{email_id}/stats"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Pardot-Business-Unit-Id": BUSINESS_UNIT_ID
    }

    response = requests.get(base_url, headers=headers)
    if response.status_code != 200:
        return None
    return response.json()

def fetch_single_email_stats(args):
    access_token, email = args
    stats = fetch_email_stats(access_token, email["id"])
    if stats:
        return {
            "id": email["id"],
            "name": email["name"],
            "subject": email.get("subject"),
            "createdat": email["createdAt"],
            "stats": stats
        }
    return None

def fetch_email_stats_parallel(access_token, emails):
    with ThreadPoolExecutor(max_workers=10) as executor:
        args_list = [(access_token, email) for email in emails]
        results = list(executor.map(fetch_single_email_stats, args_list))
    return [result for result in results if result is not None]

# ===== Google Integration Routes =====
@app.route("/google-auth", methods=["GET"])
def google_auth():
    try:
        # Store current token in session
        token = request.headers.get("Authorization")
        if token:
            session['pardot_token'] = token
        
        auth_url, flow = google_integration.get_auth_url()
        return jsonify({"auth_url": auth_url})
    except Exception as e:
        print(f"Google auth error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/google-callback")
def google_callback():
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({"error": "No code received"}), 400
        
        # Create new flow for callback
        _, flow = google_integration.get_auth_url()
        credentials = google_integration.get_credentials(code, flow)
        
        # Store credentials in session
        session['google_credentials'] = credentials.to_json()
        
        # Get stored token from session
        stored_token = session.get('pardot_token', '')
        redirect_url = f'http://localhost:5173/dashboard?google_auth=success'
        if stored_token:
            redirect_url += f'&token={stored_token.replace("Bearer ", "").replace("bearer ", "")}'
        return redirect(redirect_url)
    except Exception as e:
        print(f"Google callback error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/export-to-sheets", methods=["POST"])
def export_to_sheets():
    access_token = request.headers.get("Authorization")
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    if not session.get('google_credentials'):
        return jsonify({"error": "Google authentication required"}), 401
    
    from google.oauth2.credentials import Credentials
    import json
    credentials = Credentials.from_authorized_user_info(
        json.loads(session['google_credentials'])
    )
    
    # Get email data
    if access_token.lower().startswith("bearer "):
        access_token = access_token[7:]
    
    day = request.json.get("day")
    month = request.json.get("month")
    year = request.json.get("year")
    title = request.json.get("title", "Email Stats")
    
    emails = fetch_all_mails(access_token, day=day, month=month, year=year)
    stats_list = fetch_email_stats_parallel(access_token, emails)
    
    # Create spreadsheet
    spreadsheet_id = google_integration.create_spreadsheet(credentials, title, stats_list)
    
    return jsonify({
        "success": True,
        "spreadsheet_id": spreadsheet_id,
        "url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
    })

@app.route("/export-to-drive", methods=["POST"])
def export_to_drive():
    if not session.get('google_credentials'):
        return jsonify({"error": "Google authentication required"}), 401
    
    from google.oauth2.credentials import Credentials
    import json
    credentials = Credentials.from_authorized_user_info(
        json.loads(session['google_credentials'])
    )
    
    spreadsheet_id = request.json.get("spreadsheet_id")
    filename = request.json.get("filename", "email_stats")
    
    if not spreadsheet_id:
        return jsonify({"error": "Spreadsheet ID required"}), 400
    
    # Export to Drive as PDF
    file_id = google_integration.export_to_drive(credentials, spreadsheet_id, filename)
    
    return jsonify({
        "success": True,
        "file_id": file_id,
        "url": f"https://drive.google.com/file/d/{file_id}"
    })

@app.route("/google-auth-status", methods=["GET"])
def google_auth_status():
    return jsonify({"authenticated": bool(session.get('google_credentials'))})

# ===== Form Stats Routes =====
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
            break
    
    return all_activities

def calculate_form_stats(form, activities_by_form):
    form_id = str(form["id"])
    form_activities = activities_by_form.get(form_id, [])
    
    # Activity types: 1=Click, 2=View, 3=Error, 4=Success (Form Submission), 6=Email Click
    views = [a for a in form_activities if int(a.get("type", 0)) == 2]
    submissions = [a for a in form_activities if int(a.get("type", 0)) == 4]
    # Include both type 1 (general clicks) and type 6 (email clicks) for comprehensive click tracking
    clicks = [a for a in form_activities if int(a.get("type", 0)) in [1, 6]]
    
    unique_views = len({a.get("visitor_id") or a.get("prospect_id") for a in views if a.get("visitor_id") or a.get("prospect_id")})
    unique_submissions = len({a.get("visitor_id") or a.get("prospect_id") for a in submissions if a.get("visitor_id") or a.get("prospect_id")})
    unique_clicks = len({a.get("visitor_id") or a.get("prospect_id") for a in clicks if a.get("visitor_id") or a.get("prospect_id")})
    
    # Pardot conversions = submissions that created prospects (have prospect_id)
    conversions = len([a for a in submissions if a.get("prospect_id")])
    
    return {
        "id": form_id,
        "name": form["name"],
        "views": len(views),
        "unique_views": unique_views,
        "submissions": len(submissions),
        "unique_submissions": unique_submissions,
        "clicks": len(clicks),
        "unique_clicks": unique_clicks,
        "conversions": conversions
    }

@app.route("/get-form-stats", methods=["GET"])
def get_form_stats():
    access_token = request.headers.get("Authorization")
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    if access_token.lower().startswith("bearer "):
        access_token = access_token[7:]
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Pardot-Business-Unit-Id": BUSINESS_UNIT_ID
    }
    
    try:
        # Parallel execution: Get forms and activities simultaneously
        with ThreadPoolExecutor(max_workers=2) as executor:
            forms_future = executor.submit(
                requests.get,
                "https://pi.pardot.com/api/v5/objects/forms",
                headers=headers,
                params={"fields": "id,name", "limit": 200}
            )
            activities_future = executor.submit(
                fetch_all_activities,
                headers
            )
            
            forms_response = forms_future.result()
            activities_response = activities_future.result()
        
        if forms_response.status_code != 200:
            return jsonify({"error": f"Error fetching forms: {forms_response.text}"}), 500
        
        forms = forms_response.json().get("values", [])
        activities = activities_response
        
        # Pre-group activities by form_id for O(1) lookup
        activities_by_form = defaultdict(list)
        for activity in activities:
            # Try multiple possible form ID fields
            form_id = str(activity.get("form_id", "")) or str(activity.get("form", {}).get("id", "")) or str(activity.get("details", ""))
            if form_id and form_id != "":
                activities_by_form[form_id].append(activity)
        
        # Calculate stats for all forms in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(calculate_form_stats, form, activities_by_form) for form in forms]
            form_stats = [future.result() for future in futures]
        
        return jsonify(form_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=4000, debug=True)