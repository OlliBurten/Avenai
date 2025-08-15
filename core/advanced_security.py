"""
Advanced Security System for Avenai
Handles role-based access control, audit logging, and security policies
"""

import json
import time
import hashlib
import hmac
from typing import Dict, List, Optional, Any, Tuple, Set
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
from collections import defaultdict

class Permission(Enum):
    # Document permissions
    DOCUMENT_READ = "document:read"
    DOCUMENT_WRITE = "document:write"
    DOCUMENT_DELETE = "document:delete"
    DOCUMENT_UPLOAD = "document:upload"
    
    # Chat permissions
    CHAT_READ = "chat:read"
    CHAT_WRITE = "chat:write"
    CHAT_DELETE = "chat:delete"
    CHAT_CREATE_SESSION = "chat:create_session"
    
    # User management permissions
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    USER_DELETE = "user:delete"
    USER_INVITE = "user:invite"
    
    # API permissions
    API_READ = "api:read"
    API_WRITE = "api:write"
    API_KEY_MANAGE = "api:key_manage"
    
    # Analytics permissions
    ANALYTICS_READ = "analytics:read"
    ANALYTICS_EXPORT = "analytics:export"
    
    # System permissions
    SYSTEM_CONFIG = "system:config"
    SYSTEM_MONITOR = "system:monitor"
    SYSTEM_ADMIN = "system:admin"
    
    # Webhook permissions
    WEBHOOK_READ = "webhook:read"
    WEBHOOK_WRITE = "webhook:write"
    WEBHOOK_DELETE = "webhook:delete"
    
    # Tenant permissions
    TENANT_READ = "tenant:read"
    TENANT_WRITE = "tenant:write"
    TENANT_DELETE = "tenant:delete"

class Role(Enum):
    VIEWER = "viewer"
    USER = "user"
    MANAGER = "manager"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class SecurityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class SecurityPolicy:
    id: str
    name: str
    description: str
    tenant_id: str
    rules: List[Dict[str, Any]]
    security_level: SecurityLevel
    enabled: bool
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

@dataclass
class AuditLog:
    id: str
    tenant_id: str
    user_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Dict[str, Any]
    ip_address: str
    user_agent: str
    timestamp: datetime
    security_level: SecurityLevel
    metadata: Dict[str, Any]

@dataclass
class RoleDefinition:
    name: str
    permissions: Set[Permission]
    description: str
    security_level: SecurityLevel
    metadata: Dict[str, Any]

