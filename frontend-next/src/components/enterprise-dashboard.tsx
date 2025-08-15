'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import {
  ShieldExclamationIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ServerIcon,
  GlobeAltIcon,
  KeyIcon
} from '@heroicons/react/24/outline'

interface SecurityAuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: string
  ip_address: string
  user_agent: string
  timestamp: string
  severity: string
}

interface SecurityPolicy {
  id: string
  name: string
  type: string
  rules: any
  created_by: string
  created_at: string
  status: string
}

interface ComplianceReport {
  id: string
  type: string
  date_range: any
  generated_by: string
  generated_at: string
  status: string
  summary: any
  details: any
}

interface IntegrationWebhook {
  id: string
  name: string
  url: string
  events: string[]
  status: string
  last_triggered: string | null
  success_count: number
  failure_count: number
}

interface PerformanceMetrics {
  system_health: any
  application_metrics: any
  collaboration_metrics: any
}

export default function EnterpriseDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([])
  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([])
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
  const [integrationWebhooks, setIntegrationWebhooks] = useState<IntegrationWebhook[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<SecurityPolicy | null>(null)
  const [showCreatePolicy, setShowCreatePolicy] = useState(false)
  const [showCreateWebhook, setShowCreateWebhook] = useState(false)
  
  const { user } = useAuth()

  // Fetch enterprise data
  useEffect(() => {
    const fetchEnterpriseData = async () => {
      setIsLoading(true)
      try {
        // Fetch audit logs
        const logsResponse = await apiClient.get('/api/v1/security/audit-logs')
        if (logsResponse.success && logsResponse.data) {
          setAuditLogs(logsResponse.data.audit_logs || [])
        }

        // Fetch security policies
        const policiesResponse = await apiClient.get('/api/v1/security/policies')
        if (policiesResponse.success && policiesResponse.data) {
          setSecurityPolicies(policiesResponse.data.policies || [])
        }

        // Fetch compliance reports
        const reportsResponse = await apiClient.get('/api/v1/compliance/reports')
        if (reportsResponse.success && reportsResponse.data) {
          setComplianceReports(reportsResponse.data.reports || [])
        }

        // Fetch integration webhooks
        const webhooksResponse = await apiClient.get('/api/v1/integrations/webhooks')
        if (webhooksResponse.success && webhooksResponse.data) {
          setIntegrationWebhooks(webhooksResponse.data.webhooks || [])
        }

        // Fetch performance metrics
        const metricsResponse = await apiClient.get('/api/v1/performance/metrics')
        if (metricsResponse.success && metricsResponse.data) {
          setPerformanceMetrics(metricsResponse.data.metrics)
        }
      } catch (error) {
        console.error('Failed to fetch enterprise data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnterpriseData()
  }, [])

  const createSecurityPolicy = async (policyData: any) => {
    try {
      const response = await apiClient.post('/api/v1/security/policies', {
        policy_name: policyData.name,
        policy_type: policyData.type,
        policy_rules: JSON.stringify(policyData.rules),
        created_by: user?.id || 'user_001'
      })

      if (response.success) {
        // Refresh policies
        const policiesResponse = await apiClient.get('/api/v1/security/policies')
        if (policiesResponse.success && policiesResponse.data) {
          setSecurityPolicies(policiesResponse.data.policies || [])
        }
        setShowCreatePolicy(false)
      }
    } catch (error) {
      console.error('Failed to create security policy:', error)
    }
  }

  const createIntegrationWebhook = async (webhookData: any) => {
    try {
      const response = await apiClient.post('/api/v1/integrations/webhooks', {
        webhook_name: webhookData.name,
        webhook_url: webhookData.url,
        events: JSON.stringify(webhookData.events),
        secret_key: webhookData.secretKey,
        created_by: user?.id || 'user_001'
      })

      if (response.success) {
        // Refresh webhooks
        const webhooksResponse = await apiClient.get('/api/v1/integrations/webhooks')
        if (webhooksResponse.success && webhooksResponse.data) {
          setIntegrationWebhooks(webhooksResponse.data.webhooks || [])
        }
        setShowCreateWebhook(false)
      }
    } catch (error) {
      console.error('Failed to create integration webhook:', error)
    }
  }

  const generateComplianceReport = async (reportType: string) => {
    try {
      const dateRange = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      }

      const response = await apiClient.post('/api/v1/compliance/reports', {
        report_type: reportType,
        date_range: JSON.stringify(dateRange),
        generated_by: user?.id || 'user_001'
      })

      if (response.success) {
        // Refresh reports
        const reportsResponse = await apiClient.get('/api/v1/compliance/reports')
        if (reportsResponse.success && reportsResponse.data) {
          setComplianceReports(reportsResponse.data.reports || [])
        }
      }
    } catch (error) {
      console.error('Failed to generate compliance report:', error)
    }
  }

  const sendSlackNotification = async (channel: string, message: string) => {
    try {
      const response = await apiClient.post('/api/v1/integrations/slack/notify', {
        channel: channel,
        message: message,
        user_id: user?.id || 'user_001'
      })

      if (response.success) {
        alert('Slack notification sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  const sendTeamsNotification = async (channel: string, message: string) => {
    try {
      const response = await apiClient.post('/api/v1/integrations/teams/notify', {
        channel: channel,
        message: message,
        user_id: user?.id || 'user_001'
      })

      if (response.success) {
        alert('Teams notification sent successfully!')
      }
    } catch (error) {
      console.error('Failed to send Teams notification:', error)
    }
  }

  const clearPerformanceCache = async (cacheType: string) => {
    try {
      const response = await apiClient.post('/api/v1/performance/cache/clear', {
        cache_type: cacheType,
        user_id: user?.id || 'user_001'
      })

      if (response.success) {
        alert(`Cache cleared successfully: ${cacheType}`)
      }
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'error': return 'text-orange-600 bg-orange-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'error': return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'warning': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <CheckCircleIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Security, compliance, and integration management
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <ShieldExclamationIcon className="h-5 w-5 text-green-600" />
                <span>Enterprise Security Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-4 sm:px-6 lg:px-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'security', name: 'Security', icon: ShieldExclamationIcon },
            { id: 'compliance', name: 'Compliance', icon: DocumentTextIcon },
            { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
            { id: 'performance', name: 'Performance', icon: ServerIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading enterprise data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                                      <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShieldExclamationIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Security Score</p>
                      <p className="text-2xl font-semibold text-gray-900">95%</p>
                    </div>
                  </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserGroupIcon className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Active Users</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {performanceMetrics?.application_metrics?.active_users || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DocumentTextIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Documents</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {performanceMetrics?.collaboration_metrics?.total_documents || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ServerIcon className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">System Health</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {performanceMetrics?.system_health?.cpu_usage?.toFixed(1) || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Recent Security Events</h3>
                    </div>
                    <div className="p-6">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center space-x-3 py-2">
                          <div className={`p-1 rounded-full ${getSeverityColor(log.severity)}`}>
                            {getSeverityIcon(log.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{log.action}</p>
                            <p className="text-xs text-gray-500">{log.details}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">System Performance</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {performanceMetrics?.system_health && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CPU Usage</span>
                            <span className="text-sm font-medium">{performanceMetrics.system_health.cpu_usage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${performanceMetrics.system_health.cpu_usage}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Memory Usage</span>
                            <span className="text-sm font-medium">{performanceMetrics.system_health.memory_usage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${performanceMetrics.system_health.memory_usage}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Security Management</h2>
                  <button
                    onClick={() => setShowCreatePolicy(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Policy
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Security Policies</h3>
                    </div>
                    <div className="p-6">
                      {securityPolicies.map((policy) => (
                        <div key={policy.id} className="border-b border-gray-200 py-3 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{policy.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{policy.type} policy</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {policy.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
                    </div>
                    <div className="p-6 max-h-96 overflow-y-auto">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="border-b border-gray-200 py-2 last:border-b-0">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded-full ${getSeverityColor(log.severity)}`}>
                              {getSeverityIcon(log.severity)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{log.action}</p>
                              <p className="text-xs text-gray-500">by {log.user_id} on {log.resource_type}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Compliance Management</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateComplianceReport('gdpr')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Generate GDPR Report
                    </button>
                    <button
                      onClick={() => generateComplianceReport('soc2')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Generate SOC2 Report
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Compliance Reports</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {complianceReports.map((report) => (
                        <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 capitalize">{report.type}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">
                            Generated by {report.generated_by}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.generated_at).toLocaleDateString()}
                          </p>
                          {report.summary && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600">
                                Compliance Score: <span className="font-medium">{report.summary.compliance_score}%</span>
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Integration Management</h2>
                  <button
                    onClick={() => setShowCreateWebhook(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Webhook
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Integration Webhooks</h3>
                    </div>
                    <div className="p-6">
                      {integrationWebhooks.map((webhook) => (
                        <div key={webhook.id} className="border-b border-gray-200 py-3 last:border-b-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{webhook.name}</p>
                              <p className="text-xs text-gray-500">{webhook.url}</p>
                              <p className="text-xs text-gray-500">{webhook.events.length} events</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {webhook.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Quick Notifications</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slack Channel</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="#general"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            id="slack-channel"
                          />
                          <button
                            onClick={() => {
                              const channel = (document.getElementById('slack-channel') as HTMLInputElement).value
                              const message = 'Test notification from Avenai Enterprise Dashboard'
                              sendSlackNotification(channel, message)
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            Send
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teams Channel</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="General"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                            id="teams-channel"
                          />
                          <button
                            onClick={() => {
                              const channel = (document.getElementById('teams-channel') as HTMLInputElement).value
                              const message = 'Test notification from Avenai Enterprise Dashboard'
                              sendTeamsNotification(channel, message)
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Performance Management</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => clearPerformanceCache('documents')}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Clear Document Cache
                    </button>
                    <button
                      onClick={() => clearPerformanceCache('all')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Clear All Cache
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">System Health</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {performanceMetrics?.system_health && (
                        <>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">CPU Usage</span>
                              <span className="text-sm font-medium">{performanceMetrics.system_health.cpu_usage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${performanceMetrics.system_health.cpu_usage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Memory Usage</span>
                              <span className="text-sm font-medium">{performanceMetrics.system_health.memory_usage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${performanceMetrics.system_health.memory_usage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Disk Usage</span>
                              <span className="text-sm font-medium">{performanceMetrics.system_health.disk_usage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${performanceMetrics.system_health.disk_usage}%` }}
                              ></div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Application Metrics</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {performanceMetrics?.application_metrics && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">
                                {performanceMetrics.application_metrics.active_users}
                              </p>
                              <p className="text-xs text-gray-500">Active Users</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                {performanceMetrics.application_metrics.total_requests}
                              </p>
                              <p className="text-xs text-gray-500">Total Requests</p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-gray-200">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Response Time</span>
                              <span className="text-sm font-medium">{performanceMetrics.application_metrics.average_response_time}ms</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (performanceMetrics.application_metrics.average_response_time / 200) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Policy Modal */}
      {showCreatePolicy && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Security Policy</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Policy Name</label>
                  <input
                    type="text"
                    id="policy-name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter policy name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Policy Type</label>
                  <select
                    id="policy-type"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="password">Password</option>
                    <option value="session">Session</option>
                    <option value="api">API</option>
                    <option value="data">Data</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Policy Rules (JSON)</label>
                  <textarea
                    id="policy-rules"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder='{"min_length": 8, "require_special": true}'
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreatePolicy(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const name = (document.getElementById('policy-name') as HTMLInputElement).value
                    const type = (document.getElementById('policy-type') as HTMLSelectElement).value
                    const rules = (document.getElementById('policy-rules') as HTMLTextAreaElement).value
                    
                    if (name && type && rules) {
                      createSecurityPolicy({ name, type, rules: JSON.parse(rules) })
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showCreateWebhook && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create Integration Webhook</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Webhook Name</label>
                  <input
                    type="text"
                    id="webhook-name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter webhook name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Webhook URL</label>
                  <input
                    type="url"
                    id="webhook-url"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Events (JSON Array)</label>
                  <textarea
                    id="webhook-events"
                    rows={2}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder='["user.created", "document.uploaded"]'
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                  <input
                    type="text"
                    id="webhook-secret"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter secret key"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateWebhook(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const name = (document.getElementById('webhook-name') as HTMLInputElement).value
                    const url = (document.getElementById('webhook-url') as HTMLInputElement).value
                    const events = (document.getElementById('webhook-events') as HTMLTextAreaElement).value
                    const secretKey = (document.getElementById('webhook-secret') as HTMLInputElement).value
                    
                    if (name && url && events && secretKey) {
                      createIntegrationWebhook({ name, url, events: JSON.parse(events), secretKey })
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
