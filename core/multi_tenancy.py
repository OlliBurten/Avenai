"""
Multi-Tenancy System for Avenai
Handles company isolation, data segregation, and tenant management
"""

import uuid
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import json
import hashlib

class TenantStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    EXPIRED = "expired"
    CANCELLED = "cancelled"

class TenantPlan(Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

@dataclass
class TenantLimits:
    max_users: int = 5
    max_documents: int = 100
    max_storage_gb: int = 1
    max_api_calls_per_day: int = 1000
    max_ai_tokens_per_month: int = 100000
    custom_domains: int = 0
    white_label: bool = False
    priority_support: bool = False

@dataclass
class Tenant:
    id: str
    name: str
    domain: str
    api_key: str
    status: TenantStatus
    plan: TenantPlan
    limits: TenantLimits
    settings: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    trial_ends_at: Optional[datetime] = None
    subscription_ends_at: Optional[datetime] = None
    metadata: Dict[str, Any] = None

class TenantManager:
    """Manages multi-tenant operations and data isolation"""
    
    def __init__(self):
        self.tenants: Dict[str, Tenant] = {}
        self.tenant_cache: Dict[str, Dict[str, Any]] = {}
        self._initialize_default_tenant()
    
    def _initialize_default_tenant(self):
        """Initialize the default demo tenant"""
        default_tenant = Tenant(
            id="tenant_default",
            name="Avenai Demo",
            domain="demo.avenai.com",
            api_key="demo_api_key_123",
            status=TenantStatus.ACTIVE,
            plan=TenantPlan.PROFESSIONAL,
            limits=TenantLimits(
                max_users=50,
                max_documents=1000,
                max_storage_gb=10,
                max_api_calls_per_day=10000,
                max_ai_tokens_per_month=1000000,
                custom_domains=1,
                white_label=False,
                priority_support=True
            ),
            settings={
                "theme": "default",
                "logo_url": None,
                "custom_css": None,
                "features": ["ai_chat", "document_management", "analytics", "api_access"],
                "security": {
                    "mfa_required": False,
                    "session_timeout": 3600,
                    "ip_whitelist": [],
                    "rate_limiting": True
                }
            },
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={
                "description": "Default demo tenant for Avenai platform",
                "industry": "technology",
                "size": "startup"
            }
        )
        self.tenants[default_tenant.id] = default_tenant
    
    def create_tenant(self, name: str, domain: str, plan: TenantPlan = TenantPlan.STARTER) -> Tenant:
        """Create a new tenant"""
        tenant_id = f"tenant_{uuid.uuid4().hex[:8]}"
        api_key = self._generate_api_key()
        
        # Set plan-specific limits
        limits = self._get_plan_limits(plan)
        
        tenant = Tenant(
            id=tenant_id,
            name=name,
            domain=domain,
            api_key=api_key,
            status=TenantStatus.TRIAL,
            plan=plan,
            limits=limits,
            settings=self._get_default_settings(plan),
            created_at=datetime.now(),
            updated_at=datetime.now(),
            trial_ends_at=datetime.now() + timedelta(days=14),
            metadata={
                "description": f"Tenant for {name}",
                "created_by": "system",
                "plan_upgrade_eligible": True
            }
        )
        
        self.tenants[tenant_id] = tenant
        return tenant
    
    def _generate_api_key(self) -> str:
        """Generate a secure API key"""
        return f"avenai_{uuid.uuid4().hex}_{uuid.uuid4().hex[:8]}"
    
    def _get_plan_limits(self, plan: TenantPlan) -> TenantLimits:
        """Get limits based on plan"""
        limits_map = {
            TenantPlan.FREE: TenantLimits(
                max_users=3,
                max_documents=50,
                max_storage_gb=0.5,
                max_api_calls_per_day=100,
                max_ai_tokens_per_month=10000
            ),
            TenantPlan.STARTER: TenantLimits(
                max_users=10,
                max_documents=500,
                max_storage_gb=5,
                max_api_calls_per_day=5000,
                max_ai_tokens_per_month=100000
            ),
            TenantPlan.PROFESSIONAL: TenantLimits(
                max_users=50,
                max_documents=5000,
                max_storage_gb=50,
                max_api_calls_per_day=50000,
                max_ai_tokens_per_month=1000000,
                custom_domains=2,
                white_label=True
            ),
            TenantPlan.ENTERPRISE: TenantLimits(
                max_users=1000,
                max_documents=100000,
                max_storage_gb=1000,
                max_api_calls_per_day=1000000,
                max_ai_tokens_per_month=10000000,
                custom_domains=10,
                white_label=True,
                priority_support=True
            )
        }
        return limits_map.get(plan, limits_map[TenantPlan.STARTER])
    
    def _get_default_settings(self, plan: TenantPlan) -> Dict[str, Any]:
        """Get default settings based on plan"""
        base_settings = {
            "theme": "default",
            "logo_url": None,
            "custom_css": None,
            "features": ["ai_chat", "document_management"],
            "security": {
                "mfa_required": False,
                "session_timeout": 3600,
                "ip_whitelist": [],
                "rate_limiting": True
            }
        }
        
        if plan in [TenantPlan.PROFESSIONAL, TenantPlan.ENTERPRISE]:
            base_settings["features"].extend(["analytics", "api_access", "webhooks"])
            base_settings["security"]["mfa_required"] = True
        
        if plan == TenantPlan.ENTERPRISE:
            base_settings["features"].extend(["advanced_analytics", "custom_integrations", "sso"])
            base_settings["security"]["session_timeout"] = 7200
        
        return base_settings
    
    def get_tenant(self, tenant_id: str) -> Optional[Tenant]:
        """Get tenant by ID"""
        return self.tenants.get(tenant_id)
    
    def get_tenant_by_api_key(self, api_key: str) -> Optional[Tenant]:
        """Get tenant by API key"""
        for tenant in self.tenants.values():
            if tenant.api_key == api_key:
                return tenant
        return None
    
    def get_tenant_by_domain(self, domain: str) -> Optional[Tenant]:
        """Get tenant by domain"""
        for tenant in self.tenants.values():
            if tenant.domain == domain:
                return tenant
        return None
    
    def update_tenant(self, tenant_id: str, **kwargs) -> Optional[Tenant]:
        """Update tenant properties"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return None
        
        for key, value in kwargs.items():
            if hasattr(tenant, key):
                setattr(tenant, key, value)
        
        tenant.updated_at = datetime.now()
        return tenant
    
    def delete_tenant(self, tenant_id: str) -> bool:
        """Delete a tenant (soft delete)"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return False
        
        tenant.status = TenantStatus.CANCELLED
        tenant.updated_at = datetime.now()
        return True
    
    def check_tenant_limits(self, tenant_id: str, resource_type: str, current_usage: int) -> bool:
        """Check if tenant is within limits for a resource"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return False
        
        limits_map = {
            "users": tenant.limits.max_users,
            "documents": tenant.limits.max_documents,
            "storage": tenant.limits.max_storage_gb * 1024 * 1024 * 1024,  # Convert to bytes
            "api_calls": tenant.limits.max_api_calls_per_day,
            "ai_tokens": tenant.limits.max_ai_tokens_per_month
        }
        
        limit = limits_map.get(resource_type, 0)
        return current_usage < limit
    
    def get_tenant_usage(self, tenant_id: str) -> Dict[str, Any]:
        """Get current usage statistics for a tenant"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return {}
        
        # This would typically query the database for actual usage
        # For now, return mock data
        return {
            "users": {"current": 3, "limit": tenant.limits.max_users},
            "documents": {"current": 15, "limit": tenant.limits.max_documents},
            "storage": {"current": 0.2, "limit": tenant.limits.max_storage_gb},
            "api_calls": {"current": 150, "limit": tenant.limits.max_api_calls_per_day},
            "ai_tokens": {"current": 5000, "limit": tenant.limits.max_ai_tokens_per_month}
        }
    
    def upgrade_tenant_plan(self, tenant_id: str, new_plan: TenantPlan) -> bool:
        """Upgrade tenant to a new plan"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return False
        
        old_plan = tenant.plan
        tenant.plan = new_plan
        tenant.limits = self._get_plan_limits(new_plan)
        tenant.settings = self._get_default_settings(new_plan)
        tenant.updated_at = datetime.now()
        
        # Update metadata
        if not tenant.metadata:
            tenant.metadata = {}
        tenant.metadata["plan_upgrade_history"] = tenant.metadata.get("plan_upgrade_history", [])
        tenant.metadata["plan_upgrade_history"].append({
            "from": old_plan.value,
            "to": new_plan.value,
            "timestamp": datetime.now().isoformat()
        })
        
        return True
    
    def suspend_tenant(self, tenant_id: str, reason: str = None) -> bool:
        """Suspend a tenant"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return False
        
        tenant.status = TenantStatus.SUSPENDED
        tenant.updated_at = datetime.now()
        
        if not tenant.metadata:
            tenant.metadata = {}
        tenant.metadata["suspension"] = {
            "reason": reason,
            "timestamp": datetime.now().isoformat(),
            "suspended_by": "system"
        }
        
        return True
    
    def activate_tenant(self, tenant_id: str) -> bool:
        """Activate a suspended tenant"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return False
        
        tenant.status = TenantStatus.ACTIVE
        tenant.updated_at = datetime.now()
        
        if tenant.metadata and "suspension" in tenant.metadata:
            tenant.metadata["suspension"]["reactivated_at"] = datetime.now().isoformat()
        
        return True
    
    def get_tenant_analytics(self, tenant_id: str, period: str = "30d") -> Dict[str, Any]:
        """Get analytics data for a tenant"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return {}
        
        # Mock analytics data - in production, this would query the database
        return {
            "tenant_id": tenant_id,
            "period": period,
            "usage": self.get_tenant_usage(tenant_id),
            "performance": {
                "avg_response_time": 0.15,
                "uptime_percentage": 99.9,
                "error_rate": 0.01
            },
            "growth": {
                "users_growth": 15.5,
                "documents_growth": 25.3,
                "api_usage_growth": 45.2
            },
            "revenue": {
                "current_month": 299.0,
                "previous_month": 299.0,
                "growth_percentage": 0.0
            }
        }
    
    def export_tenant_data(self, tenant_id: str) -> Dict[str, Any]:
        """Export all tenant data for compliance/backup"""
        tenant = self.tenants.get(tenant_id)
        if not tenant:
            return {}
        
        return {
            "tenant_info": asdict(tenant),
            "usage_stats": self.get_tenant_usage(tenant_id),
            "analytics": self.get_tenant_analytics(tenant_id),
            "export_timestamp": datetime.now().isoformat(),
            "export_format": "json"
        }

# Global tenant manager instance
tenant_manager = TenantManager()
