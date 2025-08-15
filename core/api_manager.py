"""
Advanced API Management System for Avenai
Handles API keys, rate limiting, usage tracking, and access control
"""

import time
import hashlib
import hmac
import base64
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import json
import uuid
from collections import defaultdict, deque

class APIKeyStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    EXPIRED = "expired"
    REVOKED = "revoked"

class APIKeyPermission(Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    ANALYTICS = "analytics"
    WEBHOOKS = "webhooks"

@dataclass
class APIKey:
    id: str
    name: str
    key_hash: str
    tenant_id: str
    user_id: str
    permissions: List[APIKeyPermission]
    status: APIKeyStatus
    created_at: datetime
    last_used: Optional[datetime]
    expires_at: Optional[datetime]
    rate_limit: int  # requests per minute
    metadata: Dict[str, Any]

@dataclass
class APIUsage:
    api_key_id: str
    endpoint: str
    method: str
    response_time: float
    status_code: int
    timestamp: datetime
    user_agent: str
    ip_address: str
    tenant_id: str
    user_id: str

class RateLimiter:
    """Implements sliding window rate limiting"""
    
    def __init__(self, window_size: int = 60):
        self.window_size = window_size  # seconds
        self.requests: Dict[str, deque] = defaultdict(deque)
    
    def is_allowed(self, key: str, limit: int) -> Tuple[bool, Dict[str, Any]]:
        """Check if request is allowed within rate limit"""
        now = time.time()
        window_start = now - self.window_size
        
        # Clean old requests
        if key in self.requests:
            while self.requests[key] and self.requests[key][0] < window_start:
                self.requests[key].popleft()
        
        # Check if limit exceeded
        current_count = len(self.requests[key])
        if current_count >= limit:
            return False, {
                "limit": limit,
                "remaining": 0,
                "reset_time": int(window_start + self.window_size),
                "retry_after": int(window_start + self.window_size - now)
            }
        
        # Add current request
        self.requests[key].append(now)
        
        return True, {
            "limit": limit,
            "remaining": limit - current_count - 1,
            "reset_time": int(window_start + self.window_size)
        }

class APIKeyManager:
    """Manages API keys and authentication"""
    
    def __init__(self):
        self.api_keys: Dict[str, APIKey] = {}
        self.key_lookup: Dict[str, str] = {}  # key_hash -> api_key_id
        self.rate_limiter = RateLimiter()
        self._initialize_default_keys()
    
    def _initialize_default_keys(self):
        """Initialize default API keys for demo"""
        default_key = self.create_api_key(
            name="Default Demo Key",
            tenant_id="tenant_default",
            user_id="user_001",
            permissions=[APIKeyPermission.READ, APIKeyPermission.WRITE, APIKeyPermission.ANALYTICS],
            rate_limit=1000
        )
        print(f"🔑 Default API key created: {default_key.id}")
    
    def create_api_key(self, name: str, tenant_id: str, user_id: str, 
                      permissions: List[APIKeyPermission], rate_limit: int = 100,
                      expires_at: Optional[datetime] = None) -> APIKey:
        """Create a new API key"""
        api_key_id = f"key_{uuid.uuid4().hex[:8]}"
        raw_key = self._generate_raw_key()
        key_hash = self._hash_key(raw_key)
        
        api_key = APIKey(
            id=api_key_id,
            name=name,
            key_hash=key_hash,
            tenant_id=tenant_id,
            user_id=user_id,
            permissions=permissions,
            status=APIKeyStatus.ACTIVE,
            created_at=datetime.now(),
            last_used=None,
            expires_at=expires_at,
            rate_limit=rate_limit,
            metadata={
                "created_by": user_id,
                "description": f"API key for {name}",
                "scopes": [perm.value for perm in permissions]
            }
        )
        
        self.api_keys[api_key_id] = api_key
        self.key_lookup[key_hash] = api_key_id
        
        # Return the raw key for the user to copy (won't be stored)
        api_key.metadata["raw_key"] = raw_key
        return api_key
    
    def _generate_raw_key(self) -> str:
        """Generate a raw API key"""
        return f"avenai_{uuid.uuid4().hex}_{uuid.uuid4().hex[:8]}"
    
    def _hash_key(self, raw_key: str) -> str:
        """Hash the raw API key for storage"""
        return hashlib.sha256(raw_key.encode()).hexdigest()
    
    def validate_api_key(self, raw_key: str) -> Tuple[Optional[APIKey], Dict[str, Any]]:
        """Validate an API key and return the key object"""
        key_hash = self._hash_key(raw_key)
        api_key_id = self.key_lookup.get(key_hash)
        
        if not api_key_id:
            return None, {"error": "Invalid API key"}
        
        api_key = self.api_keys.get(api_key_id)
        if not api_key:
            return None, {"error": "API key not found"}
        
        # Check status
        if api_key.status != APIKeyStatus.ACTIVE:
            return None, {"error": f"API key is {api_key.status.value}"}
        
        # Check expiration
        if api_key.expires_at and datetime.now() > api_key.expires_at:
            api_key.status = APIKeyStatus.EXPIRED
            return None, {"error": "API key has expired"}
        
        # Check rate limit
        rate_limit_key = f"{api_key_id}:{api_key.tenant_id}"
        is_allowed, rate_info = self.rate_limiter.is_allowed(rate_limit_key, api_key.rate_limit)
        
        if not is_allowed:
            return None, {"error": "Rate limit exceeded", "rate_limit": rate_info}
        
        # Update last used
        api_key.last_used = datetime.now()
        
        return api_key, {"rate_limit": rate_info}
    
    def get_api_key(self, api_key_id: str) -> Optional[APIKey]:
        """Get API key by ID"""
        return self.api_keys.get(api_key_id)
    
    def get_api_keys_by_tenant(self, tenant_id: str) -> List[APIKey]:
        """Get all API keys for a tenant"""
        return [key for key in self.api_keys.values() if key.tenant_id == tenant_id]
    
    def get_api_keys_by_user(self, user_id: str) -> List[APIKey]:
        """Get all API keys for a user"""
        return [key for key in self.api_keys.values() if key.user_id == user_id]
    
    def update_api_key(self, api_key_id: str, **kwargs) -> Optional[APIKey]:
        """Update API key properties"""
        api_key = self.api_keys.get(api_key_id)
        if not api_key:
            return None
        
        for key, value in kwargs.items():
            if hasattr(api_key, key):
                setattr(api_key, key, value)
        
        return api_key
    
    def revoke_api_key(self, api_key_id: str, reason: str = None) -> bool:
        """Revoke an API key"""
        api_key = self.api_keys.get(api_key_id)
        if not api_key:
            return False
        
        api_key.status = APIKeyStatus.REVOKED
        api_key.metadata["revoked"] = {
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }
        
        return True
    
    def check_permission(self, api_key: APIKey, permission: APIKeyPermission) -> bool:
        """Check if API key has a specific permission"""
        return permission in api_key.permissions
    
    def check_permissions(self, api_key: APIKey, permissions: List[APIKeyPermission]) -> bool:
        """Check if API key has all specified permissions"""
        return all(perm in api_key.permissions for perm in permissions)

class APIUsageTracker:
    """Tracks API usage for analytics and billing"""
    
    def __init__(self):
        self.usage_records: List[APIUsage] = []
        self.usage_cache: Dict[str, Dict[str, Any]] = defaultdict(dict)
    
    def track_request(self, api_key: APIKey, endpoint: str, method: str,
                     response_time: float, status_code: int, user_agent: str,
                     ip_address: str) -> None:
        """Track an API request"""
        usage = APIUsage(
            api_key_id=api_key.id,
            endpoint=endpoint,
            method=method,
            response_time=response_time,
            status_code=status_code,
            timestamp=datetime.now(),
            user_agent=user_agent,
            ip_address=ip_address,
            tenant_id=api_key.tenant_id,
            user_id=api_key.user_id
        )
        
        self.usage_records.append(usage)
        
        # Update cache for quick access
        cache_key = f"{api_key.tenant_id}:{endpoint}"
        if cache_key not in self.usage_cache:
            self.usage_cache[cache_key] = {
                "total_requests": 0,
                "total_response_time": 0,
                "success_count": 0,
                "error_count": 0,
                "last_request": None
            }
        
        cache = self.usage_cache[cache_key]
        cache["total_requests"] += 1
        cache["total_response_time"] += response_time
        cache["last_request"] = usage.timestamp
        
        if 200 <= status_code < 400:
            cache["success_count"] += 1
        else:
            cache["error_count"] += 1
    
    def get_usage_stats(self, tenant_id: str, period: str = "24h") -> Dict[str, Any]:
        """Get usage statistics for a tenant"""
        now = datetime.now()
        
        if period == "1h":
            start_time = now - timedelta(hours=1)
        elif period == "24h":
            start_time = now - timedelta(days=1)
        elif period == "7d":
            start_time = now - timedelta(days=7)
        elif period == "30d":
            start_time = now - timedelta(days=30)
        else:
            start_time = now - timedelta(days=1)
        
        # Filter records by time and tenant
        recent_usage = [
            record for record in self.usage_records
            if record.timestamp >= start_time and record.tenant_id == tenant_id
        ]
        
        if not recent_usage:
            return {
                "tenant_id": tenant_id,
                "period": period,
                "total_requests": 0,
                "avg_response_time": 0,
                "success_rate": 0,
                "endpoints": {},
                "errors": []
            }
        
        # Calculate statistics
        total_requests = len(recent_usage)
        total_response_time = sum(record.response_time for record in recent_usage)
        success_count = sum(1 for record in recent_usage if 200 <= record.status_code < 400)
        
        # Group by endpoint
        endpoints = defaultdict(lambda: {
            "requests": 0,
            "avg_response_time": 0,
            "success_rate": 0,
            "errors": 0
        })
        
        for record in recent_usage:
            endpoint = record.endpoint
            endpoints[endpoint]["requests"] += 1
            endpoints[endpoint]["avg_response_time"] += record.response_time
            
            if 200 <= record.status_code < 400:
                endpoints[endpoint]["success_rate"] += 1
            else:
                endpoints[endpoint]["errors"] += 1
        
        # Calculate averages
        for endpoint_data in endpoints.values():
            if endpoint_data["requests"] > 0:
                endpoint_data["avg_response_time"] /= endpoint_data["requests"]
                endpoint_data["success_rate"] = (endpoint_data["success_rate"] / endpoint_data["requests"]) * 100
        
        # Get recent errors
        errors = [
            {
                "endpoint": record.endpoint,
                "method": record.method,
                "status_code": record.status_code,
                "timestamp": record.timestamp.isoformat(),
                "response_time": record.response_time
            }
            for record in recent_usage
            if record.status_code >= 400
        ][-10:]  # Last 10 errors
        
        return {
            "tenant_id": tenant_id,
            "period": period,
            "total_requests": total_requests,
            "avg_response_time": total_response_time / total_requests if total_requests > 0 else 0,
            "success_rate": (success_count / total_requests) * 100 if total_requests > 0 else 0,
            "endpoints": dict(endpoints),
            "errors": errors
        }
    
    def get_tenant_usage_summary(self, tenant_id: str) -> Dict[str, Any]:
        """Get comprehensive usage summary for a tenant"""
        periods = ["1h", "24h", "7d", "30d"]
        usage_data = {}
        
        for period in periods:
            usage_data[period] = self.get_usage_stats(tenant_id, period)
        
        # Calculate trends
        current_24h = usage_data["24h"]["total_requests"]
        previous_24h = usage_data["7d"]["total_requests"] - current_24h
        
        if previous_24h > 0:
            growth_rate = ((current_24h - previous_24h) / previous_24h) * 100
        else:
            growth_rate = 0
        
        return {
            "tenant_id": tenant_id,
            "current_period": usage_data["24h"],
            "trends": {
                "requests_growth": growth_rate,
                "periods": usage_data
            },
            "summary": {
                "total_requests_24h": current_24h,
                "avg_response_time_24h": usage_data["24h"]["avg_response_time"],
                "success_rate_24h": usage_data["24h"]["success_rate"],
                "top_endpoints": sorted(
                    usage_data["24h"]["endpoints"].items(),
                    key=lambda x: x[1]["requests"],
                    reverse=True
                )[:5]
            }
        }

# Global instances
api_key_manager = APIKeyManager()
api_usage_tracker = APIUsageTracker()
