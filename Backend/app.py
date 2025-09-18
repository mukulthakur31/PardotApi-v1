from flask import Flask, redirect, request, jsonify, send_file, session
import requests
from flask_cors import CORS

# Import configuration
from config.settings import REDIRECT_URI, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SECRET_KEY

# Import utilities
from utils.auth_utils import get_credentials, extract_access_token

# Import services
from services.email_service import get_email_stats
from services.form_service import get_form_stats, get_active_inactive_forms, get_form_abandonment_analysis
from services.Landing_page_service import get_landing_page_stats
from services.prospect_service import get_prospect_health, fetch_all_prospects, find_duplicate_prospects, find_inactive_prospects, find_missing_critical_fields, find_scoring_inconsistencies
from services.pdf_service import create_professional_pdf_report, create_form_pdf_report, create_prospect_pdf_report, create_comprehensive_summary_pdf

# Import Google integration
from google_integration import GoogleIntegration

app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(app, 
     origins=["http://localhost:5173"], 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Google Integration
google_integration = GoogleIntegration(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

# ===== Authentication Routes =====
@app.route("/setup", methods=["POST", "OPTIONS"])
def setup():
    if request.method == "OPTIONS":
        return "", 200
    
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
            "&scope=api%20pardot_api%20full%20refresh_token"
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

@app.route("/get-token", methods=["GET"])
def get_token():
    """Secure endpoint to get access token from session"""
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "No access token found"}), 401
    return jsonify({"token": access_token})

# ===== Email Routes =====
@app.route("/get-email-stats", methods=["GET"])
def get_email_stats_route():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401

    try:
        day = request.args.get("day")
        month = request.args.get("month")
        year = request.args.get("year")
        
        stats_list = get_email_stats(access_token, day, month, year)
        return jsonify(stats_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== Form Routes =====
@app.route("/get-form-stats", methods=["GET"])
def get_form_stats_route():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        form_stats = get_form_stats(access_token)
        return jsonify(form_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-active-inactive-forms", methods=["GET"])
def get_active_inactive_forms_route():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        forms_data = get_active_inactive_forms(access_token)
        return jsonify(forms_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-form-abandonment-analysis", methods=["GET"])
def get_form_abandonment_analysis_route():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        abandonment_data = get_form_abandonment_analysis(access_token)
        return jsonify(abandonment_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== Landing Page Routes =====
@app.route("/get-landing-page-stats", methods=["GET"])
def get_landing_page_stats_route():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        landing_page_stats = get_landing_page_stats(access_token)
        return jsonify(landing_page_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-landing-page-field-issues", methods=["GET"])
def get_landing_page_field_issues():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        severity = request.args.get("severity", "all").lower()
        issue_type = request.args.get("type", "all").lower()
        
        landing_page_stats = get_landing_page_stats(access_token)
        field_issues = landing_page_stats.get('field_mapping_issues', {})
        
        if severity != "all" and severity in field_issues:
            filtered_issues = field_issues[severity]
        else:
            filtered_issues = field_issues.get('all_issues', [])
        
        if issue_type != "all":
            filtered_issues = [issue for issue in filtered_issues if issue.get('type') == issue_type]
        
        return jsonify({
            "field_mapping_issues": filtered_issues,
            "configuration_issues": landing_page_stats.get('configuration_issues', []),
            "summary": field_issues.get('summary', {}),
            "filters_applied": {
                "severity": severity,
                "type": issue_type
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ===== Prospect Routes =====
@app.route("/get-prospect-health", methods=["GET"])
def get_prospect_health_route():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        health_data = get_prospect_health(access_token)
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

# ===== PDF Routes =====
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

@app.route("/download-summary-pdf", methods=["POST"])
def download_summary_pdf():
    """Generate comprehensive summary PDF with all data"""
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        # Fetch all data
        email_stats = get_email_stats(access_token)
        form_stats = get_form_stats(access_token)
        prospect_health = get_prospect_health(access_token)
        landing_page_stats = get_landing_page_stats(access_token)
        
        # Generate comprehensive PDF
        buffer = create_comprehensive_summary_pdf(email_stats, form_stats, prospect_health, landing_page_stats)
        
        return send_file(buffer, as_attachment=True, download_name="pardot_comprehensive_report.pdf", mimetype="application/pdf")
    except Exception as e:
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

if __name__ == "__main__":
    app.run(port=4001, debug=True)