from flask import Flask, redirect, request, jsonify, send_file, session
import requests
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.barcharts import VerticalBarChart
import os
from io import BytesIO
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime, timezone
from google_integration import GoogleIntegration
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict

# Load environment variables
load_dotenv()

# Configuration
REDIRECT_URI = "http://localhost:4000/callback"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-here')
CORS(app, supports_credentials=True)

# Google Integration
google_integration = GoogleIntegration(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

# Helper function to get credentials
def get_credentials():
    if 'pardot_credentials' not in session:
        raise Exception("No credentials found")
    return session['pardot_credentials']

# Helper function to extract access token
def extract_access_token(auth_header):
    if not auth_header:
        return None
    return auth_header[7:] if auth_header.lower().startswith("bearer ") else auth_header

# ===== Routes =====
@app.route("/setup", methods=["POST"])
def setup():
    data = request.json
    required_fields = ['client_id', 'client_secret', 'business_unit_id']
    
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400
    
    # Store only necessary credentials, use client_secret immediately
    session['pardot_credentials'] = {
        'client_id': data['client_id'],
        'business_unit_id': data['business_unit_id']
    }
    # Store client_secret temporarily for OAuth flow only
    session['temp_client_secret'] = data['client_secret']
    
    return jsonify({"message": "Credentials stored successfully"})

@app.route("/login")
def login():
    try:
        credentials = get_credentials()
        auth_url = (
            "https://login.salesforce.com/services/oauth2/authorize"
            f"?response_type=code&client_id={credentials['client_id']}&redirect_uri={REDIRECT_URI}"
        )
        return redirect(auth_url)
    except Exception:
        return jsonify({"error": "Please setup credentials first"}), 400

@app.route("/callback")
def callback():
    auth_code = request.args.get("code")
    if not auth_code:
        return jsonify({"error": "No code received"}), 400

    try:
        credentials = get_credentials()
        client_secret = session.get('temp_client_secret')
        if not client_secret:
            return jsonify({"error": "OAuth session expired"}), 400
            
        token_response = requests.post("https://login.salesforce.com/services/oauth2/token", data={
            "grant_type": "authorization_code",
            "code": auth_code,
            "client_id": credentials['client_id'],
            "client_secret": client_secret,
            "redirect_uri": REDIRECT_URI
        })
        
        # Clear temporary client_secret after use
        session.pop('temp_client_secret', None)

        if token_response.status_code != 200:
            return jsonify({"error": token_response.text}), 500

        access_token = token_response.json().get("access_token")
        # Store token securely in session instead of URL
        session['access_token'] = access_token
        return redirect("http://localhost:5173/dashboard")
    except Exception:
        return jsonify({"error": "No credentials found"}), 400

@app.route("/get-email-stats", methods=["GET"])
def get_email_stats():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401

    try:
        get_credentials()  # Validate credentials exist
        day = request.args.get("day")
        month = request.args.get("month")
        year = request.args.get("year")
        
        emails = fetch_all_mails(access_token, day=day, month=month, year=year)
        stats_list = fetch_email_stats_parallel(access_token, emails)
        
        return jsonify(stats_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download-pdf", methods=["GET"])
def download_pdf():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401

    try:
        # Get date range parameters
        day = request.args.get("day")
        month = request.args.get("month")
        year = request.args.get("year")
        
        # Fetch email data
        emails = fetch_all_mails(access_token, day=day, month=month, year=year)
        stats_list = fetch_email_stats_parallel(access_token, emails)
        
        # Generate professional PDF
        buffer = create_professional_pdf_report(stats_list, day, month, year)
        
        return send_file(buffer, as_attachment=True, download_name="email_campaign_report.pdf", mimetype="application/pdf")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-form-stats", methods=["GET"])
def get_form_stats():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }
        
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
        
        if forms_response.status_code != 200:
            return jsonify({"error": f"Error fetching forms: {forms_response.text}"}), 500
        
        forms = forms_response.json().get("values", [])
        
        # Group activities by form_id
        activities_by_form = defaultdict(list)
        for activity in activities:
            form_id = str(activity.get("form_id", "")) or str(activity.get("form", {}).get("id", ""))
            if form_id:
                activities_by_form[form_id].append(activity)
        
        # Calculate stats in parallel
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(calculate_form_stats, form, activities_by_form) for form in forms]
            form_stats = [future.result() for future in futures]
        
        return jsonify(form_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===== Google Integration Routes =====
@app.route("/google-auth", methods=["GET"])
def google_auth():
    try:
        token = request.headers.get("Authorization")
        if token:
            session['pardot_token'] = token
        
        auth_url, flow = google_integration.get_auth_url()
        return jsonify({"auth_url": auth_url})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/google-callback")
def google_callback():
    try:
        code = request.args.get('code')
        if not code:
            return jsonify({"error": "No code received"}), 400
        
        _, flow = google_integration.get_auth_url()
        credentials = google_integration.get_credentials(code, flow)
        session['google_credentials'] = credentials.to_json()
        
        stored_token = session.get('pardot_token', '')
        redirect_url = 'http://localhost:5173/dashboard?google_auth=success'
        if stored_token:
            clean_token = stored_token.replace("Bearer ", "").replace("bearer ", "")
            redirect_url += f'&token={clean_token}'
        return redirect(redirect_url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/export-to-sheets", methods=["POST"])
def export_to_sheets():
    access_token = extract_access_token(request.headers.get("Authorization"))
    if not access_token:
        return jsonify({"error": "Access token is required"}), 401
    
    if not session.get('google_credentials'):
        return jsonify({"error": "Google authentication required"}), 401
    
    try:
        from google.oauth2.credentials import Credentials
        import json
        
        credentials = Credentials.from_authorized_user_info(
            json.loads(session['google_credentials'])
        )
        
        day = request.json.get("day")
        month = request.json.get("month")
        year = request.json.get("year")
        title = request.json.get("title", "Email Stats")
        
        emails = fetch_all_mails(access_token, day=day, month=month, year=year)
        stats_list = fetch_email_stats_parallel(access_token, emails)
        
        spreadsheet_id = google_integration.create_spreadsheet(credentials, title, stats_list)
        
        return jsonify({
            "success": True,
            "spreadsheet_id": spreadsheet_id,
            "url": f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/google-auth-status", methods=["GET"])
def google_auth_status():
    return jsonify({"authenticated": bool(session.get('google_credentials'))})

@app.route("/get-token", methods=["GET"])
def get_token():
    """Secure endpoint to get access token from session"""
    access_token = session.get('access_token')
    if not access_token:
        return jsonify({"error": "No access token found"}), 401
    return jsonify({"token": access_token})

# ===== Helper Functions =====
def fetch_all_mails(access_token, fields="id,name,subject,createdAt", day=None, month=None, year=None):
    credentials = get_credentials()
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Pardot-Business-Unit-Id": credentials['business_unit_id']
    }
    
    # Calculate date threshold
    if day and month and year:
        try:
            start_date = datetime(int(year), int(month), int(day), tzinfo=timezone.utc)
        except ValueError:
            return []
    else:
        now = datetime.now(timezone.utc)
        start_date = datetime(now.year, 1, 1, tzinfo=timezone.utc)

    date_threshold = start_date.isoformat().replace("+00:00", "Z")
    
    # Fetch emails with pagination
    all_mails = []
    url = "https://pi.pardot.com/api/v5/objects/list-emails"
    params = {"fields": fields, "limit": 200}
    
    while url:
        response = requests.get(url, headers=headers, params=params if url.endswith("list-emails") else None)
        if response.status_code != 200:
            break

        data = response.json()
        for email in data.get("values", []):
            if email.get("createdAt") > date_threshold:
                all_mails.append(email)

        url = data.get("nextPageUrl")

    return all_mails

def fetch_email_stats(access_token, email_id):
    try:
        credentials = get_credentials()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Pardot-Business-Unit-Id": credentials['business_unit_id']
        }

        response = requests.get(f"https://pi.pardot.com/api/v5/objects/list-emails/{email_id}/stats", headers=headers)
        return response.json() if response.status_code == 200 else None
    except Exception:
        return None

def fetch_single_email_stats(args):
    access_token, email, business_unit_id = args
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Pardot-Business-Unit-Id": business_unit_id
    }

    response = requests.get(f"https://pi.pardot.com/api/v5/objects/list-emails/{email['id']}/stats", headers=headers)
    if response.status_code != 200:
        return None
    
    return {
        "id": email["id"],
        "name": email["name"],
        "subject": email.get("subject"),
        "createdat": email["createdAt"],
        "stats": response.json()
    }

def fetch_email_stats_parallel(access_token, emails):
    if not emails:
        return []
        
    try:
        credentials = get_credentials()
        business_unit_id = credentials['business_unit_id']
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            args_list = [(access_token, email, business_unit_id) for email in emails]
            results = list(executor.map(fetch_single_email_stats, args_list))
        return [result for result in results if result is not None]
    except Exception:
        return []

def fetch_all_activities(headers):
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
            break
    
    return all_activities

def calculate_form_stats(form, activities_by_form):
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

# ===== Professional PDF Report Generator =====
def create_professional_pdf_report(stats_list, day=None, month=None, year=None):
    """Generate a modern, compact professional PDF report"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75*inch, bottomMargin=0.75*inch, leftMargin=0.75*inch, rightMargin=0.75*inch)
    
    content = []
    
    # 1. HEADER & SUMMARY (Single Page)
    content.extend(create_modern_header_and_summary(stats_list, day, month, year))
    
    # 2. EMAIL PERFORMANCE TABLE (Compact)
    if stats_list:
        content.append(Spacer(1, 0.3*inch))
        content.extend(create_compact_email_table(stats_list))
        
        # 3. KEY INSIGHTS & RECOMMENDATIONS
        content.append(Spacer(1, 0.3*inch))
        content.extend(create_insights_section(stats_list))
    else:
        content.append(Paragraph("No email data available for the selected period.", getSampleStyleSheet()['Normal']))
    
    doc.build(content)
    buffer.seek(0)
    return buffer

def create_modern_header_and_summary(stats_list, day, month, year):
    """Create modern header with integrated summary"""
    styles = getSampleStyleSheet()
    content = []
    
    # Modern Header
    header_style = ParagraphStyle('ModernHeader', parent=styles['Heading1'], 
                                fontSize=20, spaceAfter=8, alignment=1, 
                                textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    subtitle_style = ParagraphStyle('ModernSubtitle', parent=styles['Normal'], 
                                  fontSize=12, spaceAfter=16, alignment=1, 
                                  textColor=colors.HexColor('#6b7280'))
    
    content.append(Paragraph("📊 EMAIL CAMPAIGN PERFORMANCE REPORT", header_style))
    
    # Date and generation info
    if day and month and year:
        date_str = f"Campaign Data From: {month}/{day}/{year} onwards • Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    else:
        date_str = f"All Campaign Data • Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    
    content.append(Paragraph(date_str, subtitle_style))
    
    # Executive Summary Cards
    if stats_list:
        totals = calculate_totals(stats_list)
        
        # Create summary cards in a table format
        summary_cards = [
            ['📧 TOTAL CAMPAIGNS', '📤 EMAILS SENT', '📬 DELIVERED', '👁️ OPENS'],
            [f"{len(stats_list):,}", f"{totals['sent']:,}", f"{totals['delivered']:,}", f"{totals['opens']:,}"],
            ['🖱️ CLICKS', '📊 OPEN RATE', '🎯 CLICK RATE', '⚡ ENGAGEMENT'],
            [f"{totals['clicks']:,}", f"{totals['open_rate']:.1f}%", f"{totals['click_rate']:.1f}%", 
             f"{((totals['opens'] + totals['clicks']) / totals['delivered'] * 100):.1f}%" if totals['delivered'] > 0 else '0%']
        ]
        
        summary_table = Table(summary_cards, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        summary_table.setStyle(TableStyle([
            # Header row styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Values row styling
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#dbeafe')),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 14),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#1e40af')),
            
            # Second header row
            ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#10b981')),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.white),
            ('FONTNAME', (0, 2), (-1, 2), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 2), (-1, 2), 10),
            
            # Second values row
            ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#d1fae5')),
            ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 3), (-1, 3), 14),
            ('TEXTCOLOR', (0, 3), (-1, 3), colors.HexColor('#047857')),
            
            # Grid and padding
            ('GRID', (0, 0), (-1, -1), 1, colors.white),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [None]),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8)
        ]))
        
        content.append(summary_table)
        
        # Add performance chart for all campaigns
        content.append(Spacer(1, 0.2*inch))
        chart = create_campaign_performance_chart(stats_list)
        content.append(chart)
    
    return content

def create_compact_email_table(stats_list):
    """Create a compact table showing all email performance with pagination"""
    styles = getSampleStyleSheet()
    content = []
    
    # Section header
    section_style = ParagraphStyle('CompactSection', parent=styles['Heading2'], 
                                 fontSize=16, spaceAfter=12, 
                                 textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    content.append(Paragraph(f"📈 CAMPAIGN PERFORMANCE BREAKDOWN ({len(stats_list)} Campaigns)", section_style))
    
    # Split campaigns into chunks for better page management
    campaigns_per_page = 25  # Adjust based on page size
    
    for page_num, start_idx in enumerate(range(0, len(stats_list), campaigns_per_page)):
        end_idx = min(start_idx + campaigns_per_page, len(stats_list))
        page_campaigns = stats_list[start_idx:end_idx]
        
        # Add page break for subsequent pages
        if page_num > 0:
            content.append(PageBreak())
            content.append(Paragraph(f"📈 CAMPAIGN PERFORMANCE (Continued - Page {page_num + 1})", section_style))
        
        # Prepare table data for this page
        table_data = [['Campaign Name', 'Sent', 'Opens', 'Clicks', 'Open Rate', 'CTR', 'Status']]
        
        for email_data in page_campaigns:
            stats = email_data.get('stats', {})
            name = email_data.get('name', 'Unknown')[:30] + '...' if len(email_data.get('name', '')) > 30 else email_data.get('name', 'Unknown')
            sent = stats.get('sent', 0)
            delivered = stats.get('delivered', 0)
            opens = stats.get('opens', 0)
            clicks = stats.get('clicks', 0)
            
            open_rate = (opens / delivered * 100) if delivered > 0 else 0
            click_rate = (clicks / delivered * 100) if delivered > 0 else 0
            
            # Performance status
            if open_rate >= 25:
                status = "🟢 Excellent"
            elif open_rate >= 15:
                status = "🟡 Good"
            else:
                status = "🔴 Needs Work"
            
            table_data.append([
                name,
                f"{sent:,}",
                f"{opens:,}",
                f"{clicks:,}",
                f"{open_rate:.1f}%",
                f"{click_rate:.1f}%",
                status
            ])
        
        # Create table for this page
        email_table = Table(table_data, colWidths=[2.4*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.8*inch, 0.7*inch, 1.2*inch])
        email_table.setStyle(TableStyle([
            # Header styling
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 8),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 7),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            
            # Campaign name column (left align)
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
            ('RIGHTPADDING', (0, 0), (-1, -1), 3)
        ]))
        
        content.append(email_table)
        
        # Add page summary for multi-page reports
        if len(stats_list) > campaigns_per_page:
            note_style = ParagraphStyle('PageNote', parent=styles['Normal'], 
                                      fontSize=8, spaceAfter=8, alignment=1, 
                                      textColor=colors.HexColor('#6b7280'), fontStyle='italic')
            content.append(Spacer(1, 6))
            content.append(Paragraph(f"Campaigns {start_idx + 1}-{end_idx} of {len(stats_list)} total", note_style))
    
    return content

def create_insights_section(stats_list):
    """Create insights and recommendations section"""
    styles = getSampleStyleSheet()
    content = []
    
    # Section header
    section_style = ParagraphStyle('InsightsSection', parent=styles['Heading2'], 
                                 fontSize=16, spaceAfter=12, 
                                 textColor=colors.HexColor('#1f2937'), fontName='Helvetica-Bold')
    
    content.append(Paragraph("🎯 KEY INSIGHTS & RECOMMENDATIONS", section_style))
    
    # Calculate insights
    totals = calculate_totals(stats_list)
    
    # Find best and worst performing campaigns
    best_campaign = max(stats_list, key=lambda x: x.get('stats', {}).get('opens', 0) / max(x.get('stats', {}).get('delivered', 1), 1))
    worst_campaign = min(stats_list, key=lambda x: x.get('stats', {}).get('opens', 0) / max(x.get('stats', {}).get('delivered', 1), 1))
    
    best_open_rate = (best_campaign.get('stats', {}).get('opens', 0) / max(best_campaign.get('stats', {}).get('delivered', 1), 1) * 100)
    worst_open_rate = (worst_campaign.get('stats', {}).get('opens', 0) / max(worst_campaign.get('stats', {}).get('delivered', 1), 1) * 100)
    
    # Create insights table
    insights_data = [
        ['📊 PERFORMANCE ANALYSIS', 'VALUE', 'RECOMMENDATION'],
        ['Overall Open Rate', f"{totals['open_rate']:.1f}%", 
         'Excellent (>25%)' if totals['open_rate'] > 25 else 'Good (15-25%)' if totals['open_rate'] > 15 else 'Needs Improvement (<15%)'],
        ['Overall Click Rate', f"{totals['click_rate']:.1f}%", 
         'Excellent (>3%)' if totals['click_rate'] > 3 else 'Good (1-3%)' if totals['click_rate'] > 1 else 'Needs Improvement (<1%)'],
        ['Best Performing Campaign', f"{best_campaign.get('name', 'Unknown')[:20]}...", f"Open Rate: {best_open_rate:.1f}% - Analyze for best practices"],
        ['Lowest Performing Campaign', f"{worst_campaign.get('name', 'Unknown')[:20]}...", f"Open Rate: {worst_open_rate:.1f}% - Review subject line & timing"],
        ['Total Engagement', f"{((totals['opens'] + totals['clicks']) / totals['delivered'] * 100):.1f}%" if totals['delivered'] > 0 else '0%', 
         'Focus on mobile optimization & personalization']
    ]
    
    insights_table = Table(insights_data, colWidths=[2.5*inch, 2*inch, 2.7*inch])
    insights_table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#faf5ff')]),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6)
    ]))
    
    content.append(insights_table)
    
    # Add industry benchmarks section
    content.append(Spacer(1, 0.2*inch))
    
    benchmark_style = ParagraphStyle('BenchmarkHeader', parent=styles['Heading3'], 
                                   fontSize=14, spaceAfter=8, 
                                   textColor=colors.HexColor('#dc2626'), fontName='Helvetica-Bold')
    
    content.append(Paragraph("🏆 INDUSTRY BENCHMARK COMPARISON", benchmark_style))
    
    # Industry benchmarks (typical email marketing benchmarks)
    benchmark_data = [
        ['Metric', 'Your Performance', 'Industry Average', 'Status'],
        ['Open Rate', f"{totals['open_rate']:.1f}%", '21.3%', 
         '🟢 Above Average' if totals['open_rate'] > 21.3 else '🟡 Average' if totals['open_rate'] > 15 else '🔴 Below Average'],
        ['Click Rate', f"{totals['click_rate']:.1f}%", '2.6%', 
         '🟢 Above Average' if totals['click_rate'] > 2.6 else '🟡 Average' if totals['click_rate'] > 1.5 else '🔴 Below Average'],
        ['Delivery Rate', f"{(totals['delivered']/totals['sent']*100):.1f}%" if totals['sent'] > 0 else '0%', '95.0%', 
         '🟢 Excellent' if (totals['delivered']/totals['sent']*100) > 95 else '🟡 Good' if (totals['delivered']/totals['sent']*100) > 90 else '🔴 Needs Work']
    ]
    
    benchmark_table = Table(benchmark_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 2.2*inch])
    benchmark_table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#fef2f2')]),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d1d5db')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4)
    ]))
    
    content.append(benchmark_table)
    
    # Add footer with generation info
    content.append(Spacer(1, 0.3*inch))
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], 
                                fontSize=8, alignment=1, 
                                textColor=colors.HexColor('#9ca3af'))
    
    footer_text = f"Report generated by Pardot Analytics Hub • {datetime.now().strftime('%B %d, %Y at %I:%M %p')} • Total Campaigns: {len(stats_list)} • Confidential"
    content.append(Paragraph(footer_text, footer_style))
    
    return content

def calculate_totals(stats_list):
    """Calculate overall totals and averages"""
    if not stats_list:
        return {}
    
    total_sent = sum(email.get('stats', {}).get('sent', 0) for email in stats_list)
    total_delivered = sum(email.get('stats', {}).get('delivered', 0) for email in stats_list)
    total_opens = sum(email.get('stats', {}).get('opens', 0) for email in stats_list)
    total_clicks = sum(email.get('stats', {}).get('clicks', 0) for email in stats_list)
    
    count = len(stats_list)
    
    return {
        'sent': total_sent,
        'delivered': total_delivered,
        'opens': total_opens,
        'clicks': total_clicks,
        'open_rate': (total_opens / total_delivered * 100) if total_delivered > 0 else 0,
        'click_rate': (total_clicks / total_delivered * 100) if total_delivered > 0 else 0,
        'avg_sent': total_sent / count,
        'avg_delivered': total_delivered / count,
        'avg_opens': total_opens / count,
        'avg_clicks': total_clicks / count,
        'avg_open_rate': sum((email.get('stats', {}).get('opens', 0) / max(email.get('stats', {}).get('delivered', 1), 1) * 100) for email in stats_list) / count,
        'avg_click_rate': sum((email.get('stats', {}).get('clicks', 0) / max(email.get('stats', {}).get('delivered', 1), 1) * 100) for email in stats_list) / count
    }

def create_campaign_performance_chart(stats_list):
    """Create bar chart showing total sent vs delivered for all campaigns"""
    drawing = Drawing(500, 200)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 30
    chart.height = 140
    chart.width = 400
    
    # Calculate totals
    totals = calculate_totals(stats_list)
    
    # Prepare data - showing total sent, delivered, opens, clicks
    chart.data = [
        [totals['sent'], totals['delivered'], totals['opens'], totals['clicks']]
    ]
    
    chart.categoryAxis.categoryNames = ['Total Sent', 'Delivered', 'Opens', 'Clicks']
    chart.categoryAxis.labels.fontSize = 10
    chart.categoryAxis.labels.dy = -5
    
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max(totals['sent'], 1000)  # Ensure reasonable scale
    chart.valueAxis.labels.fontSize = 9
    chart.valueAxis.labelTextFormat = '%s'
    
    # Color bars with different colors for each metric
    chart.bars[0].fillColor = colors.HexColor('#3b82f6')  # Blue for sent
    
    # Add chart title
    from reportlab.graphics.shapes import String
    title = String(250, 175, 'Overall Campaign Performance Metrics', textAnchor='middle')
    title.fontSize = 11
    title.fontName = 'Helvetica-Bold'
    title.fillColor = colors.HexColor('#1f2937')
    
    drawing.add(chart)
    drawing.add(title)
    
    return drawing

if __name__ == "__main__":
    app.run(port=4000, debug=True)