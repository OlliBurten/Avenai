'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  UserIcon,
  DocumentTextIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ServerIcon,
  GlobeAltIcon,
  KeyIcon,
  BellIcon
} from '@heroicons/react/24/outline'

export default function AdvancedPlatformDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [advancedTenants, setAdvancedTenants] = useState([])
  const [advancedReports, setAdvancedReports] = useState([])
  const [businessIntelligence, setBusinessIntelligence] = useState([])
  const [advancedUserRoles, setAdvancedUserRoles] = useState([])
  const [userLifecycle, setUserLifecycle] = useState([])
  const [encryptionKeys, setEncryptionKeys] = useState([])
  const [securityPolicies, setSecurityPolicies] = useState([])
  const [apiManagement, setApiManagement] = useState([])
  const [monitoringAlerts, setMonitoringAlerts] = useState([])
  const [systemMetrics, setSystemMetrics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    fetchAdvancedPlatformData()
  }, [])

  const fetchAdvancedPlatformData = async () => {
    setIsLoading(true)
    try {
      const [
        tenants, reports, bi, roles, lifecycle, 
        keys, policies, apis, alerts, metrics
      ] = await Promise.all([
        apiClient.get('/api/v1/advanced-tenants'),
        apiClient.get('/api/v1/advanced-reports'),
        apiClient.get('/api/v1/business-intelligence'),
        apiClient.get('/api/v1/advanced-user-roles'),
        apiClient.get('/api/v1/user-lifecycle'),
        apiClient.get('/api/v1/encryption/keys/advanced'),
        apiClient.get('/api/v1/security/policies/advanced'),
        apiClient.get('/api/v1/api-management'),
        apiClient.get('/api/v1/monitoring/alerts'),
        apiClient.get('/api/v1/system/metrics')
      ])
      
      if (tenants.success) setAdvancedTenants(tenants.data?.tenants || [])
      if (reports.success) setAdvancedReports(reports.data?.reports || [])
      if (bi.success) setBusinessIntelligence(bi.data?.insights || [])
      if (roles.success) setAdvancedUserRoles(roles.data?.roles || [])
      if (lifecycle.success) setUserLifecycle(lifecycle.data?.lifecycle || [])
      if (keys.success) setEncryptionKeys(keys.data?.keys || [])
      if (policies.success) setSecurityPolicies(policies.data?.policies || [])
      if (apis.success) setApiManagement(apis.data?.apis || [])
      if (alerts.success) setMonitoringAlerts(alerts.data?.alerts || [])
      if (metrics.success) setSystemMetrics(metrics.data?.metrics || [])
    } catch (error) {
      console.error('Failed to fetch advanced platform data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createAdvancedTenant = async () => {
    try {
      await apiClient.post('/api/v1/advanced-tenants/create', {
        tenant_name: 'Demo Enterprise',
        tenant_type: 'enterprise',
        isolation_level: 'strict',
        custom_domain: 'demo.avenai.io',
        admin_user_id: user?.id || 'user_001'
      })
      
      fetchAdvancedPlatformData()
    } catch (error) {
      console.error('Failed to create advanced tenant:', error)
    }
  }

  const generateAdvancedReport = async (type: string) => {
    try {
      const dateRange = {
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString()
      }
      
      await apiClient.post('/api/v1/advanced-reports/generate', {
        report_type: type,
        report_period: JSON.stringify(dateRange),
        report_filters: JSON.stringify({ tenant_id: 'demo' }),
        user_id: user?.id || 'user_001'
      })
      
      fetchAdvancedPlatformData()
    } catch (error) {
      console.error('Failed to generate advanced report:', error)
    }
  }

  const createAdvancedUserRole = async () => {
    try {
      await apiClient.post('/api/v1/advanced-user-roles/create', {
        role_name: 'Senior Manager',
        role_description: 'Advanced role with elevated permissions',
        permissions: JSON.stringify(['admin_privileges', 'api_access', 'sensitive_data']),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchAdvancedPlatformData()
    } catch (error) {
      console.error('Failed to create advanced user role:', error)
    }
  }

  const createMonitoringAlert = async (type: string, severity: string) => {
    try {
      await apiClient.post('/api/v1/monitoring/alerts/create', {
        alert_type: type,
        alert_severity: severity,
        alert_conditions: JSON.stringify({
          warning_threshold: 80,
          critical_threshold: 95,
          duration: '5 minutes'
        }),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchAdvancedPlatformData()
    } catch (error) {
      console.error('Failed to create monitoring alert:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Advanced Platform Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Enterprise-grade multi-tenancy, security, and platform management
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <ServerIcon className="h-5 w-5 text-blue-600" />
              <span>Platform Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-4 sm:px-6 lg:px-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'tenants', name: 'Multi-Tenancy', icon: BuildingOfficeIcon },
            { id: 'reports', name: 'Advanced Reports', icon: DocumentTextIcon },
            { id: 'intelligence', name: 'Business Intelligence', icon: ChartBarIcon },
            { id: 'users', name: 'User Management', icon: UserIcon },
            { id: 'security', name: 'Advanced Security', icon: ShieldExclamationIcon },
            { id: 'api', name: 'API Management', icon: CogIcon },
            { id: 'monitoring', name: 'Monitoring & Alerts', icon: BellIcon }
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

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading advanced platform data...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Advanced Tenants</p>
                        <p className="text-2xl font-semibold text-gray-900">{advancedTenants.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Advanced Reports</p>
                        <p className="text-2xl font-semibold text-gray-900">{advancedReports.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <ShieldExclamationIcon className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Security Policies</p>
                        <p className="text-2xl font-semibold text-gray-900">{securityPolicies.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <BellIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Monitoring Alerts</p>
                        <p className="text-2xl font-semibold text-gray-900">{monitoringAlerts.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Quick Platform Actions</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <button
                        onClick={createAdvancedTenant}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Create Advanced Tenant
                      </button>
                      <button
                        onClick={() => generateAdvancedReport('business_intelligence')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Generate BI Report
                      </button>
                      <button
                        onClick={createAdvancedUserRole}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Create Advanced Role
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Platform Status</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Multi-Tenancy</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Advanced Security</span>
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Management</span>
                        <span className="text-sm font-medium text-green-600">Configured</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Monitoring</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tenants' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Advanced Multi-Tenancy</h2>
                  <button
                    onClick={createAdvancedTenant}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Tenant
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Tenant Configurations</h3>
                  </div>
                  <div className="p-6">
                    {advancedTenants.length > 0 ? (
                      <div className="space-y-4">
                        {advancedTenants.map((tenant: any) => (
                          <div key={tenant.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                tenant.isolation_level === 'strict' ? 'bg-red-100 text-red-800' :
                                tenant.isolation_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {tenant.isolation_level}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Type: {tenant.type} | Domain: {tenant.custom_domain}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(tenant.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No advanced tenants created yet. Click the button above to create one.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Advanced Reporting</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => generateAdvancedReport('business_intelligence')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      BI Report
                    </button>
                    <button
                      onClick={() => generateAdvancedReport('compliance')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Compliance Report
                    </button>
                    <button
                      onClick={() => generateAdvancedReport('performance')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Performance Report
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Generated Reports</h3>
                  </div>
                  <div className="p-6">
                    {advancedReports.length > 0 ? (
                      <div className="space-y-4">
                        {advancedReports.slice(0, 5).map((report: any) => (
                          <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{report.type.replace('_', ' ')}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(report.generated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Generated by: {report.generated_by}
                            </p>
                            <p className="text-xs text-gray-500">
                              Visualizations: {report.visualizations?.join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No advanced reports generated yet. Click the buttons above to create reports.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intelligence' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Business Intelligence</h2>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">BI Insights</h3>
                  </div>
                  <div className="p-6">
                    {businessIntelligence.length > 0 ? (
                      <div className="space-y-4">
                        {businessIntelligence.slice(0, 5).map((insight: any) => (
                          <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{insight.type.replace('_', ' ')}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(insight.generated_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Confidence: {(insight.confidence_score * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">
                              Data Freshness: {insight.data_freshness}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No business intelligence insights generated yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Advanced User Management</h2>
                  <button
                    onClick={createAdvancedUserRole}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Role
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">User Roles</h3>
                    </div>
                    <div className="p-6">
                      {advancedUserRoles.length > 0 ? (
                        <div className="space-y-4">
                          {advancedUserRoles.slice(0, 3).map((role: any) => (
                            <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{role.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(role.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                              <p className="text-xs text-gray-500">
                                Permissions: {role.permissions?.length || 0}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No advanced user roles created yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">User Lifecycle</h3>
                    </div>
                    <div className="p-6">
                      {userLifecycle.length > 0 ? (
                        <div className="space-y-4">
                          {userLifecycle.slice(0, 3).map((lifecycle: any) => (
                            <div key={lifecycle.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">{lifecycle.action}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(lifecycle.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                User: {lifecycle.user_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {lifecycle.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No user lifecycle events recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Advanced Security Features</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Encryption Keys</h3>
                    </div>
                    <div className="p-6">
                      {encryptionKeys.length > 0 ? (
                        <div className="space-y-4">
                          {encryptionKeys.slice(0, 3).map((key: any) => (
                            <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{key.name}</span>
                                <span className="text-xs text-gray-500">{key.type}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Purpose: {key.purpose.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(key.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No advanced encryption keys created yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Security Policies</h3>
                    </div>
                    <div className="p-6">
                      {securityPolicies.length > 0 ? (
                        <div className="space-y-4">
                          {securityPolicies.slice(0, 3).map((policy: any) => (
                            <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{policy.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{policy.type.replace('_', ' ')}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Enforcement: {policy.enforcement.mode}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(policy.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No advanced security policies created yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">API Management</h2>
                
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">API Configurations</h3>
                  </div>
                  <div className="p-6">
                    {apiManagement.length > 0 ? (
                      <div className="space-y-4">
                        {apiManagement.map((api: any) => (
                          <div key={api.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{api.name}</span>
                              <span className="text-xs text-gray-500">v{api.version}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Features: {Object.keys(api.features).filter(k => api.features[k]).length} enabled
                            </p>
                            <p className="text-xs text-gray-500">
                              Configured: {new Date(api.configured_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No API management configurations found.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Monitoring & Alerts</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => createMonitoringAlert('performance', 'medium')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Performance Alert
                    </button>
                    <button
                      onClick={() => createMonitoringAlert('security', 'high')}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Security Alert
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Monitoring Alerts</h3>
                    </div>
                    <div className="p-6">
                      {monitoringAlerts.length > 0 ? (
                        <div className="space-y-4">
                          {monitoringAlerts.slice(0, 3).map((alert: any) => (
                            <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">{alert.type}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                  alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {alert.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Created: {new Date(alert.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                Status: {alert.status}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No monitoring alerts created yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">System Metrics</h3>
                    </div>
                    <div className="p-6">
                      {systemMetrics.length > 0 ? (
                        <div className="space-y-4">
                          {systemMetrics.slice(0, 3).map((metric: any) => (
                            <div key={metric.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">{metric.type}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(metric.collected_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Tenant: {metric.tenant_id}
                              </p>
                              <p className="text-xs text-gray-500">
                                Quality: {metric.data_quality}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No system metrics collected yet.</p>
                      )}
                    </div>
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
