import AIChat from '@/components/ai-chat'
import EnhancedNavigation from '@/components/enhanced-navigation'

export default function AIChatPage() {
  return (
    <>
      <EnhancedNavigation />
      <div className="lg:pl-64">
        <AIChat />
      </div>
    </>
  )
}
