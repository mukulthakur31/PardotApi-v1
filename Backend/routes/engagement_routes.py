from flask import Blueprint, jsonify, g
from services.engagement_service import get_engagement_programs_analysis, get_engagement_programs_performance
from middleware.auth_middleware import require_auth

engagement_bp = Blueprint('engagement', __name__)

# Import shared data_cache
from shared import data_cache

@engagement_bp.route("/get-engagement-programs-analysis", methods=["GET"])
@require_auth
def get_engagement_programs_analysis_route():
    
    try:
        analysis_data = get_engagement_programs_analysis(g.access_token)
        data_cache['engagement'][g.access_token] = analysis_data
        return jsonify(analysis_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/get-engagement-programs-performance", methods=["GET"])
@require_auth
def get_engagement_programs_performance_route():
    
    try:
        cached_data = data_cache['engagement'].get(g.access_token)
        if cached_data:
            performance_data = cached_data
        else:
            performance_data = get_engagement_programs_performance(g.access_token)
        return jsonify(performance_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500