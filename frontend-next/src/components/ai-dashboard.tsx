'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import {
  CogIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [aiInsights, setAiInsights] = useState([])
  const [threatAnalysis, setThreatAnalysis] = useState([])
  const [userBehavior, setUserBehavior] = useState([])
  const [documentIntelligence, setDocumentIntelligence] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    fetchAIData()
  }, [])

  const fetchAIData = async () => {
    setIsLoading(true)
    try {
      const [insights, threats, behaviors, intelligence] = await Promise.all([
        apiClient.get('/api/v1/ai/insights'),
        apiClient.get('/api/v1/ai/threat-detection'),
        apiClient.get('/api/v1/ai/user-behavior'),
        apiClient.get('/api/v1/ai/document-intelligence')
      ])
      
      if (insights.success) setAiInsights(insights.data?.insights || [])
      if (threats.success) setThreatAnalysis(threats.data?.threats || [])
      if (behaviors.success) setUserBehavior(behaviors.data?.behaviors || [])
      if (intelligence.success) setDocumentIntelligence(intelligence.data?.intelligence || [])
    } catch (error) {
      console.error('Failed to fetch AI data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInsight = async (type: string) => {
    try {
      const dateRange = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      }
      
      await apiClient.post('/api/v1/ai/insights/generate', {
        insight_type: type,
        data_source: 'audit_logs',
        analysis_period: JSON.stringify(dateRange),
        user_id: user?.id || 'user_001'
      })
      
      fetchAIData()
    } catch (error) {
      console.error('Failed to generate insight:', error)
    }
  }

  const analyzeThreats = async (type: string) => {
    try {
      await apiClient.post('/api/v1/ai/threat-detection/analyze', {
        analysis_type: type,
        data_source: 'audit_logs',
        user_id: user?.id || 'user_001'
      })
      
      fetchAIData()
    } catch (error) {
      console.error('Failed to analyze threats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI & Machine Learning Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Advanced AI insights, threat detection, and intelligent analytics
              </p>
            </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CogIcon className="h-5 w-5 text-purple-600" />
                <span>AI Engine Active</span>
              </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-4 sm:px-6 lg:px-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'insights', name: 'AI Insights', icon: CogIcon },
            { id: 'threats', name: 'Threat Detection', icon: ShieldExclamationIcon },
            { id: 'behavior', name: 'User Behavior', icon: UserIcon },
            { id: 'intelligence', name: 'Document Intelligence', icon: DocumentTextIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading AI data...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <CogIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">AI Insights</p>
                        <p className="text-2xl font-semibold text-gray-900">{aiInsights.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Threat Analysis</p>
                        <p className="text-2xl font-semibold text-gray-900">{threatAnalysis.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <UserIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Behavior Patterns</p>
                        <p className="text-2xl font-semibold text-gray-900">{userBehavior.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Document Intelligence</p>
                        <p className="text-2xl font-semibold text-gray-900">{documentIntelligence.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Quick AI Actions</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <button
                        onClick={() => generateInsight('security')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Generate Security Insights
                      </button>
                      <button
                        onClick={() => analyzeThreats('real_time')}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Analyze Real-time Threats
                      </button>
                      <button
                        onClick={() => generateInsight('performance')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Generate Performance Insights
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">AI System Status</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">AI Engine</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ML Models</span>
                        <span className="text-sm font-medium text-green-600">Loaded</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Threat Detection</span>
                        <span className="text-sm font-medium text-green-600">Monitoring</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Performance</span>
                        <span className="text-sm font-medium text-green-600">Optimal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">AI-Generated Insights</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateInsight('security')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Security
                    </button>
                    <button
                      onClick={() => generateInsight('performance')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Performance
                    </button>
                    <button
                      onClick={() => generateInsight('compliance')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Compliance
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Insights</h3>
                  </div>
                  <div className="p-6">
                    {aiInsights.length > 0 ? (
                      <div className="space-y-4">
                        {aiInsights.slice(0, 5).map((insight: any) => (
                          <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{insight.type}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(insight.generated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Confidence: {(insight.confidence_score * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">
                              Model: {insight.ai_model_used}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No insights generated yet. Click the buttons above to create insights.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'threats' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">AI Threat Detection</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => analyzeThreats('real_time')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Real-time
                    </button>
                    <button
                      onClick={() => analyzeThreats('historical')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Historical
                    </button>
                    <button
                      onClick={() => analyzeThreats('predictive')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Predictive
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Threat Analysis Results</h3>
                  </div>
                  <div className="p-6">
                    {threatAnalysis.length > 0 ? (
                      <div className="space-y-4">
                        {threatAnalysis.slice(0, 5).map((threat: any) => (
                          <div key={threat.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{threat.analysis_type}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                threat.threat_level === 'high' ? 'bg-red-100 text-red-800' :
                                threat.threat_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {threat.threat_level}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Risk Score: {(threat.risk_score * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">
                              AI Confidence: {(threat.ai_confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No threat analysis performed yet. Click the buttons above to analyze threats.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'behavior' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">AI User Behavior Analysis</h2>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Behavior Patterns</h3>
                  </div>
                  <div className="p-6">
                    {userBehavior.length > 0 ? (
                      <div className="space-y-4">
                        {userBehavior.slice(0, 5).map((behavior: any) => (
                          <div key={behavior.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{behavior.behavior_type.replace('_', ' ')}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(behavior.analyzed_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              User: {behavior.user_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              AI Confidence: {(behavior.ai_confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No user behavior analysis performed yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">AI Document Intelligence</h2>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Document Analysis</h3>
                  </div>
                  <div className="p-6">
                    {documentIntelligence.length > 0 ? (
                      <div className="space-y-4">
                        {documentIntelligence.slice(0, 5).map((intelligence: any) => (
                          <div key={intelligence.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{intelligence.analysis_type.replace('_', ' ')}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(intelligence.analyzed_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Document: {intelligence.document_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              AI Confidence: {(intelligence.ai_confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No document intelligence analysis performed yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
