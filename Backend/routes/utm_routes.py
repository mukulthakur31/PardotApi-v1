from flask import Blueprint, request, jsonify, session
from services.utm_service import get_utm_analysis, get_campaign_engagement_analysis

utm_bp = Blueprint('utm', __name__)

@utm_bp.route("/get-utm-analysis", methods=["GET"])
def get_utm_analysis_route():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        analysis_data = get_utm_analysis(access_token)
        return jsonify(analysis_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@utm_bp.route("/get-campaign-engagement-analysis", methods=["GET"])
def get_campaign_engagement_analysis_route():
    try:
        months = request.args.get("months", "6")
        analysis_data = get_campaign_engagement_analysis(months)
        return jsonify(analysis_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500