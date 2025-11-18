from flask import Blueprint, jsonify, session
from services.engagement_service import get_engagement_programs_analysis, get_engagement_programs_performance

engagement_bp = Blueprint('engagement', __name__)

# Import shared data_cache
from shared import data_cache

@engagement_bp.route("/get-engagement-programs-analysis", methods=["GET"])
def get_engagement_programs_analysis_route():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        analysis_data = get_engagement_programs_analysis(access_token)
        data_cache['engagement'][access_token] = analysis_data
        return jsonify(analysis_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/get-engagement-programs-performance", methods=["GET"])
def get_engagement_programs_performance_route():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "Access token required"}), 401
    
    try:
        cached_data = data_cache['engagement'].get(access_token)
        if cached_data:
            performance_data = cached_data
        else:
            performance_data = get_engagement_programs_performance(access_token)
        return jsonify(performance_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500