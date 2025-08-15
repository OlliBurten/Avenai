'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon
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

export default function DocumentUpload() {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('docx')) return '📝'
    if (type.includes('excel') || type.includes('xlsx')) return '📊'
    if (type.includes('image')) return '🖼️'
    if (type.includes('text') || type.includes('markdown')) return '📄'
    return '📎'
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

         const handleFiles = async (files: File[]) => {
         const newFiles: UploadedFile[] = files.map(file => ({
           id: Math.random().toString(36).substr(2, 9),
           name: file.name,
           size: file.size,
           type: file.type,
           status: 'uploading',
           progress: 0
         }))

         setUploadedFiles(prev => [...prev, ...newFiles])
         setIsUploading(true)

         // Upload files to backend
         for (const file of newFiles) {
           await uploadFile(file, files.find(f => f.name === file.name)!)
         }
       }

       const uploadFile = async (file: UploadedFile, actualFile: File) => {
         try {
           // Simulate progress
           let progress = 0
           const progressInterval = setInterval(() => {
             progress += Math.random() * 15
             if (progress >= 90) {
               clearInterval(progressInterval)
             }
             setUploadedFiles(prev => prev.map(f =>
               f.id === file.id ? { ...f, progress } : f
             ))
           }, 200)

           // Upload to backend
           const response = await apiClient.uploadDocument(actualFile)
           
           clearInterval(progressInterval)
           
           if (response.success && response.data) {
             setUploadedFiles(prev => {
               const updated = prev.map(f =>
                 f.id === file.id 
                   ? { ...f, status: 'success', progress: 100, id: response.data.id }
                   : f
               )
               
               // Check if all uploads are complete
               const allComplete = updated.every(f => f.status === 'success')
               if (allComplete) {
                 setIsUploading(false)
               }
               
               return updated
             })
           } else {
             throw new Error(response.message || 'Upload failed')
           }
         } catch (error) {
           console.error('Upload error:', error)
           setUploadedFiles(prev => prev.map(f =>
             f.id === file.id 
               ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
               : f
           ))
         }
       }

  

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

         const retryUpload = async (fileId: string) => {
         const file = uploadedFiles.find(f => f.id === fileId)
         if (!file) return
         
         setUploadedFiles(prev => prev.map(f =>
           f.id === fileId
             ? { ...f, status: 'uploading', progress: 0, error: undefined }
             : f
         ))
         
         // Find the original file and retry upload
         const originalFile = new File([''], file.name, { type: file.type })
         await uploadFile(file, originalFile)
       }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Documents</h1>
        <p className="text-lg text-gray-600">
          Drag and drop your files here or click to browse. We'll analyze them with AI to extract insights.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CloudArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {isDragOver ? 'Drop your files here' : 'Upload your documents'}
          </h3>
          
          <p className="text-gray-600">
            Supports PDF, Word, Excel, images, and text files up to 100MB
          </p>

          <div className="flex items-center justify-center space-x-4">
            <label className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 cursor-pointer flex items-center">
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Choose Files
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
            
            <span className="text-gray-500">or drag and drop</span>
          </div>
        </div>

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-20 w-20 text-blue-500 mb-4" />
              <p className="text-2xl font-bold text-blue-600">Drop to upload</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Progress ({uploadedFiles.filter(f => f.status === 'success').length}/{uploadedFiles.length})
          </h3>
          
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getFileIcon(file.type)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Status Icon */}
                    {file.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    )}
                    {file.status === 'success' && (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                    )}

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="w-32">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(file.progress)}%</p>
                      </div>
                    )}

                                             {/* Actions */}
                         {file.status === 'success' && (
                           <button 
                             onClick={() => router.push(`/analysis?doc=${file.id}`)}
                             className="text-green-600 hover:text-green-700 text-sm font-medium"
                           >
                             View Analysis
                           </button>
                         )}
                    {file.status === 'error' && (
                      <button
                        onClick={() => retryUpload(file.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Retry
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {file.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{file.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Complete */}
      {uploadedFiles.length > 0 && !isUploading && uploadedFiles.every(f => f.status === 'success') && (
        <div className="mt-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              All files uploaded successfully!
            </h3>
            <p className="text-green-600 mb-4">
              Your documents are being analyzed by AI. You'll receive insights shortly.
            </p>
            <button 
              onClick={() => {
                const successFiles = uploadedFiles.filter(f => f.status === 'success')
                if (successFiles.length > 0) {
                  router.push(`/analysis?doc=${successFiles[0].id}`)
                }
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Analysis Results
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Upload Tips</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-2">📄 Document Types</p>
            <p>PDFs, Word docs, Excel spreadsheets, and text files work best for AI analysis.</p>
          </div>
          <div>
            <p className="font-medium mb-2">🔍 Quality Matters</p>
            <p>Clear, well-formatted documents provide better AI insights and analysis.</p>
          </div>
          <div>
            <p className="font-medium mb-2">📊 Multiple Files</p>
            <p>Upload related documents together for comprehensive analysis and cross-referencing.</p>
          </div>
          <div>
            <p className="font-medium mb-2">⚡ Quick Processing</p>
            <p>Most documents are analyzed within seconds using our advanced AI technology.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
