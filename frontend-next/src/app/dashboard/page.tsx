import Dashboard from '@/components/dashboard'
import EnhancedNavigation from '@/components/enhanced-navigation'

export default function DashboardPage() {
  return (
    <>
      <EnhancedNavigation />
      <div className="lg:pl-64">
        <Dashboard />
      </div>
    </>
  )
}
