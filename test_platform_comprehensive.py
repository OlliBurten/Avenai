#!/usr/bin/env python3
"""
🧪 Comprehensive Avenai Platform Test Suite
Testing ALL features end-to-end on your live platform
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List

class AvenaiPlatformTester:
    def __init__(self):
        self.base_urls = {
            "marketing": "https://avenai.io",
            "marketing_www": "https://www.avenai.io", 
            "backend": "https://api.avenai.io",
            "frontend": "https://avenai-black.vercel.app"
        }
        self.test_results = {}
        self.session = requests.Session()
        
    def test_endpoint(self, name: str, url: str, method: str = "GET", 
                     data: Dict = None, expected_status: int = 200) -> Dict:
        """Test a single endpoint"""
        print(f"\n🔍 Testing: {name}")
        print(f"   URL: {url}")
        
        start_time = time.time()
        try:
            if method == "GET":
                response = self.session.get(url, timeout=15, allow_redirects=True)
            elif method == "POST":
                response = self.session.post(url, json=data, timeout=15)
            
            response_time = time.time() - start_time
            
            # Check status
            if response.status_code == expected_status:
                status = "✅ PASS"
            else:
                status = "❌ FAIL"
            
            print(f"   Status: {status} ({response.status_code})")
            print(f"   Response Time: {response_time:.3f}s")
            
            # Check content
            if response.status_code == 200:
                content_length = len(response.text)
                print(f"   Content Length: {content_length} characters")
                
                # Check for key content indicators
                if "avenai" in response.text.lower():
                    print(f"   ✅ Content: Contains 'avenai'")
                if "ai" in response.text.lower():
                    print(f"   ✅ Content: Contains 'AI'")
                    
            elif response.status_code == 404:
                print(f"   ⚠️  Content: Not Found")
            else:
                print(f"   ⚠️  Content: Status {response.status_code}")
            
            return {
                "name": name,
                "url": url,
                "status_code": response.status_code,
                "response_time": response_time,
                "content_length": len(response.text) if response.text else 0,
                "success": response.status_code == expected_status,
                "error": None
            }
            
        except Exception as e:
            response_time = time.time() - start_time
            print(f"   ❌ ERROR: {e}")
            return {
                "name": name,
                "url": url,
                "status_code": None,
                "response_time": response_time,
                "content_length": 0,
                "success": False,
                "error": str(e)
            }
    
    def test_marketing_sites(self) -> Dict:
        """Test marketing landing pages"""
        print("\n" + "=" * 60)
        print("🌐 TESTING MARKETING SITES")
        print("=" * 60)
        
        results = {}
        
        # Test main marketing site
        results["avenai_io"] = self.test_endpoint(
            "Marketing Site (avenai.io)", 
            self.base_urls["marketing"]
        )
        
        # Test www subdomain
        results["www_avenai_io"] = self.test_endpoint(
            "Marketing Site (www.avenai.io)", 
            self.base_urls["marketing_www"]
        )
        
        return results
    
    def test_backend_api(self) -> Dict:
        """Test backend API endpoints"""
        print("\n" + "=" * 60)
        print("🚄 TESTING BACKEND API")
        print("=" * 60)
        
        results = {}
        
        # Test health endpoint
        results["health"] = self.test_endpoint(
            "Health Check", 
            f"{self.base_urls['backend']}/health"
        )
        
        # Test analytics dashboard
        results["analytics_dashboard"] = self.test_endpoint(
            "Analytics Dashboard", 
            f"{self.base_urls['backend']}/api/v1/analytics/dashboard"
        )
        
        # Test documents endpoint
        results["documents"] = self.test_endpoint(
            "Documents API", 
            f"{self.base_urls['backend']}/api/v1/documents"
        )
        
        # Test AI chat endpoint
        results["ai_chat"] = self.test_endpoint(
            "AI Chat API", 
            f"{self.base_urls['backend']}/api/v1/ai-chat/chat",
            method="POST",
            data={"message": "Hello, test message", "user_id": "test_user"},
            expected_status=422  # Expected for missing required fields
        )
        
        # Test AI models endpoint
        results["ai_models"] = self.test_endpoint(
            "AI Models API", 
            f"{self.base_urls['backend']}/api/v1/ai/models"
        )
        
        return results
    
    def test_frontend_app(self) -> Dict:
        """Test frontend application"""
        print("\n" + "=" * 60)
        print("📱 TESTING FRONTEND APP")
        print("=" * 60)
        
        results = {}
        
        # Test main frontend
        results["frontend_main"] = self.test_endpoint(
            "Frontend App", 
            self.base_urls["frontend"]
        )
        
        # Test dashboard page
        results["frontend_dashboard"] = self.test_endpoint(
            "Dashboard Page", 
            f"{self.base_urls['frontend']}/dashboard"
        )
        
        # Test upload page
        results["frontend_upload"] = self.test_endpoint(
            "Upload Page", 
            f"{self.base_urls['frontend']}/upload"
        )
        
        # Test enhanced AI chat page
        results["frontend_enhanced_ai"] = self.test_endpoint(
            "Enhanced AI Chat", 
            f"{self.base_urls['frontend']}/enhanced-ai-chat"
        )
        
        # Test collaboration page
        results["frontend_collaboration"] = self.test_endpoint(
            "Collaboration", 
            f"{self.base_urls['frontend']}/collaboration"
        )
        
        # Test enterprise page
        results["frontend_enterprise"] = self.test_endpoint(
            "Enterprise", 
            f"{self.base_urls['frontend']}/enterprise"
        )
        
        return results
    
    def test_advanced_features(self) -> Dict:
        """Test advanced platform features"""
        print("\n" + "=" * 60)
        print("🚀 TESTING ADVANCED FEATURES")
        print("=" * 60)
        
        results = {}
        
        # Test tenant-scoped endpoints
        test_tenant = "test_tenant_123"
        
        results["tenant_ai_insights"] = self.test_endpoint(
            "Tenant AI Insights", 
            f"{self.base_urls['backend']}/api/v1/enterprise/tenants/{test_tenant}/ai/insights"
        )
        
        results["tenant_ml_models"] = self.test_endpoint(
            "Tenant ML Models", 
            f"{self.base_urls['backend']}/api/v1/enterprise/tenants/{test_tenant}/ml/models"
        )
        
        results["tenant_security_audit"] = self.test_endpoint(
            "Tenant Security Audit", 
            f"{self.base_urls['backend']}/api/v1/enterprise/tenants/{test_tenant}/security/audit"
        )
        
        results["tenant_compliance_status"] = self.test_endpoint(
            "Tenant Compliance Status", 
            f"{self.base_urls['backend']}/api/v1/enterprise/tenants/{test_tenant}/compliance/status"
        )
        
        return results
    
    def test_file_upload_simulation(self) -> Dict:
        """Test file upload functionality"""
        print("\n" + "=" * 60)
        print("📁 TESTING FILE UPLOAD")
        print("=" * 60)
        
        results = {}
        
        # Test upload endpoint with minimal data
        results["upload_endpoint"] = self.test_endpoint(
            "Upload Endpoint", 
            f"{self.base_urls['backend']}/api/v1/documents/upload",
            method="POST",
            data={"filename": "test.txt", "content": "test content"},
            expected_status=422  # Expected for missing required fields
        )
        
        return results
    
    def test_cors_and_connectivity(self) -> Dict:
        """Test CORS and cross-origin connectivity"""
        print("\n" + "=" * 60)
        print("🔗 TESTING CORS & CONNECTIVITY")
        print("=" * 60)
        
        results = {}
        
        # Test if frontend can reach backend
        try:
            # Simulate frontend request to backend
            headers = {
                'Origin': self.base_urls['frontend'],
                'User-Agent': 'Avenai-Platform-Tester/1.0'
            }
            
            response = self.session.get(
                f"{self.base_urls['backend']}/health",
                headers=headers,
                timeout=10
            )
            
            cors_headers = response.headers.get('Access-Control-Allow-Origin', 'Not Set')
            
            if cors_headers != 'Not Set':
                status = "✅ PASS"
                print(f"   CORS Headers: {cors_headers}")
            else:
                status = "⚠️  WARNING"
                print(f"   CORS Headers: Not configured")
            
            results["cors_test"] = {
                "name": "CORS Configuration",
                "success": cors_headers != 'Not Set',
                "cors_headers": cors_headers,
                "error": None
            }
            
        except Exception as e:
            print(f"   ❌ CORS Test Error: {e}")
            results["cors_test"] = {
                "name": "CORS Configuration",
                "success": False,
                "cors_headers": None,
                "error": str(e)
            }
        
        return results
    
    def run_comprehensive_test(self) -> Dict:
        """Run comprehensive platform test"""
        print("🧪 AVENAI PLATFORM COMPREHENSIVE TEST SUITE")
        print("=" * 60)
        print(f"🚀 Testing your ENTIRE platform at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all test categories
        self.test_results["marketing"] = self.test_marketing_sites()
        self.test_results["backend"] = self.test_backend_api()
        self.test_results["frontend"] = self.test_frontend_app()
        self.test_results["advanced"] = self.test_advanced_features()
        self.test_results["upload"] = self.test_file_upload_simulation()
        self.test_results["cors"] = self.test_cors_and_connectivity()
        
        total_time = time.time() - start_time
        
        # Compile results
        comprehensive_results = {
            "test_info": {
                "platform": "Avenai Enterprise AI Platform",
                "test_date": datetime.now().isoformat(),
                "total_test_time": total_time,
                "base_urls": self.base_urls
            },
            "test_results": self.test_results,
            "summary": self.generate_summary()
        }
        
        return comprehensive_results
    
    def generate_summary(self) -> Dict:
        """Generate test summary"""
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        
        for category, results in self.test_results.items():
            for test_name, result in results.items():
                total_tests += 1
                if result.get("success"):
                    passed_tests += 1
                else:
                    failed_tests += 1
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        # Determine overall status
        if success_rate >= 90:
            overall_status = "🟢 EXCELLENT"
        elif success_rate >= 75:
            overall_status = "🟡 GOOD"
        elif success_rate >= 50:
            overall_status = "🟠 FAIR"
        else:
            overall_status = "🔴 NEEDS WORK"
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "overall_status": overall_status
        }
    
    def print_results(self, results: Dict):
        """Print test results"""
        print("\n" + "=" * 60)
        print("🏆 COMPREHENSIVE TEST RESULTS")
        print("=" * 60)
        
        # Print test info
        info = results["test_info"]
        print(f"\n📊 Test Information:")
        print(f"   Platform: {info['platform']}")
        print(f"   Date: {info['test_date']}")
        print(f"   Total Time: {info['total_test_time']:.2f}s")
        
        # Print summary
        summary = results["summary"]
        print(f"\n🏆 Overall Results:")
        print(f"   Status: {summary['overall_status']}")
        print(f"   Success Rate: {summary['success_rate']:.1f}%")
        print(f"   Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        # Print detailed results by category
        categories = [
            ("Marketing Sites", "marketing"),
            ("Backend API", "backend"),
            ("Frontend App", "frontend"),
            ("Advanced Features", "advanced"),
            ("File Upload", "upload"),
            ("CORS & Connectivity", "cors")
        ]
        
        for category_name, category_key in categories:
            if category_key in results["test_results"]:
                print(f"\n📋 {category_name}:")
                category_results = results["test_results"][category_key]
                
                for test_name, result in category_results.items():
                    if result.get("success"):
                        status = "✅"
                    else:
                        status = "❌"
                    
                    print(f"   {status} {result['name']}: {result.get('response_time', 0):.3f}s")
        
        print("\n" + "=" * 60)
        print("🎯 COMPREHENSIVE TEST COMPLETE!")
        print("=" * 60)

def main():
    """Main test execution"""
    print("🧪 Starting Avenai Platform Comprehensive Test Suite...")
    print("Testing ALL features end-to-end on your live platform!")
    print("=" * 60)
    
    tester = AvenaiPlatformTester()
    
    try:
        # Run comprehensive test
        results = tester.run_comprehensive_test()
        
        # Print results
        tester.print_results(results)
        
        # Save results to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"avenai_platform_test_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n💾 Results saved to: {filename}")
        
        # Final recommendation
        summary = results["summary"]
        if summary["success_rate"] >= 90:
            print(f"\n🎉 CONGRATULATIONS! Your platform is EXCELLENT!")
            print(f"   Ready for enterprise clients and production use!")
        elif summary["success_rate"] >= 75:
            print(f"\n👍 Your platform is GOOD! Minor issues to address.")
        else:
            print(f"\n⚠️  Your platform needs attention. Let's fix the issues!")
        
    except Exception as e:
        print(f"❌ Test suite failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
