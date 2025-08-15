import DocumentUpload from '@/components/document-upload'
import EnhancedNavigation from '@/components/enhanced-navigation'

export default function UploadPage() {
  return (
    <>
      <EnhancedNavigation />
      <div className="lg:pl-64">
        <DocumentUpload />
      </div>
    </>
  )
}
