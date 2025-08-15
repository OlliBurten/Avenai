"""
Webhook System for Avenai
Handles real-time integrations, notifications, and event-driven architecture
"""

import json
import time
import hashlib
import hmac
import asyncio
from typing import Dict, List, Optional, Any, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import aiohttp
from collections import defaultdict, deque

class WebhookStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    ERROR = "error"

class WebhookEvent(Enum):
    DOCUMENT_UPLOADED = "document.uploaded"
    DOCUMENT_DELETED = "document.deleted"
    CHAT_MESSAGE_SENT = "chat.message.sent"
    CHAT_SESSION_CREATED = "chat.session.created"
    USER_LOGIN = "user.login"
    USER_LOGOUT = "user.logout"
    API_KEY_CREATED = "api_key.created"
    API_KEY_REVOKED = "api_key.revoked"
    TENANT_CREATED = "tenant.created"
    TENANT_UPDATED = "tenant.updated"
    SYSTEM_ALERT = "system.alert"
    CUSTOM_EVENT = "custom.event"

@dataclass
class Webhook:
    id: str
    name: str
    url: str
    tenant_id: str
    events: List[WebhookEvent]
    status: WebhookStatus
    secret: str
    headers: Dict[str, str]
    retry_count: int
    timeout: int
    created_at: datetime
    updated_at: datetime
    last_triggered: Optional[datetime]
    metadata: Dict[str, Any]

@dataclass
class WebhookDelivery:
    id: str
    webhook_id: str
    event: WebhookEvent
    payload: Dict[str, Any]
    status_code: Optional[int]
    response_body: Optional[str]
    delivery_time: float
    success: bool
    retry_count: int
    created_at: datetime
    metadata: Dict[str, Any]

@dataclass
class WebhookEventData:
    event: WebhookEvent
    tenant_id: str
    user_id: Optional[str]
    data: Dict[str, Any]
    timestamp: datetime
    event_id: str

class WebhookManager:
    """Manages webhook configurations and delivery"""
    
    def __init__(self):
        self.webhooks: Dict[str, Webhook] = {}
        self.webhook_events: Dict[WebhookEvent, List[str]] = defaultdict(list)  # event -> webhook_ids
        self.delivery_history: List[WebhookDelivery] = []
        self.max_retries = 3
        self.retry_delays = [1, 5, 15]  # seconds
        self._initialize_default_webhooks()
    
    def _initialize_default_webhooks(self):
        """Initialize default webhooks for demo"""
        default_webhook = self.create_webhook(
            name="Default Demo Webhook",
            url="https://webhook.site/your-unique-url",
            tenant_id="tenant_default",
            events=[WebhookEvent.DOCUMENT_UPLOADED, WebhookEvent.CHAT_MESSAGE_SENT],
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        print(f"🔔 Default webhook created: {default_webhook.id}")
    
    def create_webhook(self, name: str, url: str, tenant_id: str, 
                      events: List[WebhookEvent], headers: Dict[str, str] = None,
                      timeout: int = 30, retry_count: int = 3) -> Webhook:
        """Create a new webhook"""
        webhook_id = f"webhook_{uuid.uuid4().hex[:8]}"
        secret = self._generate_webhook_secret()
        
        webhook = Webhook(
            id=webhook_id,
            name=name,
            url=url,
            tenant_id=tenant_id,
            events=events,
            status=WebhookStatus.ACTIVE,
            secret=secret,
            headers=headers or {"Content-Type": "application/json"},
            retry_count=retry_count,
            timeout=timeout,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            last_triggered=None,
            metadata={
                "created_by": "system",
                "description": f"Webhook for {name}",
                "version": "1.0"
            }
        )
        
        self.webhooks[webhook_id] = webhook
        
        # Register webhook for events
        for event in events:
            self.webhook_events[event].append(webhook_id)
        
        return webhook
    
    def _generate_webhook_secret(self) -> str:
        """Generate a secure webhook secret"""
        return f"wh_{uuid.uuid4().hex}_{uuid.uuid4().hex[:8]}"
    
    def get_webhook(self, webhook_id: str) -> Optional[Webhook]:
        """Get webhook by ID"""
        return self.webhooks.get(webhook_id)
    
    def get_webhooks_by_tenant(self, tenant_id: str) -> List[Webhook]:
        """Get all webhooks for a tenant"""
        return [webhook for webhook in self.webhooks.values() if webhook.tenant_id == tenant_id]
    
    def get_webhooks_by_event(self, event: WebhookEvent) -> List[Webhook]:
        """Get all webhooks registered for an event"""
        webhook_ids = self.webhook_events.get(event, [])
        return [self.webhooks.get(wid) for wid in webhook_ids if wid in self.webhooks]
    
    def update_webhook(self, webhook_id: str, **kwargs) -> Optional[Webhook]:
        """Update webhook properties"""
        webhook = self.webhooks.get(webhook_id)
        if not webhook:
            return None
        
        # Handle events update
        if "events" in kwargs:
            old_events = set(webhook.events)
            new_events = set(kwargs["events"])
            
            # Remove from old events
            for event in old_events - new_events:
                if webhook_id in self.webhook_events[event]:
                    self.webhook_events[event].remove(webhook_id)
            
            # Add to new events
            for event in new_events - old_events:
                self.webhook_events[event].append(webhook_id)
        
        # Update other properties
        for key, value in kwargs.items():
            if hasattr(webhook, key):
                setattr(webhook, key, value)
        
        webhook.updated_at = datetime.now()
        return webhook
    
    def delete_webhook(self, webhook_id: str) -> bool:
        """Delete a webhook"""
        webhook = self.webhooks.get(webhook_id)
        if not webhook:
            return False
        
        # Remove from event registrations
        for event in webhook.events:
            if webhook_id in self.webhook_events[event]:
                self.webhook_events[event].remove(webhook_id)
        
        # Remove webhook
        del self.webhooks[webhook_id]
        return True
    
    def suspend_webhook(self, webhook_id: str, reason: str = None) -> bool:
        """Suspend a webhook"""
        webhook = self.webhooks.get(webhook_id)
        if not webhook:
            return False
        
        webhook.status = WebhookStatus.SUSPENDED
        webhook.updated_at = datetime.now()
        
        if not webhook.metadata:
            webhook.metadata = {}
        webhook.metadata["suspension"] = {
            "reason": reason,
            "timestamp": datetime.now().isoformat()
        }
        
        return True
    
    def activate_webhook(self, webhook_id: str) -> bool:
        """Activate a suspended webhook"""
        webhook = self.webhooks.get(webhook_id)
        if not webhook:
            return False
        
        webhook.status = WebhookStatus.ACTIVE
        webhook.updated_at = datetime.now()
        
        if webhook.metadata and "suspension" in webhook.metadata:
            webhook.metadata["suspension"]["reactivated_at"] = datetime.now().isoformat()
        
        return True

class WebhookDeliveryManager:
    """Manages webhook delivery and retry logic"""
    
    def __init__(self):
        self.delivery_queue: deque = deque()
        self.delivery_history: List[WebhookDelivery] = []
        self.max_history = 10000
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def initialize(self):
        """Initialize HTTP session"""
        if not self.session:
            self.session = aiohttp.ClientSession()
    
    async def cleanup(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def trigger_webhook(self, webhook: Webhook, event_data: WebhookEventData) -> WebhookDelivery:
        """Trigger a webhook delivery"""
        delivery_id = f"delivery_{uuid.uuid4().hex[:8]}"
        start_time = time.time()
        
        # Prepare payload
        payload = self._prepare_payload(webhook, event_data)
        
        # Attempt delivery
        try:
            await self.initialize()
            
            async with self.session.post(
                webhook.url,
                json=payload,
                headers=webhook.headers,
                timeout=aiohttp.ClientTimeout(total=webhook.timeout)
            ) as response:
                response_body = await response.text()
                delivery_time = time.time() - start_time
                
                delivery = WebhookDelivery(
                    id=delivery_id,
                    webhook_id=webhook.id,
                    event=event_data.event,
                    payload=payload,
                    status_code=response.status,
                    response_body=response_body,
                    delivery_time=delivery_time,
                    success=200 <= response.status < 300,
                    retry_count=0,
                    created_at=datetime.now(),
                    metadata={
                        "user_agent": "Avenai-Webhook/1.0",
                        "ip_address": "system"
                    }
                )
                
                # Update webhook last triggered
                webhook.last_triggered = datetime.now()
                
        except Exception as e:
            delivery_time = time.time() - start_time
            
            delivery = WebhookDelivery(
                id=delivery_id,
                webhook_id=webhook.id,
                event=event_data.event,
                payload=payload,
                status_code=None,
                response_body=str(e),
                delivery_time=delivery_time,
                success=False,
                retry_count=0,
                created_at=datetime.now(),
                metadata={
                    "error": str(e),
                    "error_type": type(e).__name__
                }
            )
        
        # Store delivery record
        self.delivery_history.append(delivery)
        if len(self.delivery_history) > self.max_history:
            self.delivery_history.pop(0)
        
        # Handle retry logic for failed deliveries
        if not delivery.success and webhook.retry_count > 0:
            await self._schedule_retry(webhook, delivery)
        
        return delivery
    
    def _prepare_payload(self, webhook: Webhook, event_data: WebhookEventData) -> Dict[str, Any]:
        """Prepare webhook payload with signature"""
        payload = {
            "event": event_data.event.value,
            "event_id": event_data.event_id,
            "timestamp": event_data.timestamp.isoformat(),
            "tenant_id": event_data.tenant_id,
            "user_id": event_data.user_id,
            "data": event_data.data
        }
        
        # Add webhook metadata
        payload["webhook"] = {
            "id": webhook.id,
            "name": webhook.name
        }
        
        # Generate signature
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            webhook.secret.encode(),
            payload_str.encode(),
            hashlib.sha256
        ).hexdigest()
        
        payload["signature"] = signature
        return payload
    
    async def _schedule_retry(self, webhook: Webhook, delivery: WebhookDelivery):
        """Schedule a retry for failed delivery"""
        if delivery.retry_count >= webhook.retry_count:
            return
        
        # Calculate delay based on retry count
        delay = self.retry_delays[min(delivery.retry_count, len(self.retry_delays) - 1)]
        
        # Schedule retry
        asyncio.create_task(self._retry_delivery(webhook, delivery, delay))
    
    async def _retry_delivery(self, webhook: Webhook, delivery: WebhookDelivery, delay: int):
        """Retry webhook delivery after delay"""
        await asyncio.sleep(delay)
        
        # Create new delivery attempt
        delivery.retry_count += 1
        
        # Recreate event data from original delivery
        event_data = WebhookEventData(
            event=delivery.event,
            tenant_id=webhook.tenant_id,
            user_id=delivery.payload.get("user_id"),
            data=delivery.payload.get("data", {}),
            timestamp=datetime.now(),
            event_id=delivery.payload.get("event_id", str(uuid.uuid4()))
        )
        
        # Attempt delivery again
        await self.trigger_webhook(webhook, event_data)
    
    def get_delivery_history(self, webhook_id: str = None, limit: int = 100) -> List[WebhookDelivery]:
        """Get delivery history, optionally filtered by webhook"""
        if webhook_id:
            history = [d for d in self.delivery_history if d.webhook_id == webhook_id]
        else:
            history = self.delivery_history
        
        return sorted(history, key=lambda x: x.created_at, reverse=True)[:limit]
    
    def get_delivery_stats(self, webhook_id: str = None, period: str = "24h") -> Dict[str, Any]:
        """Get delivery statistics"""
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
        
        # Filter deliveries by time and webhook
        recent_deliveries = [
            d for d in self.delivery_history
            if d.created_at >= start_time and (not webhook_id or d.webhook_id == webhook_id)
        ]
        
        if not recent_deliveries:
            return {
                "period": period,
                "total_deliveries": 0,
                "successful_deliveries": 0,
                "failed_deliveries": 0,
                "success_rate": 0,
                "avg_delivery_time": 0
            }
        
        total_deliveries = len(recent_deliveries)
        successful_deliveries = sum(1 for d in recent_deliveries if d.success)
        failed_deliveries = total_deliveries - successful_deliveries
        avg_delivery_time = sum(d.delivery_time for d in recent_deliveries) / total_deliveries
        
        return {
            "period": period,
            "total_deliveries": total_deliveries,
            "successful_deliveries": successful_deliveries,
            "failed_deliveries": failed_deliveries,
            "success_rate": (successful_deliveries / total_deliveries) * 100,
            "avg_delivery_time": avg_delivery_time
        }

class WebhookEventManager:
    """Manages webhook event triggering and routing"""
    
    def __init__(self, webhook_manager: WebhookManager, delivery_manager: WebhookDeliveryManager):
        self.webhook_manager = webhook_manager
        self.delivery_manager = delivery_manager
        self.event_queue: deque = deque()
        self.event_handlers: Dict[WebhookEvent, List[Callable]] = defaultdict(list)
    
    def register_event_handler(self, event: WebhookEvent, handler: Callable):
        """Register a custom event handler"""
        self.event_handlers[event].append(handler)
    
    async def trigger_event(self, event: WebhookEvent, tenant_id: str, user_id: str = None,
                          data: Dict[str, Any] = None) -> List[WebhookDelivery]:
        """Trigger a webhook event for all registered webhooks"""
        event_id = str(uuid.uuid4())
        event_data = WebhookEventData(
            event=event,
            tenant_id=tenant_id,
            user_id=user_id,
            data=data or {},
            timestamp=datetime.now(),
            event_id=event_id
        )
        
        # Add to event queue
        self.event_queue.append(event_data)
        
        # Get webhooks for this event
        webhooks = self.webhook_manager.get_webhooks_by_event(event)
        active_webhooks = [w for w in webhooks if w.status == WebhookStatus.ACTIVE]
        
        # Trigger deliveries
        deliveries = []
        for webhook in active_webhooks:
            if webhook.tenant_id == tenant_id:  # Only deliver to same tenant
                delivery = await self.delivery_manager.trigger_webhook(webhook, event_data)
                deliveries.append(delivery)
        
        # Execute custom event handlers
        for handler in self.event_handlers[event]:
            try:
                await handler(event_data)
            except Exception as e:
                print(f"Error in event handler for {event}: {e}")
        
        return deliveries
    
    def get_event_queue(self) -> List[WebhookEventData]:
        """Get current event queue"""
        return list(self.event_queue)
    
    def clear_event_queue(self):
        """Clear the event queue"""
        self.event_queue.clear()

# Global instances
webhook_manager = WebhookManager()
webhook_delivery_manager = WebhookDeliveryManager()
webhook_event_manager = WebhookEventManager(webhook_manager, webhook_delivery_manager)