class RoleBasedAccessControl:
    """Implements role-based access control system"""
    
    def __init__(self):
        self.roles: Dict[str, RoleDefinition] = {}
        self.user_roles: Dict[str, Set[str]] = defaultdict(set)  # user_id -> set of roles
        self.role_permissions: Dict[str, Set[Permission]] = defaultdict(set)
        self._initialize_default_roles()
    
    def _initialize_default_roles(self):
        """Initialize default roles with permissions"""
        # Viewer role - read-only access
        viewer_role = RoleDefinition(
            name=Role.VIEWER.value,
            permissions={
                Permission.DOCUMENT_READ,
                Permission.CHAT_READ,
                Permission.ANALYTICS_READ
            },
            description="Read-only access to documents, chat, and analytics",
            security_level=SecurityLevel.LOW,
            metadata={"is_default": True}
        )
        
        # User role - basic user access
        user_role = RoleDefinition(
            name=Role.USER.value,
            permissions={
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_WRITE,
                Permission.DOCUMENT_UPLOAD,
                Permission.CHAT_READ,
                Permission.CHAT_WRITE,
                Permission.CHAT_CREATE_SESSION,
                Permission.API_READ,
                Permission.ANALYTICS_READ
            },
            description="Basic user access with document and chat capabilities",
            security_level=SecurityLevel.MEDIUM,
            metadata={"is_default": True}
        )
        
        # Manager role - team management access
        manager_role = RoleDefinition(
            name=Role.MANAGER.value,
            permissions={
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_WRITE,
                Permission.DOCUMENT_DELETE,
                Permission.DOCUMENT_UPLOAD,
                Permission.CHAT_READ,
                Permission.CHAT_WRITE,
                Permission.CHAT_DELETE,
                Permission.CHAT_CREATE_SESSION,
                Permission.USER_READ,
                Permission.USER_INVITE,
                Permission.API_READ,
                Permission.API_WRITE,
                Permission.ANALYTICS_READ,
                Permission.ANALYTICS_EXPORT,
                Permission.WEBHOOK_READ,
                Permission.WEBHOOK_WRITE
            },
            description="Team management access with user and webhook management",
            security_level=SecurityLevel.HIGH,
            metadata={"is_default": True}
        )
        
        # Admin role - full access
        admin_role = RoleDefinition(
            name=Role.ADMIN.value,
            permissions={
                Permission.DOCUMENT_READ,
                Permission.DOCUMENT_WRITE,
                Permission.DOCUMENT_DELETE,
                Permission.DOCUMENT_UPLOAD,
                Permission.CHAT_READ,
                Permission.CHAT_WRITE,
                Permission.CHAT_DELETE,
                Permission.CHAT_CREATE_SESSION,
                Permission.USER_READ,
                Permission.USER_WRITE,
                Permission.USER_DELETE,
                Permission.USER_INVITE,
                Permission.API_READ,
                Permission.API_WRITE,
                Permission.API_KEY_MANAGE,
                Permission.ANALYTICS_READ,
                Permission.ANALYTICS_EXPORT,
                Permission.WEBHOOK_READ,
                Permission.WEBHOOK_WRITE,
                Permission.WEBHOOK_DELETE,
                Permission.SYSTEM_CONFIG,
                Permission.SYSTEM_MONITOR
            },
            description="Full administrative access to all features",
            security_level=SecurityLevel.HIGH,
            metadata={"is_default": True}
        )
        
        # Super Admin role - system-wide access
        super_admin_role = RoleDefinition(
            name=Role.SUPER_ADMIN.value,
            permissions=set(Permission),  # All permissions
            description="System-wide access including tenant management",
            security_level=SecurityLevel.CRITICAL,
            metadata={"is_default": True, "system_role": True}
        )
        
        # Register roles
        self.roles[Role.VIEWER.value] = viewer_role
        self.roles[Role.USER.value] = user_role
        self.roles[Role.MANAGER.value] = manager_role
        self.roles[Role.ADMIN.value] = admin_role
        self.roles[Role.SUPER_ADMIN.value] = super_admin_role
    
    def assign_role_to_user(self, user_id: str, role_name: str) -> bool:
        """Assign a role to a user"""
        if role_name not in self.roles:
            return False
        
        self.user_roles[user_id].add(role_name)
        return True
    
    def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        """Remove a role from a user"""
        if user_id in self.user_roles and role_name in self.user_roles[user_id]:
            self.user_roles[user_id].remove(role_name)
            return True
        return False
    
    def get_user_roles(self, user_id: str) -> Set[str]:
        """Get all roles assigned to a user"""
        return self.user_roles.get(user_id, set())
    
    def get_user_permissions(self, user_id: str) -> Set[Permission]:
        """Get all permissions for a user based on their roles"""
        permissions = set()
        user_roles = self.get_user_roles(user_id)
        
        for role_name in user_roles:
            if role_name in self.roles:
                permissions.update(self.roles[role_name].permissions)
        
        return permissions
    
    def check_permission(self, user_id: str, permission: Permission) -> bool:
        """Check if a user has a specific permission"""
        user_permissions = self.get_user_permissions(user_id)
        return permission in user_permissions
    
    def check_permissions(self, user_id: str, permissions: List[Permission]) -> bool:
        """Check if a user has all specified permissions"""
        user_permissions = self.get_user_permissions(user_id)
        return all(perm in user_permissions for perm in permissions)
    
    def create_custom_role(self, name: str, permissions: Set[Permission], 
                          description: str, security_level: SecurityLevel = SecurityLevel.MEDIUM) -> bool:
        """Create a custom role"""
        if name in self.roles:
            return False  # Role already exists
        
        custom_role = RoleDefinition(
            name=name,
            permissions=permissions,
            description=description,
            security_level=security_level,
            metadata={"is_custom": True, "created_at": datetime.now().isoformat()}
        )
        
        self.roles[name] = custom_role
        return True
    
    def update_role_permissions(self, role_name: str, permissions: Set[Permission]) -> bool:
        """Update permissions for a role"""
        if role_name not in self.roles:
            return False
        
        self.roles[role_name].permissions = permissions
        return True
    
    def get_role_info(self, role_name: str) -> Optional[RoleDefinition]:
        """Get information about a role"""
        return self.roles.get(role_name)
    
    def list_roles(self) -> List[str]:
        """List all available roles"""
        return list(self.roles.keys())

