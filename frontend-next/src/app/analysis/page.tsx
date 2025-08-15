import DocumentAnalysis from '@/components/document-analysis'
import EnhancedNavigation from '@/components/enhanced-navigation'

export default function AnalysisPage() {
  return (
    <>
      <EnhancedNavigation />
      <div className="lg:pl-64">
        <DocumentAnalysis />
      </div>
    </>
  )
}
