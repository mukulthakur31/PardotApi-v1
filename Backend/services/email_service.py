import requests
from datetime import datetime, timezone, timedelta
from collections import defaultdict
from utils.auth_utils import get_credentials

def fetch_all_mails(access_token, fields="id,name,subject,createdAt"):
    """Fetch all emails without date filtering"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        all_mails = []
        url = "https://pi.pardot.com/api/v5/objects/list-emails"
        params = {"fields": fields, "limit": 200}
        
        while url:
            response = requests.get(url, headers=headers, params=params if url.endswith("list-emails") else None)
            
            if response.status_code != 200:
                print(f"API Error: {response.text}")
                break

            data = response.json()
            emails = data.get("values", [])
            all_mails.extend(emails)
            url = data.get("nextPageUrl")

        return all_mails
        
    except Exception as e:
        print(f"Error in fetch_all_mails: {str(e)}")
        return []

def fetch_visitor_activities(access_token, filter_start=None, filter_end=None):
    """Fetch email visitor activities using v4 API with email_only parameter"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        all_activities = []
        offset = 0
        limit = 200
        
        while True:
            params = {
                "format": "json",
                "limit": limit,
                "offset": offset,
                "sort_by": "created_at",
                "sort_order": "descending",
                "email_only": "true"
            }
            
            if filter_start:
                params["created_after"] = filter_start
            if filter_end:
                params["created_before"] = filter_end
            
            response = requests.get(
                "https://pi.pardot.com/api/visitorActivity/version/4/do/query", 
                 headers=headers, params=params
                 )
            
            if response.status_code != 200:
                print(f"API Error: {response.text}")
                break
            data = response.json()
            page_activities = data.get("result", {}).get("visitor_activity", [])


            if not page_activities:
                break

            all_activities.extend(page_activities)
            print(f"Fetched {len(page_activities)} activities, total: {len(all_activities)}")
            offset += limit

           
            
        return all_activities
        
    except Exception as e:
        print(f"Error fetching visitor activities: {str(e)}")
        return []

def calculate_stats_from_activities(activities_by_email):
    """Calculate email stats from visitor activities grouped by email"""
    email_stats = {}
    
    for email_id, activities in activities_by_email.items():
        stats = {
            "sent": 0,
            "delivered": 0,
            "opened": 0,
            "clicked": 0,
            "bounced": 0,
            "unsubscribed": 0,
            "optedOut": 0
        }
        
        unique_opens = set()
        unique_clicks = set()
        
        for activity in activities:
            try:
                activity_type = int(activity.get("type", 0))
                visitor_id = activity.get("visitor_id") or activity.get("prospect_id")
                
                if activity_type == 6:  # Sent
                    stats["sent"] += 1
                elif activity_type == 1:  # Click (Email Tracker)
                    if visitor_id:
                        unique_clicks.add(visitor_id)
                elif activity_type == 11:  # Open
                    if visitor_id:
                        unique_opens.add(visitor_id)
                elif activity_type in [12, 35]:  # Unsubscribe_Open, Indirect_Unsubscribe_Open
                    stats["unsubscribed"] += 1
                elif activity_type in [13, 36]:  # Bounce, Indirect_Bounce
                    stats["bounced"] += 1
                elif activity_type == 14:  # Spam_Complaint
                    stats["bounced"] += 1
                elif activity_type in [16, 37]:  # Opt_In, Indirect_Opt_In
                    stats["optedOut"] += 1
                elif activity_type == 17:  # Third_Party_Click
                    if visitor_id:
                        unique_clicks.add(visitor_id)
            except (ValueError, TypeError):
                continue
        
        stats["opened"] = len(unique_opens)
        stats["clicked"] = len(unique_clicks)
        
        # Calculate delivered as sent minus bounces (Pardot's logic)
        stats["delivered"] = stats["sent"] - stats["bounced"]
        
        # Debug output for first email
        if len(email_stats) == 0:
            activity_types = [activity.get('type') for activity in activities]
            print(f"Email {email_id}: {len(activities)} activities, types: {activity_types}, stats: {stats}")
        
        email_stats[email_id] = stats
    
    return email_stats

