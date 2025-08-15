import AnalyticsDashboard from '@/components/analytics-dashboard'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}
