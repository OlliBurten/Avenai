'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient, DashboardStats, Document } from '@/lib/api-client'
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await apiClient.getDashboardStats()
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data)
        }
        
        // Fetch recent documents
        const docsResponse = await apiClient.getDocuments()
        if (docsResponse.success && docsResponse.data) {
          setDocuments(docsResponse.data.slice(0, 5)) // Show last 5
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickStats = [
    {
      title: "Documents Analyzed",
      value: stats?.documents_analyzed?.toString() || "0",
      change: "+12%",
      changeType: "increase",
      icon: DocumentTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "AI Conversations",
      value: stats?.ai_conversations?.toString() || "0",
      change: "+23%",
      changeType: "increase",
      icon: ChatBubbleLeftRightIcon,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Active Users",
      value: stats?.active_users?.toString() || "0",
      change: "+8%",
      changeType: "increase",
      icon: UserGroupIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Response Time",
      value: `${stats?.response_time || 0}s`,
      change: "-15%",
      changeType: "decrease",
      icon: ClockIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  const recentDocuments = documents.length > 0 ? documents.map(doc => ({
    name: doc.name,
    type: doc.type.toUpperCase(),
    size: `${(doc.size / (1024 * 1024)).toFixed(1)} MB`,
    uploaded: new Date(doc.uploaded_at).toLocaleDateString(),
    status: doc.status,
    insights: doc.insights_count
  })) : [
    {
      name: "No documents yet",
      type: "N/A",
      size: "0 MB",
      uploaded: "N/A",
      status: "none",
      insights: 0
    }
  ]

  const recentConversations = [
    {
      question: "What are the key insights from the Q4 report?",
      answer: "The Q4 report shows strong revenue growth of 23%...",
      timestamp: "1 hour ago",
      documents: ["Q4 Financial Report.pdf"]
    },
    {
      question: "How do I implement the new API endpoint?",
      answer: "Based on the documentation, you'll need to...",
      timestamp: "3 hours ago",
      documents: ["API Documentation.md"]
    }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'documents', name: 'Documents', icon: DocumentTextIcon },
    { id: 'conversations', name: 'AI Chat', icon: ChatBubbleLeftRightIcon },
    { id: 'analytics', name: 'Analytics', icon: ArrowTrendingUpIcon }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your documents.</p>
            </div>
            <a href="/upload" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload Document
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'increase' ? (
                        <ArrowUpIcon className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Documents */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
                    <a href="/upload" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View all
                    </a>
                  </div>
                  <div className="space-y-4">
                    {recentDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{doc.uploaded}</p>
                              <div className="flex items-center mt-1">
                                <SparklesIcon className="h-3 w-3 text-yellow-500 mr-1" />
                                <span className="text-xs text-gray-600">{doc.insights} insights</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
                  <div className="flex items-center mb-4">
                    <SparklesIcon className="h-6 w-6 mr-2" />
                    <h2 className="text-lg font-semibold">AI Insights</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Document Trends</p>
                      <p className="text-xs text-blue-100">Your team is analyzing 23% more documents this month</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Popular Questions</p>
                      <p className="text-xs text-blue-100">"Financial analysis" and "API integration" are trending</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-sm font-medium mb-2">Efficiency Gain</p>
                      <p className="text-xs text-blue-100">AI is saving your team ~15 hours per week</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent AI Conversations</h2>
                <a href="/ai-chat" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Start new chat
                </a>
              </div>
              <div className="space-y-4">
                {recentConversations.map((conv, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{conv.question}</p>
                        <p className="text-sm text-gray-600 mb-2">{conv.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {conv.documents.map((doc, docIndex) => (
                              <span key={docIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {doc}
                              </span>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{conv.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Document Management</h2>
            <p className="text-gray-600">Document management interface coming soon...</p>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">AI Chat Conversations</h2>
            <p className="text-gray-600">AI chat interface coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Analytics & Insights</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
