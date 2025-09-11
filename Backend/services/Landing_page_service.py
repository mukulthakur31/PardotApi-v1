import requests
from datetime import datetime, timedelta
from utils.auth_utils import get_credentials

def get_all_landing_pages(access_token):
    """Fetch all forms (which represent landing pages) using Pardot v5 API"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        response = requests.get(
            "https://pi.pardot.com/api/v5/objects/landing-pages",
            headers=headers,
            params={"fields": "id,name,url,createdAt,updatedAt,formId,vanityUrl,isDeleted", "limit": 200}
        )
        
        if response.status_code != 200:
            raise Exception(f"Error fetching forms: {response.text}")
        
        return response.json().get("values", [])
    except Exception as e:
        print(f"Error in get_all_landing_pages: {str(e)}")
        raise e

def get_custom_fields(access_token):
    """Fetch all custom fields using Pardot v5 API"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        response = requests.get(
            "https://pi.pardot.com/api/v5/objects/custom-fields",
            headers=headers,
            params={"fields": "id,name,fieldId,salesforceId,type,isRequired", "limit": 200}
        )
        
        if response.status_code != 200:
            # If customFields endpoint doesn't exist, return empty list
            return []
        
        return response.json().get("values", [])
    except Exception as e:
        print(f"Error in get_custom_fields: {str(e)}")
        return []

def get_form_fields(access_token, form_id):
    """Fetch form fields for a specific form"""
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
        response = requests.get(
            f"https://pi.pardot.com/api/v5/objects/forms/{form_id}/fields",
            headers=headers
        )
        
        if response.status_code != 200:
            return []
        
        return response.json().get("values", [])
    except Exception as e:
        print(f"Error fetching form fields for form {form_id}: {str(e)}")
        return []

def audit_field_mapping(custom_fields, forms_with_fields):
    """Comprehensive audit of field mapping issues"""
    mapping_issues = []
    crm_id_map = {}
    
    # Critical CRM fields that should be mapped
    critical_crm_fields = [
        'email', 'first_name', 'last_name', 'company', 'phone', 
        'lead_source', 'campaign_id', 'account_id', 'contact_id'
    ]
    
    # Check custom fields mapping
    for field in custom_fields:
        field_id = field.get('id')
        field_name = field.get('name', 'Unnamed')
        salesforce_id = field.get('salesforceId')
        field_type = field.get('type', 'unknown')
        is_required = field.get('isRequired', False)
        
        # Check for unmapped fields
        if not salesforce_id:
            severity = 'critical' if is_required else 'high'
            mapping_issues.append({
                'field_id': field_id,
                'field_name': field_name,
                'issue': 'Field not connected to Salesforce - missing CRM ID',
                'severity': severity,
                'type': 'unmapped_field',
                'details': f'Required field: {is_required}, Type: {field_type}'
            })
        else:
            # Track Salesforce IDs for duplicate detection
            if salesforce_id not in crm_id_map:
                crm_id_map[salesforce_id] = []
            crm_id_map[salesforce_id].append({
                'field_id': field_id,
                'field_name': field_name,
                'is_required': is_required
            })
    
    # Check for duplicate CRM mappings
    for salesforce_id, fields in crm_id_map.items():
        if len(fields) > 1:
            for field in fields:
                mapping_issues.append({
                    'field_id': field['field_id'],
                    'field_name': field['field_name'],
                    'issue': f'Duplicate CRM mapping - Salesforce ID {salesforce_id} used by {len(fields)} fields',
                    'severity': 'critical',
                    'type': 'duplicate_mapping',
                    'details': f'Conflicting fields: {", ".join([f["field_name"] for f in fields])}'
                })
    
    # Check forms for field mapping issues
    for form_data in forms_with_fields:
        form_id = form_data['form']['id']
        form_name = form_data['form']['name']
        form_fields = form_data['fields']
        
        # Check if form has email field (critical)
        has_email = any(f.get('fieldId') == 'email' or 'email' in f.get('name', '').lower() for f in form_fields)
        if not has_email:
            mapping_issues.append({
                'field_id': form_id,
                'field_name': form_name,
                'issue': 'Form missing email field - critical for lead capture',
                'severity': 'critical',
                'type': 'missing_critical_field',
                'details': 'Email field is required for proper lead tracking'
            })
        
        # Check for unmapped form fields
        for field in form_fields:
            field_name = field.get('name', 'Unnamed')
            field_id = field.get('fieldId')
            is_required = field.get('isRequired', False)
            
            if not field_id or field_id == 'custom':
                severity = 'high' if is_required else 'medium'
                mapping_issues.append({
                    'field_id': f"{form_id}_{field.get('id', 'unknown')}",
                    'field_name': f"{form_name} - {field_name}",
                    'issue': 'Form field not mapped to CRM field',
                    'severity': severity,
                    'type': 'unmapped_form_field',
                    'details': f'Form: {form_name}, Field: {field_name}, Required: {is_required}'
                })
    
    return mapping_issues

