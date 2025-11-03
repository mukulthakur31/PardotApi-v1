#!/usr/bin/env python3
"""
Test script for prospect filtering functionality
"""

from services.prospect_filter_service import ProspectFilterService
from datetime import datetime, timedelta

# Sample test data
test_prospects = [
    {
        "id": "1",
        "email": "active@test.com",
        "firstName": "Active",
        "lastName": "User",
        "score": 75,
        "grade": "A",
        "lastActivityAt": datetime.now().isoformat(),
        "createdAt": (datetime.now() - timedelta(days=30)).isoformat(),
        "assignedTo": "user123",
        "isDoNotEmail": False,
        "tags": ["marketing", "qualified"]
    },
    {
        "id": "2", 
        "email": "inactive@test.com",
        "firstName": "Inactive",
        "lastName": "User",
        "score": 25,
        "grade": "D",
        "lastActivityAt": (datetime.now() - timedelta(days=100)).isoformat(),
        "createdAt": (datetime.now() - timedelta(days=200)).isoformat(),
        "assignedTo": None,
        "isDoNotEmail": True,
        "tags": ["cold"]
    },
    {
        "id": "3",
        "email": "never_active@test.com", 
        "firstName": "Never",
        "lastName": "Active",
        "score": 0,
        "grade": None,
        "lastActivityAt": None,
        "createdAt": (datetime.now() - timedelta(days=5)).isoformat(),
        "assignedTo": None,
        "isDoNotEmail": False,
        "tags": ["new", "unqualified"]
    }
]

def test_filters():
    """Test various filter combinations"""
    filter_service = ProspectFilterService(test_prospects)
    
    print("=== Testing Prospect Filters ===\n")
    
    # Test 1: All prospects
    result = filter_service.apply_filters()
    print(f"All Prospects: {len(result)} prospects")
    
    # Test 2: Active prospects only
    result = filter_service.apply_filters(view_filter="Active Prospects")
    print(f"Active Prospects: {len(result)} prospects")
    
    # Test 3: Never active prospects
    result = filter_service.apply_filters(view_filter="Never Active Prospects")
    print(f"Never Active Prospects: {len(result)} prospects")
    
    # Test 4: Assigned prospects
    result = filter_service.apply_filters(view_filter="Assigned Prospects")
    print(f"Assigned Prospects: {len(result)} prospects")
    
    # Test 5: Mailable prospects
    result = filter_service.apply_filters(view_filter="Mailable Prospects")
    print(f"Mailable Prospects: {len(result)} prospects")
    
    # Test 6: Time filter - Last 7 days
    result = filter_service.apply_filters(time_filter="Last 7 Days")
    print(f"Last 7 Days Activity: {len(result)} prospects")
    
    # Test 7: Tag filter
    result = filter_service.apply_filters(tag_filter="marketing")
    print(f"Marketing Tagged: {len(result)} prospects")
    
    # Test 8: Combined filters
    result = filter_service.apply_filters(
        view_filter="Active Prospects",
        time_filter="Last 7 Days",
        tag_filter="qualified"
    )
    print(f"Active + Recent + Qualified: {len(result)} prospects")
    
    print("\n=== Filter Test Complete ===")

if __name__ == "__main__":
    test_filters()