import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

class GoogleIntegration:
    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]
        self.redirect_uri = 'http://localhost:4000/google-callback'
        
    def get_auth_url(self):
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri]
                }
            },
            scopes=self.scopes
        )
        flow.redirect_uri = self.redirect_uri
        auth_url, _ = flow.authorization_url(prompt='consent')
        return auth_url, flow
    
    def get_credentials(self, code, flow):
        flow.fetch_token(code=code)
        return flow.credentials
    
    def create_spreadsheet(self, credentials, title, data):
        service = build('sheets', 'v4', credentials=credentials)
        
        # Create spreadsheet
        spreadsheet = {
            'properties': {'title': title}
        }
        spreadsheet = service.spreadsheets().create(body=spreadsheet).execute()
        spreadsheet_id = spreadsheet.get('spreadsheetId')
        
        # Prepare data for sheets
        if data:
            headers = ['Email ID', 'Name', 'Subject', 'Created At', 'Sent', 'Delivered', 'Hard Bounced', 'Soft Bounced', 'Opens', 'Unique Opens', 'Opens Rate', 'Total Clicks', 'Unique Clicks', 'Click Through Rate', 'Unique Click Through Rate', 'Click Open Ratio', 'Opt Outs', 'Opt Out Rate', 'Spam Complaints', 'Spam Complaint Rate', 'Delivery Rate']
            values = [headers]
            
            for item in data:
                stats = item.get('stats', {})
                row = [
                    item.get('id', ''),
                    item.get('name', ''),
                    item.get('subject', ''),
                    item.get('createdat', ''),
                    stats.get('sent', 0),
                    stats.get('delivered', 0),
                    stats.get('hardBounced', 0),
                    stats.get('softBounced', 0),
                    stats.get('opens', 0),
                    stats.get('uniqueOpens', 0),
                    stats.get('opensRate', 0),
                    stats.get('totalClicks', 0),
                    stats.get('uniqueClicks', 0),
                    stats.get('clickThroughRate', 0),
                    stats.get('uniqueClickThroughRate', 0),
                    stats.get('clickOpenRatio', 0),
                    stats.get('optOuts', 0),
                    stats.get('optOutRate', 0),
                    stats.get('spamComplaints', 0),
                    stats.get('spamComplaintRate', 0),
                    stats.get('deliveryRate', 0)
                ]
                values.append(row)
            
            # Update spreadsheet with data
            body = {'values': values}
            service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range='A1',
                valueInputOption='RAW',
                body=body
            ).execute()
        
        return spreadsheet_id
    
    def export_to_drive(self, credentials, spreadsheet_id, filename):
        from googleapiclient.http import MediaIoBaseUpload
        drive_service = build('drive', 'v3', credentials=credentials)
        
        # Export as PDF
        request = drive_service.files().export_media(
            fileId=spreadsheet_id,
            mimeType='application/pdf'
        )
        
        file_io = io.BytesIO()
        downloader = MediaIoBaseDownload(file_io, request)
        done = False
        while done is False:
            status, done = downloader.next_chunk()
        
        # Upload PDF to Drive
        file_metadata = {'name': f'{filename}.pdf'}
        file_io.seek(0)
        media = MediaIoBaseUpload(file_io, mimetype='application/pdf')
        
        file = drive_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        
        return file.get('id')