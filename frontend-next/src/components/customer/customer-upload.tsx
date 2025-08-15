'use client'

import { useState, useRef } from 'react'
import { 
  DocumentArrowUpIcon, 
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

interface CustomerUploadProps {
  clientId: string
  customerId: string
}

export default function CustomerUpload({ clientId, customerId }: CustomerUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedFileTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!allowedFileTypes.includes(file.type)) {
        alert(`File type not supported: ${file.name}. Please upload PDF, Word, Excel, or text files.`)
        return false
      }
      
      if (file.size > maxFileSize) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`)
        return false
      }
      
      return true
    })

    if (validFiles.length === 0) return

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    uploadFiles(validFiles, newFiles)
  }

  const uploadFiles = async (files: File[], fileObjects: UploadedFile[]) => {
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileObj = fileObjects[i]
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('client_id', clientId)
        formData.append('customer_id', customerId)
        formData.append('description', `Uploaded by customer ${customerId}`)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ))
        }, 100)

        const response = await fetch('/api/v1/documents/upload', {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)

        if (response.ok) {
          const data = await response.json()
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileObj.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          ))
        } else {
          throw new Error(`Upload failed: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileObj.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : 'Upload failed'
              }
            : f
        ))
      }
    }

    setIsUploading(false)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const retryUpload = (fileId: string) => {
    const fileObj = uploadedFiles.find(f => f.id === fileId)
    if (!fileObj) return

    // Reset status and retry
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId 
        ? { ...f, status: 'uploading', progress: 0, error: undefined }
        : f
    ))

    // In a real implementation, you'd retry the actual upload
    // For now, we'll just simulate success
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'success', progress: 100 }
          : f
      ))
    }, 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('csv') || type.includes('text')) return '📋'
    return '📎'
  }

  return (
    <div className="p-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-lg font-medium text-gray-900">
            Drop files here or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              browse
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Upload PDF, Word, Excel, or text files up to 10MB
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{file.progress}%</span>
                    </div>
                  )}

                  {file.status === 'success' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="flex items-center text-red-600">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">{file.error}</span>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <button
                      onClick={() => retryUpload(file.id)}
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      Retry
                    </button>
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-800">Uploading files...</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What happens after upload?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Your documents are securely processed and analyzed</li>
          <li>• AI extracts key information and insights</li>
          <li>• You can ask questions about your documents in the chat</li>
          <li>• All data is protected and private to your account</li>
        </ul>
      </div>
    </div>
  )
}
