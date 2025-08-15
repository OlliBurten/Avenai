'use client'

import { useDashboardStats, useDocumentAnalytics } from '@/hooks/use-api'
import { useAuth } from '@/contexts/auth-context'
import { LoadingCard } from '@/components/loading-spinner'

export function MainContent() {
  const { user } = useAuth()
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: analytics, isLoading: analyticsLoading } = useDocumentAnalytics()

  // Loading state
  if (statsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">Loading your platform data...</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} title content={false} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (statsError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-red-600">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      name: 'Total Documents',
      value: dashboardStats?.total_documents || 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: 'DocumentIcon',
    },
    {
      name: 'AI Conversations',
      value: dashboardStats?.total_conversations || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: 'ChatIcon',
    },
    {
      name: 'Companies',
      value: dashboardStats?.total_companies || 0,
      change: '+3%',
      changeType: 'positive' as const,
      icon: 'BuildingIcon',
    },
    {
      name: 'Active Users',
      value: dashboardStats?.active_users || 0,
      change: '-2%',
      changeType: 'negative' as const,
      icon: 'UserIcon',
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'document_upload',
      message: 'New document uploaded: API_Specification.pdf',
      user: 'John Doe',
      timestamp: '2 minutes ago',
      icon: 'DocumentIcon',
      iconColor: 'text-blue-500',
    },
    {
      id: 2,
      type: 'chat_started',
      message: 'AI conversation started about payment integration',
      user: 'Jane Smith',
      timestamp: '15 minutes ago',
      icon: 'ChatIcon',
      iconColor: 'text-green-500',
    },
    {
      id: 3,
      type: 'company_registered',
      message: 'New company registered: TechCorp Solutions',
      user: 'System',
      timestamp: '1 hour ago',
      icon: 'BuildingIcon',
      iconColor: 'text-purple-500',
    },
    {
      id: 4,
      type: 'analytics_generated',
      message: 'Daily analytics report generated',
      user: 'System',
      timestamp: '2 hours ago',
      icon: 'ChartIcon',
      iconColor: 'text-orange-500',
    },
  ]

  const getActivityIcon = (icon: string) => {
    const icons: Record<string, React.ReactNode> = {
      DocumentIcon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      ChatIcon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      BuildingIcon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      ChartIcon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    }
    return icons[icon] || icons.DocumentIcon
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back{user?.first_name ? `, ${user.first_name}` : ''}! Here&apos;s what&apos;s happening with your AI platform today.
        </p>
      </div>

      {/* Key Statistics */}
      <div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6">
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  {getActivityIcon(stat.icon)}
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <svg className="h-4 w-4 flex-shrink-0 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 flex-shrink-0 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  )}
                  <span className="sr-only">
                    {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                  </span>
                  {stat.change}
                </p>
              </dd>
            </div>
          ))}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Platform Usage Chart */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Platform Usage</h3>
            <div className="mt-4 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              {analyticsLoading ? (
                <div className="text-sm text-gray-500">Loading chart...</div>
              ) : analytics ? (
                <div className="text-sm text-gray-500">Chart data loaded</div>
              ) : (
                <p className="text-sm text-gray-500">Chart coming soon...</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Activity</h3>
            <div className="mt-6 flow-root">
              <ul role="list" className="-mb-8">
                {recentActivity.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivity.length - 1 ? (
                        <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white ${activity.iconColor}`}>
                            {getActivityIcon(activity.icon)}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">{activity.message}</p>
                            <p className="text-xs text-gray-400">by {activity.user}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {activity.timestamp}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <a href="#" className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                View all
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white shadow">
        <div className="p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Quick Actions</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">Upload Document</p>
              </div>
            </button>
            <button className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M12 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">Start AI Chat</p>
              </div>
            </button>
            <button className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">Add Company</p>
              </div>
            </button>
            <button className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">View Analytics</p>
              </div>
            </button>
            <a href="/client" className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-gray-400 hover:bg-gray-50">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="mt-2 text-sm font-medium text-gray-900">Client Platform</p>
                <p className="mt-1 text-xs text-gray-500">Company Dashboard</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
