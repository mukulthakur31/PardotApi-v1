from flask import Blueprint, request, jsonify, session
from services.email_service import get_email_stats

email_bp = Blueprint('email', __name__)

@email_bp.route("/get-email-stats", methods=["GET"])
def get_email_stats_route():
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401

    try:
        filter_type = request.args.get("filter_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        stats_list = get_email_stats(access_token, filter_type, start_date, end_date)
        return jsonify(stats_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500