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
  ServerIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  KeyIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

export default function FinalPlatformDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [workflowAutomation, setWorkflowAutomation] = useState([])
  const [businessProcesses, setBusinessProcesses] = useState([])
  const [dataPipelines, setDataPipelines] = useState([])
  const [mlPipelines, setMlPipelines] = useState([])
  const [thirdPartyIntegrations, setThirdPartyIntegrations] = useState([])
  const [apiEcosystems, setApiEcosystems] = useState([])
  const [performanceOptimization, setPerformanceOptimization] = useState([])
  const [scalabilityFeatures, setScalabilityFeatures] = useState([])
  const [complianceGovernance, setComplianceGovernance] = useState([])
  const [platformTesting, setPlatformTesting] = useState([])
  const [productionReadiness, setProductionReadiness] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    fetchFinalPlatformData()
  }, [])

  const fetchFinalPlatformData = async () => {
    setIsLoading(true)
    try {
      const [
        workflows, processes, dataPipes, mlPipes, integrations,
        ecosystems, optimization, scalability, governance, testing, readiness
      ] = await Promise.all([
        apiClient.get('/api/v1/workflow-automation'),
        apiClient.get('/api/v1/business-processes'),
        apiClient.get('/api/v1/data-pipelines'),
        apiClient.get('/api/v1/ml-pipelines'),
        apiClient.get('/api/v1/third-party-integrations'),
        apiClient.get('/api/v1/api-ecosystems'),
        apiClient.get('/api/v1/performance/optimize-advanced'),
        apiClient.get('/api/v1/scalability/features/enable'),
        apiClient.get('/api/v1/compliance/governance/establish'),
        apiClient.get('/api/v1/platform/testing/execute'),
        apiClient.get('/api/v1/production-readiness/assess')
      ])
      
      if (workflows.success) setWorkflowAutomation(workflows.data?.workflows || [])
      if (processes.success) setBusinessProcesses(processes.data?.processes || [])
      if (dataPipes.success) setDataPipelines(dataPipes.data?.pipelines || [])
      if (mlPipes.success) setMlPipelines(mlPipes.data?.pipelines || [])
      if (integrations.success) setThirdPartyIntegrations(integrations.data?.integrations || [])
      if (ecosystems.success) setApiEcosystems(ecosystems.data?.ecosystems || [])
      if (optimization.success) setPerformanceOptimization(optimization.data?.optimizations || [])
      if (scalability.success) setScalabilityFeatures(scalability.data?.features || [])
      if (governance.success) setComplianceGovernance(governance.data?.governance || [])
      if (testing.success) setPlatformTesting(testing.data?.tests || [])
      if (readiness.success) setProductionReadiness(readiness.data?.readiness || [])
    } catch (error) {
      console.error('Failed to fetch final platform data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createWorkflowAutomation = async () => {
    try {
      const workflowSteps = [
        { step: 1, action: "Document Upload", automation: "AI Processing" },
        { step: 2, action: "Content Analysis", automation: "ML Classification" },
        { step: 3, action: "Compliance Check", automation: "Automated Validation" },
        { step: 4, action: "User Notification", automation: "Smart Routing" }
      ]
      
      await apiClient.post('/api/v1/workflow-automation/create', {
        workflow_name: 'Document Processing Workflow',
        workflow_type: 'document_processing',
        workflow_steps: JSON.stringify(workflowSteps),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to create workflow automation:', error)
    }
  }

  const defineBusinessProcess = async () => {
    try {
      const processFlow = [
        { step: 1, action: "Customer Onboarding", automation: "AI Verification" },
        { step: 2, action: "Document Processing", automation: "ML Analysis" },
        { step: 3, action: "Compliance Review", automation: "Automated Checks" },
        { step: 4, action: "Approval Workflow", automation: "Smart Routing" }
      ]
      
      await apiClient.post('/api/v1/business-processes/define', {
        process_name: 'Customer Onboarding Process',
        process_category: 'operational',
        process_flow: JSON.stringify(processFlow),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to define business process:', error)
    }
  }

  const createDataPipeline = async () => {
    try {
      const pipelineConfig = {
        data_sources: ["CRM", "ERP", "Document Storage"],
        data_destinations: ["Data Warehouse", "Analytics Platform"],
        transformation_rules: ["Data Cleaning", "Format Standardization", "Quality Validation"]
      }
      
      await apiClient.post('/api/v1/data-pipelines/create', {
        pipeline_name: 'Enterprise Data Pipeline',
        pipeline_type: 'etl',
        pipeline_config: JSON.stringify(pipelineConfig),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to create data pipeline:', error)
    }
  }

  const createMlPipeline = async () => {
    try {
      const mlConfig = {
        training_data: "Historical document data",
        validation_data: "Recent document samples",
        test_data: "Unseen document collection"
      }
      
      await apiClient.post('/api/v1/ml-pipelines/create', {
        pipeline_name: 'Document Classification ML Pipeline',
        ml_task: 'classification',
        pipeline_config: JSON.stringify(mlConfig),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to create ML pipeline:', error)
    }
  }

  const connectThirdPartyIntegration = async () => {
    try {
      const connectionConfig = {
        supported_platforms: ["Salesforce", "HubSpot", "Slack"],
        api_endpoints: ["/api/v1/sync", "/api/v1/webhook"],
        data_mapping: { "customer": "contact", "deal": "opportunity" }
      }
      
      await apiClient.post('/api/v1/third-party-integrations/connect', {
        integration_name: 'CRM Integration Suite',
        integration_type: 'crm',
        connection_config: JSON.stringify(connectionConfig),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to connect third-party integration:', error)
    }
  }

  const developApiEcosystem = async () => {
    try {
      const ecosystemConfig = {
        sdk_libraries: ["Python", "JavaScript", "Java", "C#"],
        api_endpoints: ["/api/v1/public", "/api/v1/partner", "/api/v1/internal"]
      }
      
      await apiClient.post('/api/v1/api-ecosystems/develop', {
        ecosystem_name: 'Public API Ecosystem',
        ecosystem_type: 'public',
        ecosystem_config: JSON.stringify(ecosystemConfig),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to develop API ecosystem:', error)
    }
  }

  const optimizePerformanceAdvanced = async () => {
    try {
      const optimizationStrategy = {
        database_optimization: ["Query optimization", "Indexing", "Connection pooling"],
        caching_strategies: ["Redis caching", "CDN optimization", "Application caching"],
        load_balancing: ["Round-robin", "Least connections", "Health checks"]
      }
      
      await apiClient.post('/api/v1/performance/optimize-advanced', {
        optimization_area: 'infrastructure',
        optimization_strategy: JSON.stringify(optimizationStrategy),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to optimize performance:', error)
    }
  }

  const enableScalabilityFeature = async () => {
    try {
      const featureConfig = {
        auto_scaling: true,
        load_balancing: true,
        global_distribution: true
      }
      
      await apiClient.post('/api/v1/scalability/features/enable', {
        feature_name: 'Global Auto-Scaling',
        feature_type: 'auto_scaling',
        feature_config: JSON.stringify(featureConfig),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to enable scalability feature:', error)
    }
  }

  const establishComplianceGovernance = async () => {
    try {
      const governanceFramework = {
        policies: ["Data Protection", "Security", "Privacy"],
        procedures: ["Incident Response", "Risk Assessment", "Audit Trail"],
        training: ["Security Awareness", "Compliance Training", "Best Practices"]
      }
      
      await apiClient.post('/api/v1/compliance/governance/establish', {
        governance_area: 'data_protection',
        governance_framework: JSON.stringify(governanceFramework),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to establish compliance governance:', error)
    }
  }

  const executePlatformTesting = async () => {
    try {
      const testConfig = {
        test_scenarios: ["High load", "Security breach", "Data corruption"],
        test_environment: "Production-like staging",
        test_duration: "24 hours"
      }
      
      await apiClient.post('/api/v1/platform/testing/execute', {
        test_type: 'performance',
        test_config: JSON.stringify(testConfig),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to execute platform testing:', error)
    }
  }

  const assessProductionReadiness = async () => {
    try {
      const readinessCriteria = {
        technical_requirements: ["Performance", "Security", "Scalability"],
        operational_requirements: ["Monitoring", "Backup", "Recovery"],
        compliance_requirements: ["SOC2", "GDPR", "HIPAA"]
      }
      
      await apiClient.post('/api/v1/production-readiness/assess', {
        readiness_criteria: JSON.stringify(readinessCriteria),
        tenant_id: 'demo_tenant',
        user_id: user?.id || 'user_001'
      })
      
      fetchFinalPlatformData()
    } catch (error) {
      console.error('Failed to assess production readiness:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Final Platform Integration & Optimization</h1>
              <p className="mt-1 text-sm text-gray-600">
                Complete platform integration, automation, and production readiness
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <RocketLaunchIcon className="h-5 w-5 text-green-600" />
              <span>Production Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-4 sm:px-6 lg:px-8">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'workflows', name: 'Workflow Automation', icon: CogIcon },
            { id: 'processes', name: 'Business Processes', icon: DocumentTextIcon },
            { id: 'pipelines', name: 'Data & ML Pipelines', icon: ServerIcon },
            { id: 'integrations', name: 'Integrations', icon: GlobeAltIcon },
            { id: 'optimization', name: 'Performance & Scale', icon: WrenchScrewdriverIcon },
            { id: 'governance', name: 'Compliance & Governance', icon: ShieldExclamationIcon },
            { id: 'readiness', name: 'Production Readiness', icon: CheckCircleIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading final platform data...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <CogIcon className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Workflow Automation</p>
                        <p className="text-2xl font-semibold text-gray-900">{workflowAutomation.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Business Processes</p>
                        <p className="text-2xl font-semibold text-gray-900">{businessProcesses.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <ServerIcon className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Data Pipelines</p>
                        <p className="text-2xl font-semibold text-gray-900">{dataPipelines.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-8 w-8 text-orange-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Integrations</p>
                        <p className="text-2xl font-semibold text-gray-900">{thirdPartyIntegrations.length}</p>
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
                        onClick={createWorkflowAutomation}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Create Workflow Automation
                      </button>
                      <button
                        onClick={defineBusinessProcess}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Define Business Process
                      </button>
                      <button
                        onClick={createDataPipeline}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                      >
                        Create Data Pipeline
                      </button>
                      <button
                        onClick={createMlPipeline}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      >
                        Create ML Pipeline
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Platform Status</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Workflow Automation</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Data Pipelines</span>
                        <span className="text-sm font-medium text-green-600">Running</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">ML Pipelines</span>
                        <span className="text-sm font-medium text-green-600">Trained</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Production Ready</span>
                        <span className="text-sm font-medium text-green-600">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'workflows' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Workflow Automation</h2>
                  <button
                    onClick={createWorkflowAutomation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Workflow
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Automated Workflows</h3>
                  </div>
                  <div className="p-6">
                    {workflowAutomation.length > 0 ? (
                      <div className="space-y-4">
                        {workflowAutomation.map((workflow: any) => (
                          <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{workflow.name}</span>
                              <span className="text-xs text-gray-500 capitalize">{workflow.type.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Steps: {workflow.steps?.length || 0} | Success Rate: {workflow.performance_metrics?.success_rate}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {new Date(workflow.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No workflow automation created yet. Click the button above to create one.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'processes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Business Processes</h2>
                  <button
                    onClick={defineBusinessProcess}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Define Process
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Defined Processes</h3>
                  </div>
                  <div className="p-6">
                    {businessProcesses.length > 0 ? (
                      <div className="space-y-4">
                        {businessProcesses.map((process: any) => (
                          <div key={process.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{process.name}</span>
                              <span className="text-xs text-gray-500 capitalize">{process.category.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Complexity: {process.process_characteristics?.complexity} | 
                              Automation: {process.process_characteristics?.automation_level}
                            </p>
                            <p className="text-xs text-gray-500">
                              Defined: {new Date(process.defined_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No business processes defined yet. Click the button above to define one.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pipelines' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Data & ML Pipelines</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={createDataPipeline}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Data Pipeline
                    </button>
                    <button
                      onClick={createMlPipeline}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      ML Pipeline
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Data Pipelines</h3>
                    </div>
                    <div className="p-6">
                      {dataPipelines.length > 0 ? (
                        <div className="space-y-4">
                          {dataPipelines.slice(0, 3).map((pipeline: any) => (
                            <div key={pipeline.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{pipeline.name}</span>
                                <span className="text-xs text-gray-500">{pipeline.type}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Throughput: {pipeline.performance_metrics?.throughput}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(pipeline.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No data pipelines created yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">ML Pipelines</h3>
                    </div>
                    <div className="p-6">
                      {mlPipelines.length > 0 ? (
                        <div className="space-y-4">
                          {mlPipelines.slice(0, 3).map((pipeline: any) => (
                            <div key={pipeline.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{pipeline.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{pipeline.ml_task}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Accuracy: {pipeline.performance_metrics?.accuracy}
                              </p>
                              <p className="text-xs text-gray-500">
                                Created: {new Date(pipeline.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No ML pipelines created yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Third-Party Integrations</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={connectThirdPartyIntegration}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Connect Integration
                    </button>
                    <button
                      onClick={developApiEcosystem}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Develop Ecosystem
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Connected Integrations</h3>
                    </div>
                    <div className="p-6">
                      {thirdPartyIntegrations.length > 0 ? (
                        <div className="space-y-4">
                          {thirdPartyIntegrations.slice(0, 3).map((integration: any) => (
                            <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{integration.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{integration.type}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Status: {integration.status} | Security: {integration.integration_features?.security}
                              </p>
                              <p className="text-xs text-gray-500">
                                Connected: {new Date(integration.connected_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No third-party integrations connected yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">API Ecosystems</h3>
                    </div>
                    <div className="p-6">
                      {apiEcosystems.length > 0 ? (
                        <div className="space-y-4">
                          {apiEcosystems.slice(0, 3).map((ecosystem: any) => (
                            <div key={ecosystem.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{ecosystem.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{ecosystem.type}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Features: {Object.keys(ecosystem.ecosystem_features).filter(k => ecosystem.ecosystem_features[k]).length} enabled
                              </p>
                              <p className="text-xs text-gray-500">
                                Developed: {new Date(ecosystem.developed_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No API ecosystems developed yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'optimization' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Performance & Scalability</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={optimizePerformanceAdvanced}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Optimize Performance
                    </button>
                    <button
                      onClick={enableScalabilityFeature}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                      Enable Scalability
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Performance Optimization</h3>
                    </div>
                    <div className="p-6">
                      {performanceOptimization.length > 0 ? (
                        <div className="space-y-4">
                          {performanceOptimization.slice(0, 3).map((optimization: any) => (
                            <div key={optimization.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">{optimization.area.replace('_', ' ')}</span>
                                <span className="text-xs text-gray-500">{optimization.status}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Improvement: {optimization.optimization_results?.performance_improvement}
                              </p>
                              <p className="text-xs text-gray-500">
                                Optimized: {new Date(optimization.optimized_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No performance optimizations performed yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Scalability Features</h3>
                    </div>
                    <div className="p-6">
                      {scalabilityFeatures.length > 0 ? (
                        <div className="space-y-4">
                          {scalabilityFeatures.slice(0, 3).map((feature: any) => (
                            <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{feature.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{feature.type.replace('_', ' ')}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Capacity: {feature.scalability_capabilities?.user_capacity}
                              </p>
                              <p className="text-xs text-gray-500">
                                Enabled: {new Date(feature.enabled_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No scalability features enabled yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'governance' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Compliance & Governance</h2>
                  <button
                    onClick={establishComplianceGovernance}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Establish Governance
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Governance Frameworks</h3>
                  </div>
                  <div className="p-6">
                    {complianceGovernance.length > 0 ? (
                      <div className="space-y-4">
                        {complianceGovernance.map((governance: any) => (
                          <div key={governance.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900 capitalize">{governance.area.replace('_', ' ')}</span>
                              <span className="text-xs text-gray-500">{governance.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Standards: {governance.compliance_standards?.length || 0} compliance frameworks
                            </p>
                            <p className="text-xs text-gray-500">
                              Established: {new Date(governance.established_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No compliance governance established yet. Click the button above to establish one.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'readiness' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Production Readiness</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={executePlatformTesting}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Execute Testing
                    </button>
                    <button
                      onClick={assessProductionReadiness}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Assess Readiness
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Platform Testing</h3>
                    </div>
                    <div className="p-6">
                      {platformTesting.length > 0 ? (
                        <div className="space-y-4">
                          {platformTesting.slice(0, 3).map((test: any) => (
                            <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900 capitalize">{test.type.replace('_', ' ')}</span>
                                <span className="text-xs text-gray-500">{test.status}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Overall Score: {test.test_results?.overall_score}
                              </p>
                              <p className="text-xs text-gray-500">
                                Executed: {new Date(test.executed_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No platform testing executed yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Production Readiness</h3>
                    </div>
                    <div className="p-6">
                      {productionReadiness.length > 0 ? (
                        <div className="space-y-4">
                          {productionReadiness.map((readiness: any) => (
                            <div key={readiness.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">{readiness.status}</span>
                                <span className="text-xs text-gray-500">{readiness.readiness_score}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Go Live: {readiness.go_live_date}
                              </p>
                              <p className="text-xs text-gray-500">
                                Assessed: {new Date(readiness.assessed_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No production readiness assessment performed yet.</p>
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
