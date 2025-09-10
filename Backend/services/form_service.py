import requests
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict
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
                "sort_order": "descending"
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
    
    return {
        "id": form_id,
        "name": form["name"],
        "views": len(views),
        "unique_views": get_unique_count(views),
        "submissions": len(submissions),
        "unique_submissions": get_unique_count(submissions),
        "clicks": len(clicks),
        "unique_clicks": get_unique_count(clicks),
        "conversions": len([a for a in submissions if a.get("prospect_id")])
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