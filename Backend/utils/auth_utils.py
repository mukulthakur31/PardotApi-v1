from flask import session

def get_credentials():
    """Helper function to get credentials from session"""
    if 'pardot_credentials' not in session:
        raise Exception("No credentials found")
    return session['pardot_credentials']

def extract_access_token(auth_header):
    """Helper function to extract access token from Authorization header"""
    if not auth_header:
        return None
    return auth_header[7:] if auth_header.lower().startswith("bearer ") else auth_header