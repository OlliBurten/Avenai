#!/usr/bin/env python3
"""
🔍 Domain Verification Script for Railway
Checks domain configuration and Railway connectivity
"""

import dns.resolver
import requests
import socket
import ssl
import time
from datetime import datetime

def check_domain_resolution(domain):
    """Check if domain resolves correctly"""
    print(f"\n🔍 Checking domain resolution: {domain}")
    
    try:
        # Check A records
        a_records = dns.resolver.resolve(domain, 'A')
        print(f"   ✅ A Records found:")
        for record in a_records:
            print(f"      {record}")
    except Exception as e:
        print(f"   ❌ A Records: {e}")
    
    try:
        # Check CNAME records
        cname_records = dns.resolver.resolve(domain, 'CNAME')
        print(f"   ✅ CNAME Records found:")
        for record in cname_records:
            print(f"      {record}")
    except Exception as e:
        print(f"   ❌ CNAME Records: {e}")
    
    try:
        # Check MX records
        mx_records = dns.resolver.resolve(domain, 'MX')
        print(f"   ✅ MX Records found:")
        for record in mx_records:
            print(f"      {record}")
    except Exception as e:
        print(f"   ❌ MX Records: {e}")

def check_railway_connectivity():
    """Check Railway backend connectivity"""
    print(f"\n🚄 Checking Railway Backend Connectivity:")
    
    railway_url = "https://avenai-backend.railway.app"
    
    try:
        response = requests.get(f"{railway_url}/health", timeout=10)
        print(f"   ✅ Railway Backend: {response.status_code} - {response.text[:100]}")
    except Exception as e:
        print(f"   ❌ Railway Backend Error: {e}")
    
    try:
        response = requests.get(f"{railway_url}/api/v1/analytics/dashboard", timeout=10)
        print(f"   ✅ Railway API: {response.status_code} - API accessible")
    except Exception as e:
        print(f"   ❌ Railway API Error: {e}")

def check_ssl_certificate(domain):
    """Check SSL certificate for domain"""
    print(f"\n🔒 Checking SSL Certificate for: {domain}")
    
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                print(f"   ✅ SSL Certificate:")
                print(f"      Subject: {cert['subject']}")
                print(f"      Issuer: {cert['issuer']}")
                print(f"      Valid Until: {cert['notAfter']}")
    except Exception as e:
        print(f"   ❌ SSL Certificate Error: {e}")

def check_http_response(domain):
    """Check HTTP response from domain"""
    print(f"\n🌐 Checking HTTP Response from: {domain}")
    
    try:
        response = requests.get(f"https://{domain}", timeout=10, allow_redirects=True)
        print(f"   ✅ HTTP Response: {response.status_code}")
        print(f"   📍 Final URL: {response.url}")
        print(f"   🏷️  Server: {response.headers.get('Server', 'Unknown')}")
    except Exception as e:
        print(f"   ❌ HTTP Response Error: {e}")

def main():
    print("🔍 Railway Domain Verification Diagnostic Tool")
    print("=" * 60)
    
    # Check Railway connectivity first
    check_railway_connectivity()
    
    # Check common domain configurations
    domains_to_check = [
        "avenai.io",
        "api.avenai.io",
        "www.avenai.io"
    ]
    
    for domain in domains_to_check:
        check_domain_resolution(domain)
        check_ssl_certificate(domain)
        check_http_response(domain)
    
    print(f"\n📋 Domain Verification Checklist:")
    print("   1. ✅ Railway backend accessible")
    print("   2. 🔍 DNS records configured")
    print("   3. 🔒 SSL certificate valid")
    print("   4. 🌐 Domain responds to HTTP")
    print("   5. ⚙️  Railway domain configured")
    
    print(f"\n💡 Troubleshooting Tips:")
    print("   • DNS changes can take 2-48 hours to propagate")
    print("   • Ensure Railway domain is added in dashboard")
    print("   • Check DNS provider settings")
    print("   • Verify CNAME/A record configuration")
    
    print(f"\n🎯 Next Steps:")
    print("   1. Check Railway dashboard → Settings → Domains")
    print("   2. Verify DNS records match Railway requirements")
    print("   3. Wait for DNS propagation")
    print("   4. Check SSL certificate generation")

if __name__ == "__main__":
    main()