class SecurityPolicyManager:
    """Manages security policies and rules"""
    
    def __init__(self):
        self.policies: Dict[str, SecurityPolicy] = {}
        self.policy_cache: Dict[str, Dict[str, Any]] = {}
    
    def create_policy(self, name: str, description: str, tenant_id: str,
                     rules: List[Dict[str, Any]], security_level: SecurityLevel = SecurityLevel.MEDIUM) -> SecurityPolicy:
        """Create a new security policy"""
        policy_id = f"policy_{uuid.uuid4().hex[:8]}"
        
        policy = SecurityPolicy(
            id=policy_id,
            name=name,
            description=description,
            tenant_id=tenant_id,
            rules=rules,
            security_level=security_level,
            enabled=True,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={
                "created_by": "system",
                "version": "1.0"
            }
        )
        
        self.policies[policy_id] = policy
        return policy
    
    def get_policy(self, policy_id: str) -> Optional[SecurityPolicy]:
        """Get policy by ID"""
        return self.policies.get(policy_id)
    
    def get_policies_by_tenant(self, tenant_id: str) -> List[SecurityPolicy]:
        """Get all policies for a tenant"""
        return [policy for policy in self.policies.values() if policy.tenant_id == tenant_id]
    
    def update_policy(self, policy_id: str, **kwargs) -> Optional[SecurityPolicy]:
        """Update policy properties"""
        policy = self.policies.get(policy_id)
        if not policy:
            return None
        
        for key, value in kwargs.items():
            if hasattr(policy, key):
                setattr(policy, key, value)
        
        policy.updated_at = datetime.now()
        return policy
    
    def delete_policy(self, policy_id: str) -> bool:
        """Delete a security policy"""
        if policy_id in self.policies:
            del self.policies[policy_id]
            return True
        return False
    
    def evaluate_policy(self, policy_id: str, context: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """Evaluate a security policy against a context"""
        policy = self.policies.get(policy_id)
        if not policy or not policy.enabled:
            return True, {"reason": "Policy not found or disabled"}
        
        # Simple rule evaluation (in production, use a more sophisticated rule engine)
        for rule in policy.rules:
            rule_type = rule.get("type")
            rule_condition = rule.get("condition")
            rule_action = rule.get("action", "allow")
            
            if rule_type == "ip_whitelist":
                client_ip = context.get("ip_address")
                allowed_ips = rule_condition.get("ips", [])
                if client_ip not in allowed_ips:
                    return False, {
                        "reason": "IP address not in whitelist",
                        "rule": rule,
                        "client_ip": client_ip
                    }
            
            elif rule_type == "time_restriction":
                current_time = datetime.now().time()
                start_time = rule_condition.get("start_time")
                end_time = rule_condition.get("end_time")
                
                if start_time and end_time:
                    if not (start_time <= current_time <= end_time):
                        return False, {
                            "reason": "Access outside allowed time window",
                            "rule": rule,
                            "current_time": current_time.isoformat()
                        }
            
            elif rule_type == "rate_limit":
                user_id = context.get("user_id")
                action = context.get("action")
                rate_key = f"{user_id}:{action}"
                
                # Simple rate limiting (in production, use Redis or similar)
                current_count = self.policy_cache.get(rate_key, {}).get("count", 0)
                limit = rule_condition.get("limit", 100)
                window = rule_condition.get("window", 3600)  # seconds
                
                if current_count >= limit:
                    return False, {
                        "reason": "Rate limit exceeded",
                        "rule": rule,
                        "current_count": current_count,
                        "limit": limit
                    }
                
                # Update rate limit counter
                if rate_key not in self.policy_cache:
                    self.policy_cache[rate_key] = {"count": 0, "reset_time": time.time() + window}
                
                self.policy_cache[rate_key]["count"] += 1
        
        return True, {"reason": "Policy evaluation passed"}

class AuditLogger:
    """Handles audit logging for security and compliance"""
    
    def __init__(self):
        self.audit_logs: List[AuditLog] = []
        self.max_logs = 100000
        self.log_filters: Dict[str, List[str]] = defaultdict(list)
    
    def log_action(self, tenant_id: str, user_id: str, action: str, resource_type: str,
                  resource_id: str, details: Dict[str, Any], ip_address: str, user_agent: str,
                  security_level: SecurityLevel = SecurityLevel.MEDIUM) -> str:
        """Log an audit event"""
        log_id = f"audit_{uuid.uuid4().hex[:8]}"
        
        audit_log = AuditLog(
            id=log_id,
            tenant_id=tenant_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            timestamp=datetime.now(),
            security_level=security_level,
            metadata={
                "log_id": log_id,
                "session_id": details.get("session_id"),
                "request_id": details.get("request_id")
            }
        )
        
        self.audit_logs.append(audit_log)
        
        # Apply filters
        self._apply_log_filters(audit_log)
        
        # Cleanup old logs
        if len(self.audit_logs) > self.max_logs:
            self.audit_logs.pop(0)
        
        return log_id
    
    def _apply_log_filters(self, audit_log: AuditLog):
        """Apply configured log filters"""
        for filter_type, filter_values in self.log_filters.items():
            if filter_type == "actions" and audit_log.action in filter_values:
                audit_log.metadata["filtered"] = True
            elif filter_type == "users" and audit_log.user_id in filter_values:
                audit_log.metadata["filtered"] = True
            elif filter_type == "security_levels" and audit_log.security_level.value in filter_values:
                audit_log.metadata["filtered"] = True
    
    def get_audit_logs(self, tenant_id: str = None, user_id: str = None, 
                       action: str = None, resource_type: str = None,
                       start_time: datetime = None, end_time: datetime = None,
                       limit: int = 100) -> List[AuditLog]:
        """Get audit logs with filters"""
        filtered_logs = self.audit_logs
        
        if tenant_id:
            filtered_logs = [log for log in filtered_logs if log.tenant_id == tenant_id]
        
        if user_id:
            filtered_logs = [log for log in filtered_logs if log.user_id == user_id]
        
        if action:
            filtered_logs = [log for log in filtered_logs if log.action == action]
        
        if resource_type:
            filtered_logs = [log for log in filtered_logs if log.resource_type == resource_type]
        
        if start_time:
            filtered_logs = [log for log in filtered_logs if log.timestamp >= start_time]
        
        if end_time:
            filtered_logs = [log for log in filtered_logs if log.timestamp <= end_time]
        
        # Sort by timestamp (newest first)
        filtered_logs.sort(key=lambda x: x.timestamp, reverse=True)
        
        return filtered_logs[:limit]
    
    def get_audit_summary(self, tenant_id: str, period: str = "24h") -> Dict[str, Any]:
        """Get audit log summary for a tenant"""
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
        
        recent_logs = self.get_audit_logs(tenant_id=tenant_id, start_time=start_time)
        
        if not recent_logs:
            return {
                "tenant_id": tenant_id,
                "period": period,
                "total_actions": 0,
                "unique_users": 0,
                "action_breakdown": {},
                "security_levels": {},
                "top_resources": []
            }
        
        # Calculate summary
        total_actions = len(recent_logs)
        unique_users = len(set(log.user_id for log in recent_logs))
        
        # Action breakdown
        action_breakdown = defaultdict(int)
        for log in recent_logs:
            action_breakdown[log.action] += 1
        
        # Security level breakdown
        security_levels = defaultdict(int)
        for log in recent_logs:
            security_levels[log.security_level.value] += 1
        
        # Top resources
        resource_counts = defaultdict(int)
        for log in recent_logs:
            resource_key = f"{log.resource_type}:{log.resource_id}"
            resource_counts[resource_key] += 1
        
        top_resources = sorted(resource_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "tenant_id": tenant_id,
            "period": period,
            "total_actions": total_actions,
            "unique_users": unique_users,
            "action_breakdown": dict(action_breakdown),
            "security_levels": dict(security_levels),
            "top_resources": [{"resource": resource, "count": count} for resource, count in top_resources]
        }
    
    def export_audit_logs(self, tenant_id: str, format: str = "json") -> str:
        """Export audit logs for compliance"""
        logs = self.get_audit_logs(tenant_id=tenant_id)
        
        if format == "json":
            return json.dumps([asdict(log) for log in logs], default=str, indent=2)
        elif format == "csv":
            # Simple CSV export
            csv_lines = ["id,tenant_id,user_id,action,resource_type,resource_id,timestamp,security_level"]
            for log in logs:
                csv_lines.append(f"{log.id},{log.tenant_id},{log.user_id},{log.action},{log.resource_type},{log.resource_id},{log.timestamp},{log.security_level.value}")
            return "\n".join(csv_lines)
        else:
            return "Unsupported format"

# Global instances
rbac = RoleBasedAccessControl()
security_policy_manager = SecurityPolicyManager()
audit_logger = AuditLogger()
