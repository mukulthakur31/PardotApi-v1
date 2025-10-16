import requests
from datetime import datetime, timezone, timedelta
from concurrent.futures import ThreadPoolExecutor
from utils.auth_utils import get_credentials

def fetch_all_mails(access_token, fields="id,name,subject,createdAt", filter_type=None, start_date=None, end_date=None):
    """Fetch all emails with custom date filtering"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        print(f"Fetching mails with filter_type: {filter_type}, start_date: {start_date}, end_date: {end_date}")
        
        # Calculate date range based on filter type
        now = datetime.now(timezone.utc)
        
        if filter_type == "custom" and start_date and end_date:
            try:
                filter_start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                filter_end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                print(f"Using custom date range: {filter_start} to {filter_end}")
            except ValueError as e:
                print(f"Invalid custom date parameters: {e}")
                return []
        elif filter_type == "last_7_days":
            filter_start = now - timedelta(days=7)
            filter_end = now
        elif filter_type == "last_30_days":
            filter_start = now - timedelta(days=30)
            filter_end = now
        elif filter_type == "last_3_months":
            filter_start = now - timedelta(days=90)
            filter_end = now
        elif filter_type == "last_6_months":
            filter_start = now - timedelta(days=180)
            filter_end = now
        else:
            # Default to current year
            filter_start = datetime(now.year, 1, 1, tzinfo=timezone.utc)
            filter_end = now
            print(f"Using default date filter: {filter_start} to {filter_end}")

        start_threshold = filter_start.isoformat().replace("+00:00", "Z")
        end_threshold = filter_end.isoformat().replace("+00:00", "Z")
        print(f"Date range: {start_threshold} to {end_threshold}")
        
        # Fetch emails with pagination
        all_mails = []
        url = "https://pi.pardot.com/api/v5/objects/list-emails"
        params = {"fields": fields, "limit": 200}
        
        while url:
            print(f"Fetching from URL: {url}")
            response = requests.get(url, headers=headers, params=params if url.endswith("list-emails") else None)
            
            print(f"Response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"API Error: {response.text}")
                break

            data = response.json()
            emails = data.get("values", [])
            print(f"Got {len(emails)} emails from API")
            
            for email in emails:
                email_date = email.get("createdAt", "")
                if start_threshold <= email_date <= end_threshold:
                    all_mails.append(email)

            url = data.get("nextPageUrl")
            print(f"Next URL: {url}")

        print(f"Total emails after filtering: {len(all_mails)}")
        return all_mails
        
    except Exception as e:
        print(f"Error in fetch_all_mails: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def fetch_single_email_stats(args):
    """Fetch stats for a single email"""
    try:
        access_token, email, business_unit_id = args
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": business_unit_id
        }

        email_id = email.get('id')
        if not email_id:
            print(f"No ID found for email: {email}")
            return None
            
        response = requests.get(f"https://pi.pardot.com/api/v5/objects/list-emails/{email_id}/stats", headers=headers)
        
        if response.status_code != 200:
            print(f"Failed to get stats for email {email_id}: {response.status_code} - {response.text}")
            return None
        
        return {
            "id": email_id,
            "name": email.get("name", "Unknown"),
            "subject": email.get("subject", ""),
            "createdat": email.get("createdAt", ""),
            "stats": response.json()
        }
        
    except Exception as e:
        print(f"Error processing email stats: {str(e)}")
        return None

def fetch_email_stats_parallel(access_token, emails):
    """Fetch email stats in parallel for better performance"""
    if not emails:
        print("No emails to process")
        return []
        
    try:
        credentials = get_credentials()
        business_unit_id = credentials['business_unit_id']
        
        print(f"Processing {len(emails)} emails with business_unit_id: {business_unit_id}")
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            args_list = [(access_token, email, business_unit_id) for email in emails]
            results = list(executor.map(fetch_single_email_stats, args_list))
        
        valid_results = [result for result in results if result is not None]
        print(f"Got valid stats for {len(valid_results)} out of {len(emails)} emails")
        return valid_results
        
    except Exception as e:
        print(f"Error in fetch_email_stats_parallel: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

def get_email_stats(access_token, filter_type=None, start_date=None, end_date=None):
    """Main function to get email statistics"""
    try:
        get_credentials()  # Validate credentials exist
        
        print(f"Fetching emails with params: filter_type={filter_type}, start_date={start_date}, end_date={end_date}")
        
        emails = fetch_all_mails(access_token, filter_type=filter_type, start_date=start_date, end_date=end_date)
        print(f"Found {len(emails)} emails")
        
        stats_list = fetch_email_stats_parallel(access_token, emails)
        print(f"Processed stats for {len(stats_list)} emails")
        
        return stats_list
    except Exception as e:
        print(f"Error in get_email_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e