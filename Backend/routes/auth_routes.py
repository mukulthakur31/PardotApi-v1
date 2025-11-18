from flask import Blueprint, redirect, request, jsonify, make_response
import jwt
import time
from config.settings import REDIRECT_URI, CLIENT_ID, CLIENT_SECRET, SECRET_KEY
from services.salesforce_auth import SalesforceAuthService

auth_bp = Blueprint('auth', __name__)
auth_service = SalesforceAuthService()

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
        # Get token and store in auth service class
        token_data = auth_service.exchange_code_for_token(auth_code)
        access_token = token_data.get("access_token")
        
        # Create JWT with token reference
        jwt_payload = {
            'token_ref': access_token[:10],  # First 10 chars as reference
            'exp': int(time.time()) + (8 * 3600),  # 8 hours
            'iat': int(time.time())
        }
        
        jwt_token = jwt.encode(jwt_payload, SECRET_KEY, algorithm='HS256')
        
        # Redirect with JWT cookie
        response = make_response(redirect("http://localhost:5173/dashboard"))
        response.set_cookie(
            'auth_token',
            jwt_token,
            max_age=8*3600,
            httponly=True,
            secure=False,  # Set True in production
            samesite='Lax'
        )
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route("/check-auth")
def check_auth():
    """Check if user is authenticated"""
    jwt_token = request.cookies.get('auth_token')
    
    if not jwt_token:
        return jsonify({"authenticated": False}), 401
    
    try:
        # Decode JWT token
        payload = jwt.decode(jwt_token, SECRET_KEY, algorithms=['HS256'])
        token_ref = payload.get('token_ref')
        
        # Get actual token from auth service class
        actual_token = auth_service.get_valid_access_token()
        
        # Match token reference with actual token
        if not actual_token or not actual_token.startswith(token_ref):
            return jsonify({"authenticated": False}), 401
        
        return jsonify({"authenticated": True})
        
    except jwt.ExpiredSignatureError:
        return jsonify({"authenticated": False, "error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"authenticated": False, "error": "Invalid token"}), 401
    except Exception:
        return jsonify({"authenticated": False}), 401

@auth_bp.route("/logout")
def logout():
    response = make_response(jsonify({"message": "Logged out"}))
    response.set_cookie('auth_token', '', expires=0)
    return response