from flask import Blueprint, redirect, request, jsonify, session
import requests
from config.settings import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET, BUSINESS_UNIT_ID

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login")
def login():
    try:
        auth_url = (
            "https://login.salesforce.com/services/oauth2/authorize"
            f"?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}"
            "&scope=api%20pardot_api%20full%20refresh_token"
        )
        return redirect(auth_url)
    except Exception:
        return jsonify({"error": "Please setup credentials first"}), 400

@auth_bp.route("/callback")
def callback():
    auth_code = request.args.get("code")
    if not auth_code:
        return jsonify({"error": "No code received"}), 400

    try:
        client_secret = CLIENT_SECRET
        if not client_secret:
            return jsonify({"error": "OAuth session expired"}), 400
            
        token_response = requests.post("https://login.salesforce.com/services/oauth2/token", data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": CLIENT_ID,
            "client_secret": client_secret,
            "redirect_uri": REDIRECT_URI
        })

        if token_response.status_code != 200:
            return jsonify({"error": token_response.text}), 500

        access_token = token_response.json().get("access_token")
        session['access_token'] = access_token
        return redirect("http://localhost:5173/dashboard")
    except Exception:
        return jsonify({"error": "No credentials found"}), 400

@auth_bp.route("/get-token", methods=["GET"])
def get_token():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "No access token found"}), 401
    
    return jsonify({"token": access_token})

@auth_bp.route("/validate-token", methods=["GET"])
def validate_token():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"valid": False, "error": "No token provided"}), 401
    
    try:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": BUSINESS_UNIT_ID
        }
        
        response = requests.get(
            "https://pi.pardot.com/api/v5/objects/prospects",
            headers=headers,
            params={"fields": "id", "limit": 1}
        )
        
        if response.status_code == 401:
            return jsonify({"valid": False, "error": "Token expired"}), 401
        elif response.status_code == 200:
            return jsonify({"valid": True})
        else:
            return jsonify({"valid": False, "error": "Token validation failed"}), 400
            
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 500