from flask import Blueprint, request, jsonify, g
from services.form_service import (
    get_form_stats, get_active_inactive_forms, get_form_abandonment_analysis, 
    get_active_inactive_forms_from_cache, get_form_abandonment_analysis_from_cache,
    get_date_range_from_filter
)
from middleware.auth_middleware import require_auth

form_bp = Blueprint('form', __name__)

# Import shared data_cache
from shared import data_cache

@form_bp.route("/get-form-stats", methods=["GET"])
@require_auth
def get_form_stats_route():
    
    try:
        filter_type = request.args.get("filter_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if filter_type and not start_date and not end_date:
            start_date, end_date = get_date_range_from_filter(filter_type)
        
        form_stats = get_form_stats(g.access_token, start_date, end_date)
        data_cache['forms'][g.access_token] = form_stats
        return jsonify(form_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route("/get-active-inactive-forms", methods=["GET"])
@require_auth
def get_active_inactive_forms_route():
    
    try:
        cached_forms = data_cache['forms'].get(g.access_token)
        if cached_forms:
            forms_data = get_active_inactive_forms_from_cache(cached_forms)
        else:
            forms_data = get_active_inactive_forms(g.access_token)
        return jsonify(forms_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route("/get-form-abandonment-analysis", methods=["GET"])
@require_auth
def get_form_abandonment_analysis_route():
    
    try:
        filter_type = request.args.get("filter_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if filter_type and not start_date and not end_date:
            start_date, end_date = get_date_range_from_filter(filter_type)
        
        cached_forms = data_cache['forms'].get(g.access_token)
        if cached_forms and not (start_date or end_date):
            abandonment_data = get_form_abandonment_analysis_from_cache(cached_forms)
        else:
            abandonment_data = get_form_abandonment_analysis(g.access_token, start_date, end_date)
        return jsonify(abandonment_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@form_bp.route("/get-filtered-form-stats", methods=["GET"])
@require_auth
def get_filtered_form_stats_route():
    
    try:
        filter_type = request.args.get("filter_type")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        if filter_type and not start_date and not end_date:
            start_date, end_date = get_date_range_from_filter(filter_type)
        
        filtered_stats = get_form_stats(g.access_token, start_date, end_date)
        return jsonify(filtered_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500