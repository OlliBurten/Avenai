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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  documents?: string[]
  isLoading?: boolean
}

interface Document {
  id: string
  name: string
  type: string
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        // Generate a unique session ID
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        
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
            content: `Hello ${user?.name || 'there'}! I'm your AI assistant. I can help you analyze documents, answer questions, and provide insights. What would you like to know?`,
            timestamp: new Date()
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
      isLoading: true
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Send message to backend
      const response = await apiClient.sendMessage(sessionId, inputMessage)
      
      if (response.success && response.data) {
        // Update assistant message with response
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: response.data.response || 'I apologize, but I couldn\'t process your request.', isLoading: false }
            : msg
        ))
      } else {
        throw new Error(response.message || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isLoading: false }
          : msg
      ))
    } finally {
      setIsLoading(false)
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
        content: `Hello ${user?.name || 'there'}! I'm your AI assistant. I can help you analyze documents, answer questions, and provide insights. What would you like to know?`,
        timestamp: new Date()
      }
    ])
    setSelectedDocuments([])
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">AI Chat</h2>
          <p className="text-sm text-gray-600">Chat with your documents</p>
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

        {/* Actions */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Clear Chat
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-600">
                {selectedDocuments.length > 0 
                  ? `Chatting with ${selectedDocuments.length} document${selectedDocuments.length > 1 ? 's' : ''}`
                  : 'Ask me anything about your documents'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gray-200'
                }`}>
                  {message.role === 'user' ? (
                    <UserIcon className="h-5 w-5 text-white" />
                  ) : (
                    <SparklesIcon className="h-5 w-5 text-gray-600" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  )}
                  
                  {/* Document Context */}
                  {message.documents && message.documents.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        📎 Referencing: {message.documents.length} document{message.documents.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your documents..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Context Info */}
          {selectedDocuments.length > 0 && (
            <div className="mt-3 text-sm text-gray-600">
              💡 Chatting with context from {selectedDocuments.length} selected document{selectedDocuments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
