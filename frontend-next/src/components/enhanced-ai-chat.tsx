'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import {
  PaperAirplaneIcon,
  DocumentTextIcon,
  UserIcon,
  SparklesIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  documents?: string[]
  isLoading?: boolean
  model?: string
  quality_score?: number
}

interface Document {
  id: string
  name: string
  type: string
}

interface AIModel {
  name: string
  provider: string
  max_tokens: number
  temperature: number
  description: string
}

interface EnhancedFeatures {
  model_used: string
  context_memory: boolean
  document_understanding: boolean
  response_quality: number
}

export default function EnhancedAIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4')
  const [availableModels, setAvailableModels] = useState<Record<string, AIModel>>({})
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [contextMemory, setContextMemory] = useState<any>(null)
  const [responseQuality, setResponseQuality] = useState<number>(0)
  const [showMetrics, setShowMetrics] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chat session and fetch models
  useEffect(() => {
    const initChat = async () => {
      try {
        // Generate a unique session ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        
        // Fetch available AI models
        const modelsResponse = await apiClient.get('/api/v1/ai/models')
        if (modelsResponse.success && modelsResponse.data) {
          setAvailableModels(modelsResponse.data.models)
        }
        
        // Fetch user's documents
        const docsResponse = await apiClient.getDocuments()
        if (docsResponse.success && docsResponse.data) {
          setDocuments(docsResponse.data)
        }
        
        // Add welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello ${user?.name || 'there'}! I'm your enhanced AI assistant with context memory and multi-model support. I can help you analyze documents, answer questions, and provide insights. What would you like to know?`,
            timestamp: new Date(),
            model: 'gpt-4'
          }
        ])
      } catch (error) {
        console.error('Failed to initialize chat:', error)
      }
    }

    if (user) {
      initChat()
    }
  }, [user])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      documents: selectedDocuments
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      model: selectedModel
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Use enhanced chat endpoint
      const response = await apiClient.post('/api/v1/ai-chat/chat/enhanced', {
        message: inputMessage,
        session_id: sessionId,
        document_ids: selectedDocuments.join(','),
        model: selectedModel
      })
      
      if (response.success && response.data) {
        const enhancedFeatures: EnhancedFeatures = response.data.enhanced_features
        
        // Update assistant message with response
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                content: response.data.message.content || 'I apologize, but I couldn\'t process your request.',
                isLoading: false,
                model: enhancedFeatures.model_used,
                quality_score: enhancedFeatures.response_quality
              }
            : msg
        ))
        
        // Update response quality
        setResponseQuality(enhancedFeatures.response_quality)
        
        // Fetch updated context memory
        await fetchContextMemory()
      } else {
        throw new Error(response.message || 'Failed to get response')
      }
    } catch (error) {
      console.error('Enhanced chat error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isLoading: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const fetchContextMemory = async () => {
    try {
      const response = await apiClient.get(`/api/v1/ai-chat/sessions/${sessionId}/context`)
      if (response.success && response.data) {
        setContextMemory(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch context memory:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello ${user?.name || 'there'}! I'm your enhanced AI assistant with context memory and multi-model support. I can help you analyze documents, answer questions, and provide insights. What would you like to know?`,
        timestamp: new Date(),
        model: selectedModel
      }
    ])
    setSelectedDocuments([])
    setContextMemory(null)
    setResponseQuality(0)
  }

  const getModelDisplayName = (modelKey: string) => {
    return availableModels[modelKey]?.name || modelKey
  }

  const getModelDescription = (modelKey: string) => {
    return availableModels[modelKey]?.description || 'AI model'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Enhanced AI Chat</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Select AI Model"
              >
                <Cog6ToothIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Metrics"
              >
                <ChartBarIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Model Selector */}
          {showModelSelector && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(availableModels).map(([key, model]) => (
                  <option key={key} value={key}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current: {getModelDisplayName(selectedModel)}
              </p>
            </div>
          )}

          {/* Metrics Display */}
          {showMetrics && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CpuChipIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Performance</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Response Quality:</span>
                  <span className="font-medium text-blue-900">{responseQuality.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Context Memory:</span>
                  <span className="font-medium text-blue-900">
                    {contextMemory ? `${contextMemory.memory_length}/${contextMemory.max_memory}` : '0/20'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-700">Documents:</span>
                  <span className="font-medium text-blue-900">{selectedDocuments.length}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-600">Enhanced chat with context memory</p>
        </div>

        {/* Document Selection */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Available Documents</h3>
          {documents.length === 0 ? (
            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDocuments.includes(doc.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleDocumentSelection(doc.id)}
                >
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.type}</p>
                    </div>
                    {selectedDocuments.includes(doc.id) && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Context Memory Info */}
        {contextMemory && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Context Memory</h4>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Memory:</span> {contextMemory.memory_length}/{contextMemory.max_memory} messages
              </div>
              {contextMemory.document_context.length > 0 && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Documents:</span> {contextMemory.document_context.length} loaded
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <UserIcon className="h-6 w-6 text-blue-200" />
                    ) : (
                      <div className="relative">
                        <SparklesIcon className="h-6 w-6 text-gray-600" />
                        {message.model && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">
                        {message.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      {message.model && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {getModelDisplayName(message.model)}
                        </span>
                      )}
                      {message.quality_score && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          Quality: {message.quality_score.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    {message.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                        <span className="text-gray-600">AI is thinking...</span>
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content.replace(/\n/g, '<br/>') 
                        }}
                      />
                    )}
                    
                    <div className="text-xs text-gray-500 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your documents..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Enhanced Features Indicator */}
          <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <CpuChipIcon className="h-3 w-3" />
              <span>Context Memory</span>
            </div>
            <div className="flex items-center space-x-1">
              <DocumentTextIcon className="h-3 w-3" />
              <span>Document Understanding</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChartBarIcon className="h-3 w-3" />
              <span>Quality Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