def get_landing_page_stats(access_token):
    """Get comprehensive landing page statistics with field mapping issues"""
    try:
        # Fetch landing pages and custom fields
        landing_pages = get_all_landing_pages(access_token)
        custom_fields = get_custom_fields(access_token)
        
        # Fetch form fields for forms associated with landing pages
        forms_with_fields = []
        for page in landing_pages:
            if page.get('formId') and not page.get('isDeleted'):
                form_fields = get_form_fields(access_token, page.get('formId'))
                forms_with_fields.append({
                    'form': {
                        'id': page.get('formId'),
                        'name': page.get('name', 'Unnamed'),
                        'landing_page_id': page.get('id')
                    },
                    'fields': form_fields
                })
        
        # Comprehensive field mapping audit
        field_mapping_audit = audit_field_mapping(custom_fields, forms_with_fields)
        
        # Check for recent activity (30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Analyze landing pages
        active_pages = []
        inactive_pages = []
        configuration_issues = []
        
        for page in landing_pages:
            # Skip deleted pages
            if page.get('isDeleted'):
                continue
            
            page_id = page.get('id')
            page_name = page.get('name', 'Unnamed')
            
            # Check for configuration issues
            if not page.get('name') or len(page.get('name', '')) < 3:
                configuration_issues.append({
                    'id': page_id,
                    'name': page_name,
                    'issue': 'Missing or short name (less than 3 characters)',
                    'severity': 'medium',
                    'type': 'configuration'
                })
            
            if not page.get('url') and not page.get('vanityUrl'):
                configuration_issues.append({
                    'id': page_id,
                    'name': page_name,
                    'issue': 'Missing URL - page not accessible',
                    'severity': 'critical',
                    'type': 'configuration'
                })
            
            if not page.get('formId'):
                configuration_issues.append({
                    'id': page_id,
                    'name': page_name,
                    'issue': 'No form associated - cannot capture leads',
                    'severity': 'critical',
                    'type': 'configuration'
                })
            
            # Check activity based on recent updates
            updated_at = page.get('updatedAt')
            is_active = False
            if updated_at:
                try:
                    update_date = datetime.fromisoformat(updated_at.replace('Z', '+00:00'))
                    is_active = update_date >= thirty_days_ago
                except:
                    pass
            
            page_data = {
                'id': page_id,
                'name': page_name,
                'url': page.get('url') or page.get('vanityUrl') or 'No URL',
                'form_id': page.get('formId'),
                'last_updated': updated_at,
                'has_issues': any(issue['id'] == page_id for issue in configuration_issues)
            }
            
            if is_active:
                active_pages.append(page_data)
            else:
                inactive_pages.append(page_data)
        
        # Categorize field mapping issues by severity
        critical_issues = [issue for issue in field_mapping_audit if issue['severity'] == 'critical']
        high_issues = [issue for issue in field_mapping_audit if issue['severity'] == 'high']
        medium_issues = [issue for issue in field_mapping_audit if issue['severity'] == 'medium']
        
        return {
            'active_forms': active_pages,
            'inactive_forms': inactive_pages,
            'field_mapping_issues': field_mapping_audit,
            'total_landing_pages': len([p for p in landing_pages if not p.get('isDeleted')]),
            'total_custom_fields': len(custom_fields),
            'total_mapping_issues': len(field_mapping_audit)
        }
        
    except Exception as e:
        print(f"Error in get_landing_page_stats: {str(e)}")
        raise e

