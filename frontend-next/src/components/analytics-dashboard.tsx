'use client'

import { useState, useEffect } from 'react'
import { 
  ChartBarIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '@/lib/api'

interface AnalyticsData {
  overview: {
    total_users: number
    active_users_24h: number
    total_requests: number
    error_rate: number
    avg_response_time: number
    uptime: number
  }
  usage_trends: {
    api_calls_24h: number
    ai_messages_24h: number
    peak_concurrent_users: number
  }
  performance: {
    current_concurrent_users: number
    system_health: string
  }
  system_stats: {
    total_documents: number
    total_chat_sessions: number
    total_messages: number
    openai_status: string
  }
}

interface UserAnalytics {
  period: string
  total_users: number
  active_users: number
  user_summary: Record<string, any>
  most_active_users: [string, number][]
}

interface PerformanceAnalytics {
  system_metrics: any
  api_performance: Record<string, any>
  error_analysis: Record<string, any>
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<{
    totalDocuments: number;
    totalUsers: number;
    totalUploads: number;
    uploadTrends: Array<{ date: string; count: number }>;
    userActivity: Array<{ user: string; activity: number }>;
    documentTypes: Array<{ type: string; count: number }>;
    systemHealth: {
      uptime: number;
      responseTime: number;
      errorRate: number;
    };
  } | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null)
  const [performanceAnalytics, setPerformanceAnalytics] = useState<PerformanceAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('24h')

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [dashboard, users, performance] = await Promise.all([
        apiClient.getAnalyticsDashboard(),
        apiClient.getUserAnalytics(selectedPeriod),
        apiClient.getPerformanceAnalytics()
      ])
      
      setAnalyticsData(dashboard)
      setUserAnalytics(users)
      setPerformanceAnalytics(performance)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircleIcon className="w-5 h-5" />
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5" />
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5" />
      default: return <ClockIcon className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load analytics</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your platform&apos;s performance and usage</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers}
          icon={UsersIcon}
          trend={analyticsData.userActivity.length}
          trendLabel="total users"
          color="blue"
        />
        <MetricCard
          title="API Requests"
          value={analyticsData.totalUploads.toLocaleString()}
          icon={ChartBarIcon}
          trend={analyticsData.totalUploads}
          trendLabel="total"
          color="green"
        />
        <MetricCard
          title="AI Messages"
          value={analyticsData.totalDocuments}
          icon={ChatBubbleLeftRightIcon}
          trend={analyticsData.totalDocuments}
          trendLabel="total"
          color="purple"
        />
        <MetricCard
          title="Documents"
          value={analyticsData.totalDocuments}
          icon={DocumentTextIcon}
          trend={analyticsData.uploadTrends.length}
          trendLabel="total uploads"
          color="orange"
        />
      </div>

      {/* System Health & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(analyticsData.systemHealth.uptime > 95 ? 'healthy' : analyticsData.systemHealth.uptime > 90 ? 'warning' : 'critical')}`}>
                {getHealthIcon(analyticsData.systemHealth.uptime > 95 ? 'healthy' : analyticsData.systemHealth.uptime > 90 ? 'warning' : 'critical')}
                <span className="ml-1 capitalize">{analyticsData.systemHealth.uptime > 95 ? 'Healthy' : analyticsData.systemHealth.uptime > 90 ? 'Warning' : 'Critical'}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Uptime</span>
              <span className="text-sm text-gray-900">{analyticsData.systemHealth.uptime.toFixed(1)} hours</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Error Rate</span>
              <span className="text-sm text-gray-900">{analyticsData.systemHealth.errorRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
              <span className="text-sm text-gray-900">{analyticsData.systemHealth.responseTime.toFixed(3)}s</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Current Users</span>
              <span className="text-sm text-gray-900">{analyticsData.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Peak Users</span>
              <span className="text-sm text-gray-900">{analyticsData.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Chat Sessions</span>
              <span className="text-sm text-gray-900">{analyticsData.totalDocuments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">OpenAI Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-600 bg-green-100">
                Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity & Performance Charts */}
      {userAnalytics && performanceAnalytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Users</span>
                <span className="text-sm text-gray-900">{userAnalytics.total_users}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Active Users</span>
                <span className="text-sm text-gray-900">{userAnalytics.active_users}</span>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Most Active Users</h4>
                <div className="space-y-2">
                  {userAnalytics.most_active_users.slice(0, 5).map(([userId, actions], index) => (
                    <div key={userId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">User {userId}</span>
                      <span className="text-gray-900 font-medium">{actions} actions</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">API Performance</h3>
            <div className="space-y-4">
              {Object.entries(performanceAnalytics.api_performance).slice(0, 5).map(([endpoint, data]) => (
                <div key={endpoint} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 truncate">{endpoint}</span>
                    <span className="text-sm text-gray-900">{data.total_calls} calls</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Avg: {data.avg_response_time.toFixed(3)}s</span>
                    <span>Errors: {data.error_rate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchAnalyticsData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <ArrowTrendingUpIcon className="w-4 h-4 mr-2" />
          Refresh Analytics
        </button>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend: number
  trendLabel: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function MetricCard({ title, value, icon: Icon, trend, trendLabel, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center text-sm text-gray-600">
          <span>{trend} {trendLabel}</span>
        </div>
      </div>
    </div>
  )
}
