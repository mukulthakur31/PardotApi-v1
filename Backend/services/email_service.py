import requests
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
from utils.auth_utils import get_credentials

def fetch_all_mails(access_token, fields="id,name,subject,createdAt", day=None, month=None, year=None):
    """Fetch all emails with optional date filtering"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        print(f"Fetching mails with headers: {headers}")
        
        # Calculate date threshold
        if day and month and year:
            try:
                start_date = datetime(int(year), int(month), int(day), tzinfo=timezone.utc)
                print(f"Using date filter: {start_date}")
            except ValueError as e:
                print(f"Invalid date parameters: {e}")
                return []
        else:
            now = datetime.now(timezone.utc)
            start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)
            print(f"Using default date filter: {start_date}")

        date_threshold = start_date.isoformat().replace("+00:00", "Z")
        print(f"Date threshold: {date_threshold}")
        
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
                if email_date >= date_threshold:
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

def get_email_stats(access_token, day=None, month=None, year=None):
    """Main function to get email statistics"""
    try:
        get_credentials()  # Validate credentials exist
        
        print(f"Fetching emails with params: day={day}, month={month}, year={year}")
        
        emails = fetch_all_mails(access_token, day=day, month=month, year=year)
        print(f"Found {len(emails)} emails")
        
        stats_list = fetch_email_stats_parallel(access_token, emails)
        print(f"Processed stats for {len(stats_list)} emails")
        
        return stats_list
    except Exception as e:
        print(f"Error in get_email_stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise e