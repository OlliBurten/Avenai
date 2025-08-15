"""
Enhanced AI Features for Avenai
Handles context memory, conversation history, document analysis, and AI optimization
"""

import json
import time
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import re
from collections import defaultdict, deque

class AIContextType(Enum):
    CONVERSATION = "conversation"
    DOCUMENT = "document"
    USER_PREFERENCE = "user_preference"
    SYSTEM_CONTEXT = "system_context"

class AIConversationState(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"
    EXPIRED = "expired"

@dataclass
class AIContext:
    id: str
    type: AIContextType
    content: str
    metadata: Dict[str, Any]
    created_at: datetime
    expires_at: Optional[datetime]
    importance_score: float  # 0.0 to 1.0
    usage_count: int

@dataclass
class AIConversation:
    id: str
    session_id: str
    tenant_id: str
    user_id: str
    title: str
    state: AIConversationState
    context_summary: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    total_tokens: int
    metadata: Dict[str, Any]

@dataclass
class AIDocumentAnalysis:
    id: str
    document_id: str
    tenant_id: str
    analysis_type: str
    content: str
    confidence_score: float
    created_at: datetime
    metadata: Dict[str, Any]

class ContextMemory:
    """Manages AI context and memory for better conversations"""
    
    def __init__(self, max_contexts: int = 1000, max_age_hours: int = 168):  # 1 week
        self.contexts: Dict[str, AIContext] = {}
        self.context_index: Dict[str, List[str]] = defaultdict(list)  # type -> context_ids
        self.max_contexts = max_contexts
        self.max_age_hours = max_age_hours
        self.context_usage: Dict[str, int] = defaultdict(int)
    
    def add_context(self, context_type: AIContextType, content: str, 
                   metadata: Dict[str, Any] = None, importance_score: float = 0.5,
                   expires_at: Optional[datetime] = None) -> str:
        """Add new context to memory"""
        context_id = f"ctx_{hashlib.md5(f'{content[:100]}{time.time()}'.encode()).hexdigest()[:8]}"
        
        # Set default expiration if not provided
        if not expires_at:
            expires_at = datetime.now() + timedelta(hours=self.max_age_hours)
        
        context = AIContext(
            id=context_id,
            type=context_type,
            content=content,
            metadata=metadata or {},
            created_at=datetime.now(),
            expires_at=expires_at,
            importance_score=importance_score,
            usage_count=0
        )
        
        self.contexts[context_id] = context
        self.context_index[context_type.value].append(context_id)
        
        # Cleanup old contexts if limit exceeded
        self._cleanup_old_contexts()
        
        return context_id
    
    def get_relevant_contexts(self, query: str, context_type: Optional[AIContextType] = None,
                            limit: int = 10, min_importance: float = 0.3) -> List[AIContext]:
        """Get relevant contexts based on query and filters"""
        relevant_contexts = []
        
        # Simple keyword matching (in production, use vector similarity)
        query_keywords = set(re.findall(r'\w+', query.lower()))
        
        for context in self.contexts.values():
            # Check if context is expired
            if context.expires_at and datetime.now() > context.expires_at:
                continue
            
            # Filter by type if specified
            if context_type and context.type != context_type:
                continue
            
            # Filter by importance
            if context.importance_score < min_importance:
                continue
            
            # Calculate relevance score based on keyword overlap and importance
            context_keywords = set(re.findall(r'\w+', context.content.lower()))
            keyword_overlap = len(query_keywords.intersection(context_keywords))
            relevance_score = (keyword_overlap / max(len(query_keywords), 1)) * context.importance_score
            
            if relevance_score > 0.1:  # Minimum relevance threshold
                relevant_contexts.append((context, relevance_score))
        
        # Sort by relevance and return top results
        relevant_contexts.sort(key=lambda x: x[1], reverse=True)
        return [ctx for ctx, _ in relevant_contexts[:limit]]
    
    def update_context_usage(self, context_id: str) -> None:
        """Update usage count for a context"""
        if context_id in self.contexts:
            self.contexts[context_id].usage_count += 1
            self.context_usage[context_id] += 1
    
    def _cleanup_old_contexts(self) -> None:
        """Remove old and unused contexts"""
        if len(self.contexts) <= self.max_contexts:
            return
        
        # Sort contexts by usage and age
        context_scores = []
        now = datetime.now()
        
        for context_id, context in self.contexts.items():
            age_hours = (now - context.created_at).total_seconds() / 3600
            usage_score = self.context_usage.get(context_id, 0)
            importance_score = context.importance_score
            
            # Calculate overall score (higher = keep)
            score = (usage_score * 0.4 + importance_score * 0.4 + (1.0 / (age_hours + 1)) * 0.2)
            context_scores.append((context_id, score))
        
        # Remove lowest scoring contexts
        context_scores.sort(key=lambda x: x[1])
        contexts_to_remove = context_scores[:len(self.contexts) - self.max_contexts]
        
        for context_id, _ in contexts_to_remove:
            self._remove_context(context_id)
    
    def _remove_context(self, context_id: str) -> None:
        """Remove a context and clean up references"""
        if context_id in self.contexts:
            context = self.contexts[context_id]
            # Remove from index
            if context_id in self.context_index[context.type.value]:
                self.context_index[context.type.value].remove(context_id)
            # Remove from contexts
            del self.contexts[context_id]
            # Remove from usage tracking
            if context_id in self.context_usage:
                del self.context_usage[context_id]

class ConversationManager:
    """Manages AI conversation state and history"""
    
    def __init__(self):
        self.conversations: Dict[str, AIConversation] = {}
        self.conversation_sessions: Dict[str, List[str]] = defaultdict(list)  # session_id -> conversation_ids
    
    def create_conversation(self, session_id: str, tenant_id: str, user_id: str, 
                           title: str = None) -> AIConversation:
        """Create a new AI conversation"""
        conversation_id = f"conv_{hashlib.md5(f'{session_id}{time.time()}'.encode()).hexdigest()[:8]}"
        
        if not title:
            title = f"AI Conversation {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        
        conversation = AIConversation(
            id=conversation_id,
            session_id=session_id,
            tenant_id=tenant_id,
            user_id=user_id,
            title=title,
            state=AIConversationState.ACTIVE,
            context_summary="",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            message_count=0,
            total_tokens=0,
            metadata={
                "model": "gpt-4",
                "temperature": 0.7,
                "max_tokens": 1000,
                "features": ["context_memory", "document_analysis"]
            }
        )
        
        self.conversations[conversation_id] = conversation
        self.conversation_sessions[session_id].append(conversation_id)
        
        return conversation
    
    def get_conversation(self, conversation_id: str) -> Optional[AIConversation]:
        """Get conversation by ID"""
        return self.conversations.get(conversation_id)
    
    def get_conversations_by_session(self, session_id: str) -> List[AIConversation]:
        """Get all conversations for a session"""
        conversation_ids = self.conversation_sessions.get(session_id, [])
        return [self.conversations.get(cid) for cid in conversation_ids if cid in self.conversations]
    
    def update_conversation(self, conversation_id: str, **kwargs) -> Optional[AIConversation]:
        """Update conversation properties"""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return None
        
        for key, value in kwargs.items():
            if hasattr(conversation, key):
                setattr(conversation, key, value)
        
        conversation.updated_at = datetime.now()
        return conversation
    
    def archive_conversation(self, conversation_id: str) -> bool:
        """Archive a conversation"""
        conversation = self.conversations.get(conversation_id)
        if not conversation:
            return False
        
        conversation.state = AIConversationState.ARCHIVED
        conversation.updated_at = datetime.now()
        return True
    
    def generate_context_summary(self, conversation_id: str, messages: List[Dict[str, Any]]) -> str:
        """Generate a summary of conversation context"""
        if not messages:
            return "New conversation started."
        
        # Simple summary generation (in production, use AI to generate better summaries)
        user_messages = [msg for msg in messages if msg.get("role") == "user"]
        ai_messages = [msg for msg in messages if msg.get("role") == "assistant"]
        
        summary_parts = []
        
        if user_messages:
            summary_parts.append(f"User asked {len(user_messages)} questions")
        
        if ai_messages:
            summary_parts.append(f"AI provided {len(ai_messages)} responses")
        
        # Add key topics if available
        topics = set()
        for msg in messages:
            content = msg.get("content", "")
            # Extract potential topics (simple keyword extraction)
            words = re.findall(r'\b\w{4,}\b', content.lower())
            topics.update([word for word in words if len(word) > 4][:5])
        
        if topics:
            summary_parts.append(f"Topics discussed: {', '.join(list(topics)[:3])}")
        
        return ". ".join(summary_parts) + "."

class DocumentAnalyzer:
    """Advanced document analysis and content extraction"""
    
    def __init__(self):
        self.analyses: Dict[str, AIDocumentAnalysis] = {}
        self.document_cache: Dict[str, Dict[str, Any]] = {}
    
    def analyze_document(self, document_id: str, tenant_id: str, content: str,
                        analysis_type: str = "general") -> AIDocumentAnalysis:
        """Analyze document content and extract insights"""
        analysis_id = f"analysis_{hashlib.md5(f'{document_id}{analysis_type}{time.time()}'.encode()).hexdigest()[:8]}"
        
        # Perform analysis based on type
        if analysis_type == "api_documentation":
            analysis_result = self._analyze_api_documentation(content)
        elif analysis_type == "technical_spec":
            analysis_result = self._analyze_technical_spec(content)
        elif analysis_type == "business_document":
            analysis_result = self._analyze_business_document(content)
        else:
            analysis_result = self._analyze_general_document(content)
        
        analysis = AIDocumentAnalysis(
            id=analysis_id,
            document_id=document_id,
            tenant_id=tenant_id,
            analysis_type=analysis_type,
            content=analysis_result["content"],
            confidence_score=analysis_result["confidence"],
            created_at=datetime.now(),
            metadata=analysis_result["metadata"]
        )
        
        self.analyses[analysis_id] = analysis
        return analysis
    
    def _analyze_api_documentation(self, content: str) -> Dict[str, Any]:
        """Analyze API documentation content"""
        # Extract API endpoints, methods, parameters, etc.
        endpoints = re.findall(r'(GET|POST|PUT|DELETE|PATCH)\s+([^\s\n]+)', content, re.IGNORECASE)
        parameters = re.findall(r'(\w+):\s*([^\n]+)', content)
        
        analysis_content = f"API Documentation Analysis:\n"
        analysis_content += f"Found {len(endpoints)} endpoints:\n"
        
        for method, path in endpoints[:10]:  # Limit to first 10
            analysis_content += f"- {method} {path}\n"
        
        if parameters:
            analysis_content += f"\nKey parameters: {', '.join([p[0] for p in parameters[:5]])}\n"
        
        return {
            "content": analysis_content,
            "confidence": 0.85,
            "metadata": {
                "endpoints_found": len(endpoints),
                "parameters_found": len(parameters),
                "analysis_method": "regex_pattern_matching"
            }
        }
    
    def _analyze_technical_spec(self, content: str) -> Dict[str, Any]:
        """Analyze technical specification content"""
        # Extract technical details, requirements, etc.
        requirements = re.findall(r'(?:requirement|spec|feature):\s*([^\n]+)', content, re.IGNORECASE)
        technical_terms = re.findall(r'\b(?:API|SDK|integration|authentication|authorization|endpoint|webhook)\b', content, re.IGNORECASE)
        
        analysis_content = f"Technical Specification Analysis:\n"
        if requirements:
            analysis_content += f"Found {len(requirements)} requirements/specifications\n"
        
        if technical_terms:
            unique_terms = list(set(technical_terms))
            analysis_content += f"Technical focus areas: {', '.join(unique_terms[:5])}\n"
        
        return {
            "content": analysis_content,
            "confidence": 0.80,
            "metadata": {
                "requirements_found": len(requirements),
                "technical_terms": len(technical_terms),
                "analysis_method": "keyword_extraction"
            }
        }
    
    def _analyze_business_document(self, content: str) -> Dict[str, Any]:
        """Analyze business document content"""
        # Extract business terms, metrics, etc.
        business_terms = re.findall(r'\b(?:revenue|profit|cost|ROI|KPI|metric|growth|market|customer|user)\b', content, re.IGNORECASE)
        numbers = re.findall(r'\b\d+(?:\.\d+)?(?:%|k|m|b)?\b', content)
        
        analysis_content = f"Business Document Analysis:\n"
        if business_terms:
            unique_terms = list(set(business_terms))
            analysis_content += f"Business focus: {', '.join(unique_terms[:5])}\n"
        
        if numbers:
            analysis_content += f"Contains {len(numbers)} numerical references\n"
        
        return {
            "content": analysis_content,
            "confidence": 0.75,
            "metadata": {
                "business_terms": len(business_terms),
                "numerical_references": len(numbers),
                "analysis_method": "business_term_extraction"
            }
        }
    
    def _analyze_general_document(self, content: str) -> Dict[str, Any]:
        """General document analysis"""
        # Basic content analysis
        words = content.split()
        sentences = content.split('.')
        paragraphs = content.split('\n\n')
        
        analysis_content = f"General Document Analysis:\n"
        analysis_content += f"Document length: {len(words)} words, {len(sentences)} sentences, {len(paragraphs)} paragraphs\n"
        
        # Extract potential key phrases
        key_phrases = []
        for sentence in sentences[:5]:  # First 5 sentences
            if len(sentence.strip()) > 20:
                key_phrases.append(sentence.strip()[:100] + "...")
        
        if key_phrases:
            analysis_content += f"\nKey content preview:\n"
            for phrase in key_phrases:
                analysis_content += f"- {phrase}\n"
        
        return {
            "content": analysis_content,
            "confidence": 0.70,
            "metadata": {
                "word_count": len(words),
                "sentence_count": len(sentences),
                "paragraph_count": len(paragraphs),
                "analysis_method": "basic_content_analysis"
            }
        }
    
    def get_document_analysis(self, document_id: str) -> List[AIDocumentAnalysis]:
        """Get all analyses for a document"""
        return [analysis for analysis in self.analyses.values() if analysis.document_id == document_id]
    
    def get_analysis_by_type(self, tenant_id: str, analysis_type: str) -> List[AIDocumentAnalysis]:
        """Get analyses by type for a tenant"""
        return [analysis for analysis in self.analyses.values() 
                if analysis.tenant_id == tenant_id and analysis.analysis_type == analysis_type]

# Global instances
context_memory = ContextMemory()
conversation_manager = ConversationManager()
document_analyzer = DocumentAnalyzer()
