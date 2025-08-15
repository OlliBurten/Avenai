#!/usr/bin/env python3
"""
🔍 Focused Endpoint Test for Avenai Platform
Testing specific endpoints that are returning 404 errors
"""

import requests
import json
from datetime import datetime

def test_endpoint(base_url: str, endpoint: str, method: str = "GET", data: dict = None):
    """Test a single endpoint"""
    url = f"{base_url}{endpoint}"
    print(f"\n🔍 Testing: {method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
        
        if response.status_code == 200:
            print("   ✅ SUCCESS")
        elif response.status_code == 404:
            print("   ❌ 404 NOT FOUND")
        else:
            print(f"   ⚠️  Status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ ERROR: {e}")

def main():
    base_url = "http://localhost:8000"
    
    print("🔍 Testing Avenai Platform Endpoints")
    print("=" * 50)
    
    # Test core endpoints that should work
    print("\n🎯 Testing Core Endpoints (should work):")
    test_endpoint(base_url, "/health")
    test_endpoint(base_url, "/api/v1/analytics/dashboard")
    test_endpoint(base_url, "/api/v1/documents")
    
    # Test AI endpoints that are returning 404
    print("\n🤖 Testing AI Endpoints (currently 404):")
    test_endpoint(base_url, "/api/v1/ai/models")
    test_endpoint(base_url, "/api/v1/ai-chat/chat/enhanced", "POST", {
        "message": "Test message",
        "user_id": "test_user",
        "session_id": "test_session",
        "model": "gpt-4"
    })
    test_endpoint(base_url, "/api/v1/ai/insights/generate", "POST", {
        "insight_type": "security",
        "data_source": "audit_logs",
        "analysis_period": json.dumps({"start_date": "2024-01-01", "end_date": "2024-01-31"}),
        "user_id": "test_user"
    })
    
    # Test collaboration endpoints
    print("\n👥 Testing Collaboration Endpoints:")
    test_endpoint(base_url, "/api/v1/collaboration/sessions")
    test_endpoint(base_url, "/api/v1/collaboration/sessions", "POST", {
        "session_name": "Test Session",
        "session_type": "document_collaboration",
        "created_by": "test_user"
    })
    
    # Test enterprise endpoints
    print("\n🏢 Testing Enterprise Endpoints:")
    test_endpoint(base_url, "/api/v1/security/audit-logs")
    test_endpoint(base_url, "/api/v1/security/policies")
    test_endpoint(base_url, "/api/v1/compliance/reports")
    
    # Test advanced platform endpoints
    print("\n🚀 Testing Advanced Platform Endpoints:")
    test_endpoint(base_url, "/api/v1/advanced-tenants")
    test_endpoint(base_url, "/api/v1/advanced-reports")
    test_endpoint(base_url, "/api/v1/business-intelligence")
    
    # Test final platform endpoints
    print("\n🎯 Testing Final Platform Endpoints:")
    test_endpoint(base_url, "/api/v1/workflow-automation")
    test_endpoint(base_url, "/api/v1/business-processes")
    test_endpoint(base_url, "/api/v1/data-pipelines")
    
    print("\n" + "=" * 50)
    print("🎯 Endpoint Test Complete!")

if __name__ == "__main__":
    main()
