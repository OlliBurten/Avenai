#!/usr/bin/env python3
"""
🚀 Avenai Platform Benchmark Suite
Comprehensive testing and benchmarking for all platform features
"""

import asyncio
import aiohttp
import time
import json
import statistics
from datetime import datetime
from typing import Dict, List, Any
import concurrent.futures
import threading

class AvenaiBenchmark:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results = {}
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def benchmark_endpoint(self, endpoint: str, method: str = "GET", 
                               data: Dict = None, headers: Dict = None) -> Dict:
        """Benchmark a single API endpoint"""
        start_time = time.time()
        try:
            if method == "GET":
                async with self.session.get(f"{self.base_url}{endpoint}", headers=headers) as response:
                    response_time = time.time() - start_time
                    return {
                        "endpoint": endpoint,
                        "method": method,
                        "status_code": response.status,
                        "response_time": response_time,
                        "success": response.status < 400,
                        "error": None
                    }
            elif method == "POST":
                async with self.session.post(f"{self.base_url}{endpoint}", 
                                           json=data, headers=headers) as response:
                    response_time = time.time() - start_time
                    return {
                        "endpoint": endpoint,
                        "method": method,
                        "status_code": response.status,
                        "response_time": response_time,
                        "success": response.status < 400,
                        "error": None
                    }
        except Exception as e:
            response_time = time.time() - start_time
            return {
                "endpoint": endpoint,
                "method": method,
                "status_code": None,
                "response_time": response_time,
                "success": False,
                "error": str(e)
            }
    
    async def run_concurrent_benchmark(self, endpoint: str, method: str = "GET", 
                                     data: Dict = None, concurrent_users: int = 10, 
                                     requests_per_user: int = 5) -> Dict:
        """Run concurrent load testing on an endpoint"""
        print(f"🔄 Running concurrent benchmark: {endpoint} ({concurrent_users} users, {requests_per_user} requests each)")
        
        async def user_workload():
            results = []
            for _ in range(requests_per_user):
                result = await self.benchmark_endpoint(endpoint, method, data)
                results.append(result)
                await asyncio.sleep(0.1)  # Small delay between requests
            return results
        
        # Create concurrent user tasks
        tasks = [user_workload() for _ in range(concurrent_users)]
        all_results = await asyncio.gather(*tasks)
        
        # Flatten results
        flat_results = [r for user_results in all_results for r in user_results]
        
        # Calculate statistics
        response_times = [r["response_time"] for r in flat_results if r["success"]]
        success_count = sum(1 for r in flat_results if r["success"])
        total_requests = len(flat_results)
        
        if response_times:
            stats = {
                "endpoint": endpoint,
                "total_requests": total_requests,
                "successful_requests": success_count,
                "success_rate": (success_count / total_requests) * 100,
                "avg_response_time": statistics.mean(response_times),
                "min_response_time": min(response_times),
                "max_response_time": max(response_times),
                "median_response_time": statistics.median(response_times),
                "p95_response_time": statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times),
                "throughput": total_requests / max(response_times) if response_times else 0
            }
        else:
            stats = {
                "endpoint": endpoint,
                "total_requests": total_requests,
                "successful_requests": 0,
                "success_rate": 0,
                "avg_response_time": 0,
                "min_response_time": 0,
                "max_response_time": 0,
                "median_response_time": 0,
                "p95_response_time": 0,
                "throughput": 0
            }
        
        return stats
    
    async def benchmark_core_features(self) -> Dict:
        """Benchmark core platform features"""
        print("🎯 Benchmarking Core Platform Features...")
        
        core_endpoints = [
            ("/health", "GET"),
            ("/api/v1/analytics/dashboard", "GET"),
            ("/api/v1/documents", "GET"),
            ("/api/v1/ai-chat/chat", "POST", {"message": "Hello, how are you?", "user_id": "benchmark_user"}),
        ]
        
        results = {}
        for endpoint_info in core_endpoints:
            if len(endpoint_info) == 2:
                endpoint, method = endpoint_info
                data = None
            else:
                endpoint, method, data = endpoint_info
            
            result = await self.benchmark_endpoint(endpoint, method, data)
            results[endpoint] = result
            
        return results
    
    async def benchmark_ai_features(self) -> Dict:
        """Benchmark AI and ML features"""
        print("🤖 Benchmarking AI & ML Features...")
        
        ai_endpoints = [
            ("/api/v1/ai/models", "GET"),
            ("/api/v1/ai-chat/chat/enhanced", "POST", {
                "message": "Analyze this document for key insights",
                "user_id": "benchmark_user",
                "session_id": "benchmark_session",
                "model": "gpt-4"
            }),
            ("/api/v1/ai/insights/generate", "POST", {
                "insight_type": "security",
                "data_source": "audit_logs",
                "analysis_period": json.dumps({"start_date": "2024-01-01", "end_date": "2024-01-31"}),
                "user_id": "benchmark_user"
            }),
        ]
        
        results = {}
        for endpoint_info in ai_endpoints:
            if len(endpoint_info) == 2:
                endpoint, method = endpoint_info
                data = None
            else:
                endpoint, method, data = endpoint_info
            
            result = await self.benchmark_endpoint(endpoint, method, data)
            results[endpoint] = result
            
        return results
    
    async def benchmark_collaboration_features(self) -> Dict:
        """Benchmark collaboration features"""
        print("👥 Benchmarking Collaboration Features...")
        
        collaboration_endpoints = [
            ("/api/v1/collaboration/sessions", "GET"),
            ("/api/v1/collaboration/sessions", "POST", {
                "session_name": "Benchmark Session",
                "session_type": "document_collaboration",
                "created_by": "benchmark_user"
            }),
            ("/api/v1/collaboration/documents/content", "POST", {
                "document_id": "benchmark_doc",
                "content": "This is benchmark content for testing",
                "user_id": "benchmark_user"
            }),
        ]
        
        results = {}
        for endpoint_info in collaboration_endpoints:
            if len(endpoint_info) == 2:
                endpoint, method = endpoint_info
                data = None
            else:
                endpoint, method, data = endpoint_info
            
            result = await self.benchmark_endpoint(endpoint, method, data)
            results[endpoint] = result
            
        return results
    
    async def benchmark_enterprise_features(self) -> Dict:
        """Benchmark enterprise features"""
        print("🏢 Benchmarking Enterprise Features...")
        
        enterprise_endpoints = [
            ("/api/v1/security/audit-logs", "GET"),
            ("/api/v1/security/policies", "GET"),
            ("/api/v1/compliance/reports", "GET"),
            ("/api/v1/integrations/webhooks", "GET"),
        ]
        
        results = {}
        for endpoint_info in enterprise_endpoints:
            if len(endpoint_info) == 2:
                endpoint, method = endpoint_info
                data = None
            else:
                endpoint, method, data = endpoint_info
            
            result = await self.benchmark_endpoint(endpoint, method, data)
            results[endpoint] = result
            
        return results
    
    async def benchmark_advanced_platform_features(self) -> Dict:
        """Benchmark advanced platform features"""
        print("🚀 Benchmarking Advanced Platform Features...")
        
        advanced_endpoints = [
            ("/api/v1/advanced-tenants", "GET"),
            ("/api/v1/advanced-reports", "GET"),
            ("/api/v1/business-intelligence", "GET"),
            ("/api/v1/advanced-user-roles", "GET"),
        ]
        
        results = {}
        for endpoint_info in advanced_endpoints:
            if len(endpoint_info) == 2:
                endpoint, method = endpoint_info
                data = None
            else:
                endpoint, method, data = endpoint_info
            
            result = await self.benchmark_endpoint(endpoint_info[0], endpoint_info[1])
            results[endpoint_info[0]] = result
            
        return results
    
    async def benchmark_final_platform_features(self) -> Dict:
        """Benchmark final platform features"""
        print("🎯 Benchmarking Final Platform Features...")
        
        final_endpoints = [
            ("/api/v1/workflow-automation", "GET"),
            ("/api/v1/business-processes", "GET"),
            ("/api/v1/data-pipelines", "GET"),
            ("/api/v1/ml-pipelines", "GET"),
            ("/api/v1/third-party-integrations", "GET"),
            ("/api/v1/api-ecosystems", "GET"),
        ]
        
        results = {}
        for endpoint_info in final_endpoints:
            if len(endpoint_info) == 2:
                endpoint, method = endpoint_info
                data = None
            else:
                endpoint, method, data = endpoint_info
            
            result = await self.benchmark_endpoint(endpoint, method, data)
            results[endpoint] = result
            
        return results
    
    async def run_load_test(self, endpoint: str, duration_seconds: int = 60, 
                           requests_per_second: int = 10) -> Dict:
        """Run sustained load testing on an endpoint"""
        print(f"🔥 Running load test: {endpoint} ({duration_seconds}s, {requests_per_second} req/s)")
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        request_interval = 1.0 / requests_per_second
        
        results = []
        request_count = 0
        
        while time.time() < end_time:
            request_start = time.time()
            result = await self.benchmark_endpoint(endpoint)
            results.append(result)
            request_count += 1
            
            # Calculate sleep time to maintain request rate
            elapsed = time.time() - request_start
            sleep_time = max(0, request_interval - elapsed)
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)
        
        # Calculate load test statistics
        response_times = [r["response_time"] for r in results if r["success"]]
        success_count = sum(1 for r in results if r["success"])
        total_requests = len(results)
        actual_duration = time.time() - start_time
        
        if response_times:
            stats = {
                "endpoint": endpoint,
                "test_duration": actual_duration,
                "total_requests": total_requests,
                "successful_requests": success_count,
                "success_rate": (success_count / total_requests) * 100,
                "actual_rps": total_requests / actual_duration,
                "target_rps": requests_per_second,
                "avg_response_time": statistics.mean(response_times),
                "min_response_time": min(response_times),
                "max_response_time": max(response_times),
                "p95_response_time": statistics.quantiles(response_times, n=20)[18] if len(response_times) >= 20 else max(response_times),
                "p99_response_time": statistics.quantiles(response_times, n=100)[98] if len(response_times) >= 100 else max(response_times),
            }
        else:
            stats = {
                "endpoint": endpoint,
                "test_duration": actual_duration,
                "total_requests": total_requests,
                "successful_requests": 0,
                "success_rate": 0,
                "actual_rps": 0,
                "target_rps": requests_per_second,
                "avg_response_time": 0,
                "min_response_time": 0,
                "max_response_time": 0,
                "p95_response_time": 0,
                "p99_response_time": 0,
            }
        
        return stats
    
    async def run_comprehensive_benchmark(self) -> Dict:
        """Run comprehensive benchmark across all platform features"""
        print("🚀 Starting Comprehensive Avenai Platform Benchmark...")
        print("=" * 60)
        
        start_time = time.time()
        
        # Run all benchmark categories
        core_results = await self.benchmark_core_features()
        ai_results = await self.benchmark_ai_features()
        collaboration_results = await self.benchmark_collaboration_features()
        enterprise_results = await self.benchmark_enterprise_features()
        advanced_results = await self.benchmark_advanced_platform_features()
        final_results = await self.benchmark_final_platform_features()
        
        # Run concurrent load tests on key endpoints
        print("\n🔄 Running Concurrent Load Tests...")
        concurrent_results = {}
        key_endpoints = [
            ("/health", "GET"),
            ("/api/v1/analytics/dashboard", "GET"),
            ("/api/v1/documents", "GET"),
        ]
        
        for endpoint, method in key_endpoints:
            result = await self.run_concurrent_benchmark(endpoint, method, concurrent_users=20, requests_per_user=10)
            concurrent_results[endpoint] = result
        
        # Run sustained load test on health endpoint
        print("\n🔥 Running Sustained Load Test...")
        load_test_results = await self.run_load_test("/health", duration_seconds=30, requests_per_second=50)
        
        # Compile comprehensive results
        total_time = time.time() - start_time
        
        comprehensive_results = {
            "benchmark_info": {
                "platform": "Avenai Enterprise AI Platform",
                "benchmark_date": datetime.now().isoformat(),
                "total_benchmark_time": total_time,
                "base_url": self.base_url
            },
            "core_features": core_results,
            "ai_features": ai_results,
            "collaboration_features": collaboration_results,
            "enterprise_features": enterprise_results,
            "advanced_platform_features": advanced_results,
            "final_platform_features": final_results,
            "concurrent_load_tests": concurrent_results,
            "sustained_load_test": load_test_results,
            "summary": self.generate_summary({
                "core": core_results,
                "ai": ai_results,
                "collaboration": collaboration_results,
                "enterprise": enterprise_results,
                "advanced": advanced_results,
                "final": final_results,
                "concurrent": concurrent_results,
                "load_test": load_test_results
            })
        }
        
        return comprehensive_results
    
    def generate_summary(self, all_results: Dict) -> Dict:
        """Generate summary statistics from all benchmark results"""
        all_endpoints = []
        all_response_times = []
        all_success_rates = []
        
        # Collect data from all result categories
        for category, results in all_results.items():
            if isinstance(results, dict):
                for endpoint, result in results.items():
                    if isinstance(result, dict) and "response_time" in result:
                        all_endpoints.append(endpoint)
                        if result.get("success"):
                            all_response_times.append(result["response_time"])
                        if "success_rate" in result:
                            all_success_rates.append(result["success_rate"])
        
        if all_response_times:
            summary = {
                "total_endpoints_tested": len(all_endpoints),
                "overall_avg_response_time": statistics.mean(all_response_times),
                "overall_min_response_time": min(all_response_times),
                "overall_max_response_time": max(all_response_times),
                "overall_median_response_time": statistics.median(all_response_times),
                "overall_p95_response_time": statistics.quantiles(all_response_times, n=20)[18] if len(all_response_times) >= 20 else max(all_response_times),
                "overall_success_rate": statistics.mean(all_success_rates) if all_success_rates else 0,
                "performance_grade": self.calculate_performance_grade(all_response_times, all_success_rates)
            }
        else:
            summary = {
                "total_endpoints_tested": len(all_endpoints),
                "overall_avg_response_time": 0,
                "overall_min_response_time": 0,
                "overall_max_response_time": 0,
                "overall_median_response_time": 0,
                "overall_p95_response_time": 0,
                "overall_success_rate": 0,
                "performance_grade": "F"
            }
        
        return summary
    
    def calculate_performance_grade(self, response_times: List[float], success_rates: List[float]) -> str:
        """Calculate overall performance grade"""
        if not response_times or not success_rates:
            return "F"
        
        avg_response_time = statistics.mean(response_times)
        avg_success_rate = statistics.mean(success_rates)
        
        # Grade based on response time and success rate
        if avg_response_time < 0.1 and avg_success_rate >= 95:
            return "A+"
        elif avg_response_time < 0.2 and avg_success_rate >= 90:
            return "A"
        elif avg_response_time < 0.5 and avg_success_rate >= 85:
            return "B+"
        elif avg_response_time < 1.0 and avg_success_rate >= 80:
            return "B"
        elif avg_response_time < 2.0 and avg_success_rate >= 75:
            return "C+"
        elif avg_response_time < 5.0 and avg_success_rate >= 70:
            return "C"
        else:
            return "D"
    
    def print_results(self, results: Dict):
        """Print benchmark results in a formatted way"""
        print("\n" + "=" * 60)
        print("🚀 AVENAI PLATFORM BENCHMARK RESULTS")
        print("=" * 60)
        
        # Print benchmark info
        info = results["benchmark_info"]
        print(f"\n📊 Benchmark Information:")
        print(f"   Platform: {info['platform']}")
        print(f"   Date: {info['benchmark_date']}")
        print(f"   Total Time: {info['total_benchmark_time']:.2f}s")
        print(f"   Base URL: {info['base_url']}")
        
        # Print summary
        summary = results["summary"]
        print(f"\n🏆 Overall Performance Summary:")
        print(f"   Performance Grade: {summary['performance_grade']}")
        print(f"   Endpoints Tested: {summary['total_endpoints_tested']}")
        print(f"   Average Response Time: {summary['overall_avg_response_time']:.3f}s")
        print(f"   P95 Response Time: {summary['overall_p95_response_time']:.3f}s")
        print(f"   Overall Success Rate: {summary['overall_success_rate']:.1f}%")
        
        # Print detailed results by category
        categories = [
            ("Core Features", "core_features"),
            ("AI Features", "ai_features"),
            ("Collaboration", "collaboration_features"),
            ("Enterprise", "enterprise_features"),
            ("Advanced Platform", "advanced_platform_features"),
            ("Final Platform", "final_platform_features")
        ]
        
        for category_name, category_key in categories:
            if category_key in results:
                print(f"\n📋 {category_name}:")
                category_results = results[category_key]
                for endpoint, result in category_results.items():
                    if result.get("success"):
                        status = "✅"
                    else:
                        status = "❌"
                    print(f"   {status} {endpoint}: {result.get('response_time', 0):.3f}s ({result.get('status_code', 'N/A')})")
        
        # Print load test results
        if "concurrent_load_tests" in results:
            print(f"\n🔄 Concurrent Load Test Results:")
            for endpoint, result in results["concurrent_load_tests"].items():
                print(f"   📈 {endpoint}:")
                print(f"      Success Rate: {result['success_rate']:.1f}%")
                print(f"      Avg Response: {result['avg_response_time']:.3f}s")
                print(f"      Throughput: {result['throughput']:.1f} req/s")
        
        if "sustained_load_test" in results:
            load_test = results["sustained_load_test"]
            print(f"\n🔥 Sustained Load Test Results:")
            print(f"   📊 {load_test['endpoint']}:")
            print(f"      Duration: {load_test['test_duration']:.1f}s")
            print(f"      Target RPS: {load_test['target_rps']}")
            print(f"      Actual RPS: {load_test['actual_rps']:.1f}")
            print(f"      Success Rate: {load_test['success_rate']:.1f}%")
            print(f"      P95 Response: {load_test['p95_response_time']:.3f}s")
            print(f"      P99 Response: {load_test['p99_response_time']:.3f}s")
        
        print("\n" + "=" * 60)
        print("🎯 BENCHMARK COMPLETE!")
        print("=" * 60)

async def main():
    """Main benchmark execution"""
    print("🚀 Starting Avenai Platform Benchmark Suite...")
    print("Make sure your backend is running on http://localhost:8000")
    print("=" * 60)
    
    async with AvenaiBenchmark() as benchmark:
        try:
            # Run comprehensive benchmark
            results = await benchmark.run_comprehensive_benchmark()
            
            # Print results
            benchmark.print_results(results)
            
            # Save results to file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"avenai_benchmark_results_{timestamp}.json"
            
            with open(filename, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            
            print(f"\n💾 Results saved to: {filename}")
            
        except Exception as e:
            print(f"❌ Benchmark failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
