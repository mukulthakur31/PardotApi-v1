from flask import Blueprint, request, jsonify, redirect, session
from google_integration import GoogleIntegration
from config.settings import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

google_bp = Blueprint('google', __name__)

# Initialize Google Integration
google_integration = GoogleIntegration(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

@google_bp.route("/google-auth", methods=["GET"])
def google_auth():
    try:
        token = request.headers.get("Authorization")
        if token:
            session['pardot_token'] = token
        
        auth_url, flow = google_integration.get_auth_url()
        return jsonify({"auth_url": auth_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@google_bp.route("/google-callback")
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

@google_bp.route("/export-to-sheets", methods=["POST"])
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

@google_bp.route("/google-auth-status", methods=["GET"])
def google_auth_status():
    return jsonify({"authenticated": bool(session.get('google_credentials'))})