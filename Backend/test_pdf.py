#!/usr/bin/env python3
"""
Test script for the enhanced PDF report generation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from PardotBackend import create_professional_pdf_report

# Sample test data
sample_stats = [
    {
        "id": "1",
        "name": "Welcome Email Campaign",
        "subject": "Welcome to our platform!",
        "createdat": "2024-01-15T10:00:00Z",
        "stats": {
            "sent": 1000,
            "delivered": 980,
            "opens": 450,
            "clicks": 89,
            "bounces": 20
        }
    },
    {
        "id": "2", 
        "name": "Product Launch Newsletter",
        "subject": "Exciting New Product Launch!",
        "createdat": "2024-01-20T14:30:00Z",
        "stats": {
            "sent": 2500,
            "delivered": 2450,
            "opens": 1200,
            "clicks": 340,
            "bounces": 50
        }
    },
    {
        "id": "3",
        "name": "Monthly Newsletter",
        "subject": "Your Monthly Update",
        "createdat": "2024-01-25T09:15:00Z", 
        "stats": {
            "sent": 1800,
            "delivered": 1750,
            "opens": 875,
            "clicks": 156,
            "bounces": 50
        }
    }
]

def test_pdf_generation():
    """Test the professional PDF report generation"""
    try:
        print("Testing professional PDF report generation...")
        
        # Generate PDF with sample data
        buffer = create_professional_pdf_report(sample_stats, day="15", month="1", year="2024")
        
        # Save to file for testing
        with open("test_email_report.pdf", "wb") as f:
            f.write(buffer.getvalue())
            
        print("SUCCESS: PDF report generated successfully!")
        print("Saved as: test_email_report.pdf")
        print(f"Report includes {len(sample_stats)} email campaigns")
        
        # Calculate and display summary stats
        total_sent = sum(email['stats']['sent'] for email in sample_stats)
        total_opens = sum(email['stats']['opens'] for email in sample_stats)
        total_clicks = sum(email['stats']['clicks'] for email in sample_stats)
        
        print(f"Summary: {total_sent:,} sent, {total_opens:,} opens, {total_clicks:,} clicks")
        
    except Exception as e:
        print(f"ERROR: Error generating PDF: {e}")
        return False
        
    return True

if __name__ == "__main__":
    success = test_pdf_generation()
    if success:
        print("\nTest completed successfully!")
        print("The PDF includes:")
        print("   - Professional cover page with title and date")
        print("   - Executive summary with totals and averages")
        print("   - Bar chart comparing open rates across emails")
        print("   - Individual email performance pages with tables and charts")
    else:
        print("\nTest failed!")