def fetch_official_email_stats(access_token, email_id):
    """Fetch official stats from Pardot stats endpoint for comparison"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        response = requests.get(f"https://pi.pardot.com/api/v5/objects/list-emails/{email_id}/stats", headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception as e:
        print(f"Error fetching official stats: {str(e)}")
        return None

def get_email_stats(access_token, filter_type=None, start_date=None, end_date=None):
    """Main function to get email statistics using visitor activities"""
    try:
        get_credentials()
        
        # Calculate date range for activity filtering
        now = datetime.now(timezone.utc)
        
        if filter_type == "custom" and start_date and end_date:
            filter_start = datetime.fromisoformat(start_date.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
            filter_end = datetime.fromisoformat(end_date.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
        elif filter_type == "last_7_days":
            filter_start = (now - timedelta(days=7)).strftime('%Y-%m-%d %H:%M:%S')
            filter_end = now.strftime('%Y-%m-%d %H:%M:%S')
        elif filter_type == "last_30_days":
            filter_start = (now - timedelta(days=30)).strftime('%Y-%m-%d %H:%M:%S')
            filter_end = now.strftime('%Y-%m-%d %H:%M:%S')
        elif filter_type == "last_3_months":
            filter_start = (now - timedelta(days=90)).strftime('%Y-%m-%d %H:%M:%S')
            filter_end = now.strftime('%Y-%m-%d %H:%M:%S')
        elif filter_type == "last_6_months":
            filter_start = (now - timedelta(days=180)).strftime('%Y-%m-%d %H:%M:%S')
            filter_end = now.strftime('%Y-%m-%d %H:%M:%S')
        else:
            filter_start = None
            filter_end = None
        
        # Fetch all emails
        emails = fetch_all_mails(access_token)
        print(f"Found {len(emails)} emails")
        
        # Fetch visitor activities with date filter
        activities = fetch_visitor_activities(access_token, filter_start, filter_end)
        print(f"Found {len(activities)} activities")
        
        # Group activities by email ID
        activities_by_email = defaultdict(list)
        for activity in activities:
            email_id = activity.get("list_email_id")
            if email_id:
                activities_by_email[str(email_id)].append(activity)
        
        print(f"Activities grouped by {len(activities_by_email)} emails")
        
        # Debug: Print activity type distribution
        if activities:
            type_counts = {}
            for activity in activities[:100]:  # Check first 100 activities
                activity_type = activity.get('type')
                type_counts[activity_type] = type_counts.get(activity_type, 0) + 1
            print(f"Activity type distribution (first 100): {type_counts}")
            
            sample_activity = activities[0]
            print(f"Sample activity: type={sample_activity.get('type')}, type_name={sample_activity.get('type_name')}, list_email_id={sample_activity.get('list_email_id')}")
        
        # Calculate stats for each email
        email_stats = calculate_stats_from_activities(activities_by_email)
        
        # Debug: Compare with official stats for first few emails
        comparison_count = 0
        for email in emails[:5]:  # Compare first 5 emails
            email_id = str(email.get('id'))
            if email_id in email_stats:
                official_stats = fetch_official_email_stats(access_token, email_id)
                calculated_stats = email_stats[email_id]
                
                if official_stats:
                    print(f"\nEmail {email_id} comparison:")
                    
                    # Detailed field-by-field comparison
                    print(f"Sent: Official={official_stats.get('sent', 0)} vs Calculated={calculated_stats['sent']}")
                    print(f"Delivered: Official={official_stats.get('delivered', 0)} vs Calculated={calculated_stats['delivered']}")
                    print(f"Opens: Official={official_stats.get('uniqueOpens', 0)} vs Calculated={calculated_stats['opened']}")
                    print(f"Clicks: Official={official_stats.get('uniqueClicks', 0)} vs Calculated={calculated_stats['clicked']}")
                    print(f"Bounced: Official={official_stats.get('hardBounced', 0) + official_stats.get('softBounced', 0)} vs Calculated={calculated_stats['bounced']}")
                    print(f"OptOuts: Official={official_stats.get('optOuts', 0)} vs Calculated={calculated_stats['optedOut']}")
                    
                    # Check for mismatches
                    mismatches = []
                    if official_stats.get('sent', 0) != calculated_stats['sent']:
                        mismatches.append('sent')
                    if official_stats.get('delivered', 0) != calculated_stats['delivered']:
                        mismatches.append('delivered')
                    if official_stats.get('uniqueOpens', 0) != calculated_stats['opened']:
                        mismatches.append('opens')
                    if official_stats.get('uniqueClicks', 0) != calculated_stats['clicked']:
                        mismatches.append('clicks')
                    if (official_stats.get('hardBounced', 0) + official_stats.get('softBounced', 0)) != calculated_stats['bounced']:
                        mismatches.append('bounced')
                    if official_stats.get('optOuts', 0) != calculated_stats['optedOut']:
                        mismatches.append('optOuts')
                    
                    if mismatches:
                        print(f"❌ MISMATCHES: {mismatches}")
                    else:
                        print("✅ ALL MATCH")
                    
                    comparison_count += 1
                    
                if comparison_count >= 5:  # Limit comparisons
                    break
        
        # Combine email info with stats
        results = []
        for email in emails:
            email_id = str(email.get('id'))
            stats = email_stats.get(email_id, {
                "sent": 0, "delivered": 0, "opened": 0, "clicked": 0,
                "bounced": 0, "unsubscribed": 0, "optedOut": 0
            })
            
            results.append({
                "id": email_id,
                "name": email.get("name", "Unknown"),
                "subject": email.get("subject", ""),
                "createdat": email.get("createdAt", ""),
                "stats": stats
            })
        
        print(f"Processed stats for {len(results)} emails using visitor activities")
        return results
        
    except Exception as e:
        print(f"Error in get_email_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e