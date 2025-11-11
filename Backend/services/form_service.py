import requests
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict
from datetime import datetime, timedelta
from utils.auth_utils import get_credentials

def fetch_all_activities(headers):
    """Fetch all form activities"""
    all_activities = []
    limit = 200
    
    for offset in range(0, 10000, limit):
        response = requests.get(
            "https://pi.pardot.com/api/visitorActivity/version/4/do/query",
            headers=headers,
            params={
                "format": "json",
                "limit": limit,
                "offset": offset,
                "sort_by": "created_at",
                "sort_order": "descending",
                "form_only": "true"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            activities = data.get("result", {}).get("visitor_activity", [])
            if activities:
                all_activities.extend(activities)
            else:
                break
        else:
            print(f"Error fetching activities: {response.status_code} - {response.text}")
            break
    
    return all_activities




def calculate_form_stats(form, activities_by_form):
    """Calculate statistics for a single form"""
    form_id = str(form["id"])
    form_activities = activities_by_form.get(form_id, [])
    
    # Activity types: 2=View, 4=Success (Form Submission), 1,6=Clicks
    views = [a for a in form_activities if int(a.get("type", 0)) == 2]
    submissions = [a for a in form_activities if int(a.get("type", 0)) == 4]
    clicks = [a for a in form_activities if int(a.get("type", 0)) in [1, 6]]
    
    def get_unique_count(activities):
        return len({a.get("visitor_id") or a.get("prospect_id") for a in activities if a.get("visitor_id") or a.get("prospect_id")})
    
    # Calculate abandonment metrics
    total_views = len(views)
    total_submissions = len(submissions)
    abandoned = total_views - total_submissions if total_views > total_submissions else 0
    abandonment_rate = (abandoned / total_views * 100) if total_views > 0 else 0
    conversion_rate = (total_submissions / total_views * 100) if total_views > 0 else 0
    
    # Check if form is active (has activity in last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_activities = [a for a in form_activities if a.get("created_at") and 
                        datetime.fromisoformat(a["created_at"].replace('Z', '+00:00')) > thirty_days_ago]
    is_active = len(recent_activities) > 0
    
    return {
        "id": form_id,
        "name": form["name"],
        "views": total_views,
        "unique_views": get_unique_count(views),
        "submissions": total_submissions,
        "unique_submissions": get_unique_count(submissions),
        "abandoned": abandoned,
        "abandonment_rate": round(abandonment_rate, 2),
        "clicks": len(clicks),
        "unique_clicks": get_unique_count(clicks),
        "conversions": len([a for a in submissions if a.get("prospect_id")]),
        "conversion_rate": round(conversion_rate, 2),
        "is_active": is_active,
        "last_activity": max([a.get("created_at") for a in form_activities], default=None) if form_activities else None
    }


def get_form_stats(access_token):
    """Main function to get form statistics"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        print(f"Fetching forms and activities with headers: {headers}")
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            forms_future = executor.submit(
                requests.get,
                "https://pi.pardot.com/api/v5/objects/forms",
                headers=headers,
                params={"fields": "id,name", "limit": 200}
            )
            activities_future = executor.submit(fetch_all_activities, headers)
            
            forms_response = forms_future.result()
            activities = activities_future.result()
        
        print(f"Forms response status: {forms_response.status_code}")
        print(f"Activities count: {len(activities) if activities else 0}")
        
        if forms_response.status_code != 200:
            raise Exception(f"Error fetching forms: {forms_response.text}")
        
        forms = forms_response.json().get("values", [])
        print(f"Found {len(forms)} forms")
        
        # Group activities by form_id
        activities_by_form = defaultdict(list)
        for activity in activities:
            form_id = str(activity.get("form_id", "")) or str(activity.get("form", {}).get("id", ""))
            if form_id:
                activities_by_form[form_id].append(activity)
        
        print(f"Activities grouped by {len(activities_by_form)} forms")
        
        # Calculate stats in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(calculate_form_stats, form, activities_by_form) for form in forms]
            form_stats = [future.result() for future in futures]
        
        print(f"Calculated stats for {len(form_stats)} forms")
        return form_stats
    except Exception as e:
        print(f"Error in get_form_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e




def get_form_abandonment_analysis(access_token):
    """Analyze form abandonment patterns and issues"""
    try:
        form_stats = get_form_stats(access_token)
        return get_form_abandonment_analysis_from_cache(form_stats)
    except Exception as e:
        print(f"Error in get_form_abandonment_analysis: {str(e)}")
        raise e

def get_form_abandonment_analysis_from_cache(form_stats):
    """Analyze form abandonment using cached form stats"""
    # Categorize forms by abandonment rate
    high_abandonment = [f for f in form_stats if f["abandonment_rate"] > 70 and f["views"] > 10]
    medium_abandonment = [f for f in form_stats if 40 <= f["abandonment_rate"] <= 70 and f["views"] > 5]
    low_abandonment = [f for f in form_stats if f["abandonment_rate"] < 40 and f["views"] > 0]
    
    # Calculate overall metrics
    total_views = sum(f["views"] for f in form_stats)
    total_submissions = sum(f["submissions"] for f in form_stats)
    total_abandoned = sum(f["abandoned"] for f in form_stats)
    
    return {
        "summary": {
            "total_forms": len(form_stats),
            "total_views": total_views,
            "total_submissions": total_submissions,
            "total_abandoned": total_abandoned,
            "overall_abandonment_rate": round((total_abandoned / total_views * 100), 2) if total_views > 0 else 0,
            "overall_conversion_rate": round((total_submissions / total_views * 100), 2) if total_views > 0 else 0
        },
        "categories": {
            "high_abandonment": {
                "count": len(high_abandonment),
                "threshold": ">70%",
                "forms": high_abandonment
            },
            "medium_abandonment": {
                "count": len(medium_abandonment),
                "threshold": "40-70%",
                "forms": medium_abandonment
            },
            "low_abandonment": {
                "count": len(low_abandonment),
                "threshold": "<40%",
                "forms": low_abandonment
            }
        },
        "insights": {
            "forms_needing_attention": len(high_abandonment),
            "avg_abandonment_rate": round(sum(f["abandonment_rate"] for f in form_stats) / len(form_stats), 2) if form_stats else 0,
            "best_performing_form": min([f for f in form_stats if f["views"] > 0], key=lambda x: x["abandonment_rate"]) if [f for f in form_stats if f["views"] > 0] else None,
            "worst_performing_form": max([f for f in form_stats if f["views"] > 0], key=lambda x: x["abandonment_rate"]) if [f for f in form_stats if f["views"] > 0] else None
        }
    }




def get_active_inactive_forms(access_token):
    """Get categorized active and inactive forms"""
    try:
        form_stats = get_form_stats(access_token)
        return get_active_inactive_forms_from_cache(form_stats)
    except Exception as e:
        print(f"Error in get_active_inactive_forms: {str(e)}")
        raise e

def get_active_inactive_forms_from_cache(form_stats):
    """Get active/inactive forms using cached form stats"""
    active_forms = [form for form in form_stats if form["is_active"]]
    inactive_forms = [form for form in form_stats if not form["is_active"]]
    
    return {
        "active_forms": {
            "count": len(active_forms),
            "forms": active_forms
        },
        "inactive_forms": {
            "count": len(inactive_forms),
            "forms": inactive_forms
        },
        "summary": {
            "total_forms": len(form_stats),
            "active_percentage": round((len(active_forms) / len(form_stats) * 100), 2) if form_stats else 0,
            "avg_conversion_rate_active": round(sum(f["conversion_rate"] for f in active_forms) / len(active_forms), 2) if active_forms else 0,
            "avg_conversion_rate_inactive": round(sum(f["conversion_rate"] for f in inactive_forms) / len(inactive_forms), 2) if inactive_forms else 0
        }
    }