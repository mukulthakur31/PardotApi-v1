import requests
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict
from datetime import datetime, timedelta
from utils.auth_utils import get_credentials

def fetch_all_activities(headers):
    """Fetch all visitor activities"""
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

def calculate_landing_page_stats(page, activities_by_page):
    """Calculate statistics for a single landing page"""
    page_id = str(page["id"])
    page_activities = activities_by_page.get(page_id, [])
    
    # Activity types: 2=View, 4=Success (Form Submission), 1,6=Clicks
    views = [a for a in page_activities if int(a.get("type", 0)) == 2]
    submissions = [a for a in page_activities if int(a.get("type", 0)) == 4]
    clicks = [a for a in page_activities if int(a.get("type", 0)) in [1, 6]]
    
    # Check if landing page is active (has activity in last 3 months)
    three_months_ago = datetime.now() - timedelta(days=90)
    recent_activities = [a for a in page_activities if a.get("created_at") and 
                        datetime.fromisoformat(a["created_at"].replace('Z', '+00:00')) > three_months_ago]
    is_active = len(recent_activities) > 0
    
    return {
        "id": page_id,
        "name": page["name"],
        "url": page.get("url") or page.get("vanityUrl") or "No URL",
        "form_id": page.get("formId"),
        "views": len(views),
        "submissions": len(submissions),
        "clicks": len(clicks),
        "total_activities": len(page_activities),
        "recent_activities": len(recent_activities),
        "is_active": is_active,
        "last_activity": max([a.get("created_at") for a in page_activities], default=None) if page_activities else None
    }

def get_landing_page_stats(access_token):
    """Get landing page statistics based on visitor activity (last 3 months)"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        print("Fetching landing pages and activities...")
        
        with ThreadPoolExecutor(max_workers=2) as executor:
            pages_future = executor.submit(
                requests.get,
                "https://pi.pardot.com/api/v5/objects/landing-pages",
                headers=headers,
                params={"fields": "id,name,url,vanityUrl,formId,isDeleted", "limit": 200}
            )
            activities_future = executor.submit(fetch_all_activities, headers)
            
            pages_response = pages_future.result()
            activities = activities_future.result()
        
        if pages_response.status_code != 200:
            raise Exception(f"Error fetching landing pages: {pages_response.text}")
        
        pages = pages_response.json().get("values", [])
        # Filter out deleted pages
        pages = [p for p in pages if not p.get('isDeleted')]
        
        print(f"Found {len(pages)} active landing pages")
        print(f"Found {len(activities)} visitor activities")
        
        # Group activities by landing page ID
        activities_by_page = defaultdict(list)
        for activity in activities:
            page_id = str(activity.get("landing_page_id", "")) or str(activity.get("landing_page", {}).get("id", ""))
            if page_id:
                activities_by_page[page_id].append(activity)
        
        # Calculate stats for each landing page
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(calculate_landing_page_stats, page, activities_by_page) for page in pages]
            page_stats = [future.result() for future in futures]
        
        # Categorize pages as active/inactive
        active_pages = [page for page in page_stats if page["is_active"]]
        inactive_pages = [page for page in page_stats if not page["is_active"]]
        
        return {
            "criteria": "Landing pages with visitor activity (views, clicks, submissions) in last 3 months are considered active",
            "active_pages": {
                "count": len(active_pages),
                "description": "Pages with visitor activity in the last 3 months",
                "pages": active_pages
            },
            "inactive_pages": {
                "count": len(inactive_pages),
                "description": "Pages with no visitor activity in the last 3 months",
                "pages": inactive_pages
            },
            "summary": {
                "total_pages": len(page_stats),
                "active_percentage": round((len(active_pages) / len(page_stats) * 100), 2) if page_stats else 0,
                "inactive_percentage": round((len(inactive_pages) / len(page_stats) * 100), 2) if page_stats else 0,
                "total_activities": sum(p["total_activities"] for p in page_stats),
                "total_recent_activities": sum(p["recent_activities"] for p in active_pages)
            }
        }
        
    except Exception as e:
        print(f"Error in get_landing_page_stats: {str(e)}")
        raise e

