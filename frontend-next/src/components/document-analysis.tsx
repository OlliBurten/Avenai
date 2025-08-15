'use client'

import { useState } from 'react'
import {
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  ChartBarIcon,
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline'
import React from 'react'

interface AnalysisInsight {
  id: string
  type: 'key_finding' | 'trend' | 'recommendation' | 'risk' | 'opportunity'
  title: string
  description: string
  confidence: number
  category: string
  tags: string[]
}

interface DocumentSection {
  id: string
  title: string
  content: string
  page?: number
  insights: string[]
}

export default function DocumentAnalysis() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null)

  // Mock data - in real app, this would come from the backend
  const documentInfo = {
    name: "Q4 Financial Report 2024.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2 hours ago",
    pages: 24,
    analysisStatus: "completed"
  }

  const insights: AnalysisInsight[] = [
    {
      id: "1",
      type: "key_finding",
      title: "Revenue Growth Exceeds Expectations",
      description: "Q4 revenue increased by 23% year-over-year, significantly outperforming the projected 15% growth target. This represents the strongest quarterly performance in the company's history.",
      confidence: 95,
      category: "Financial Performance",
      tags: ["revenue", "growth", "Q4", "performance"]
    },
    {
      id: "2",
      type: "trend",
      title: "Customer Acquisition Cost Decreasing",
      description: "CAC has decreased by 18% over the past 6 months, indicating improved marketing efficiency and customer targeting strategies.",
      confidence: 87,
      category: "Marketing Metrics",
      tags: ["CAC", "marketing", "efficiency", "trend"]
    },
    {
      id: "3",
      type: "recommendation",
      title: "Expand into Asian Markets",
      description: "Based on current growth patterns and market analysis, expanding into key Asian markets could increase revenue by 35-40% within 18 months.",
      confidence: 78,
      category: "Strategic Planning",
      tags: ["expansion", "Asia", "strategy", "growth"]
    },
    {
      id: "4",
      type: "risk",
      title: "Supply Chain Vulnerabilities",
      description: "Identified potential risks in the supply chain that could impact Q1 2025 production capacity by up to 15%.",
      confidence: 82,
      category: "Risk Management",
      tags: ["supply chain", "risk", "production", "Q1"]
    },
    {
      id: "5",
      type: "opportunity",
      title: "AI Integration Potential",
      description: "Current processes show 40% automation potential through AI integration, which could reduce operational costs by $2.3M annually.",
      confidence: 91,
      category: "Technology",
      tags: ["AI", "automation", "cost reduction", "technology"]
    }
  ]

  const documentSections: DocumentSection[] = [
    {
      id: "executive_summary",
      title: "Executive Summary",
      content: "Q4 2024 demonstrated exceptional performance across all key business metrics...",
      page: 1,
      insights: ["Revenue growth exceeded projections", "Market share increased in key segments"]
    },
    {
      id: "financial_performance",
      title: "Financial Performance",
      content: "Total revenue for Q4 reached $45.2M, representing a 23% increase...",
      page: 3,
      insights: ["23% YoY revenue growth", "Improved profit margins", "Strong cash flow"]
    },
    {
      id: "market_analysis",
      title: "Market Analysis",
      content: "Market conditions remained favorable throughout Q4, with increased demand...",
      page: 8,
      insights: ["Growing market demand", "Competitive positioning", "Customer satisfaction"]
    }
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'key_finding': return LightBulbIcon
      case 'trend': return ChartBarIcon
      case 'recommendation': return ChatBubbleLeftRightIcon
      case 'risk': return DocumentMagnifyingGlassIcon
      case 'opportunity': return LightBulbIcon
      default: return DocumentTextIcon
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'key_finding': return 'text-blue-600 bg-blue-50'
      case 'trend': return 'text-green-600 bg-green-50'
      case 'recommendation': return 'text-purple-600 bg-purple-50'
      case 'risk': return 'text-red-600 bg-red-50'
      case 'opportunity': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Analysis</h1>
              <p className="text-sm text-gray-600">
                AI-powered insights from {documentInfo.name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <ShareIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <BookmarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Info Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span>{documentInfo.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📄 {documentInfo.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📏 {documentInfo.size}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📅 {documentInfo.uploadedAt}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📖 {documentInfo.pages} pages</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                documentInfo.analysisStatus === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {documentInfo.analysisStatus === 'completed' ? '✅ Analysis Complete' : '⏳ Analyzing...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'insights', name: 'AI Insights', icon: LightBulbIcon },
              { id: 'sections', name: 'Document Sections', icon: DocumentTextIcon },
              { id: 'chat', name: 'AI Chat', icon: ChatBubbleLeftRightIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200
                `}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <LightBulbIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{insights.length}</p>
                    <p className="text-sm text-gray-600">Key Insights</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                    <p className="text-sm text-gray-600">Average Confidence</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{documentSections.length}</p>
                    <p className="text-sm text-gray-600">Document Sections</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-sm text-gray-600">Action Items</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Insights Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.slice(0, 4).map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                    onClick={() => {
                      setActiveTab('insights')
                      setSelectedInsight(insight.id)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getInsightColor(insight.type).split(' ')[1]}`}>
                        {React.createElement(getInsightIcon(insight.type), { className: `h-5 w-5 ${getInsightColor(insight.type).split(' ')[0]}` })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getInsightColor(insight.type)}`}>
                            {insight.category}
                          </span>
                          <span className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                            {insight.confidence}%
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{insight.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">AI Insights</h2>
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <ArrowPathIcon className="h-5 w-5" />
                <span>Refresh Analysis</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all duration-200 ${
                    selectedInsight === insight.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-transparent hover:border-gray-200'
                  }`}
                  onClick={() => setSelectedInsight(insight.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-lg ${getInsightColor(insight.type).split(' ')[1]}`}>
                      {React.createElement(getInsightIcon(insight.type), { className: `h-6 w-6 ${getInsightColor(insight.type).split(' ')[0]}` })}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getInsightColor(insight.type)}`}>
                          {insight.category}
                        </span>
                        <span className={`text-lg font-bold ${getConfidenceColor(insight.confidence)}`}>
                          {insight.confidence}%
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-gray-600 mb-4">{insight.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {insight.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Document Sections</h2>
            <div className="space-y-4">
              {documentSections.map((section) => (
                <div key={section.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      {section.page && (
                        <p className="text-sm text-gray-500">Page {section.page}</p>
                      )}
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      View Full Section
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">{section.content}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Key Insights:</h4>
                    <ul className="space-y-1">
                      {section.insights.map((insight, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-sm text-gray-600">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">AI Chat</h2>
              <p className="text-sm text-gray-600">Ask questions about this document</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center py-12">
                <ChatBubbleLeftRightIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                <p className="text-gray-600 mb-6">
                  Ask the AI about any aspect of this document. Get instant answers, clarifications, and deeper insights.
                </p>
                <a
                  href="/chat"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 inline-flex items-center"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Start Chat
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
