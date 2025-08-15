'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  DocumentTextIcon, 
  ArrowUpTrayIcon, 
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { apiClient } from '../lib/api'

interface Document {
  id: string
  filename: string
  original_filename: string
  file_size: number
  mime_type: string
  status: 'processing' | 'completed' | 'failed'
  content_summary?: string
  metadata?: Record<string, unknown>
  uploaded_by: string
  company_id: string
  created_at: string
  updated_at: string
}

export default function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Mock company ID - in real app, this would come from auth context
  const companyId = 'company_001'

  useEffect(() => {
    fetchDocuments()
  }, [companyId])

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getDocuments(1, 100, companyId)
      // Handle the actual backend response format
      console.log('Documents response:', response)
      if (response && 'documents' in response && Array.isArray(response.documents)) {
        console.log('Using documents array:', response.documents)
        setDocuments(response.documents)
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        console.log('Using data array:', response.data)
        setDocuments(response.data)
      } else {
        console.log('No valid documents array found, setting empty array')
        setDocuments([])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }, [companyId])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadDocument = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const response = await apiClient.uploadDocument(selectedFile, companyId)

      if (response) {
        console.log('Upload successful:', response)
        
        // Refresh documents list
        await fetchDocuments()
        
        // Reset form
        setSelectedFile(null)
        setShowUploadModal(false)
        setUploadProgress(0)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await apiClient.deleteDocument(documentId)
      await fetchDocuments()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const downloadDocument = async (documentId: string, filename: string) => {
    try {
      // For now, we'll use a direct fetch since the API client doesn't have downloadDocument
              const response = await fetch(`http://192.168.1.170:8000/api/v1/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-sm text-gray-600">Manage and analyze your company documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {selectedFile && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Selected:</strong> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadDocument}
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Your Documents ({documents.length})
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Loading documents...</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please wait while we fetch the documents.
            </p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first document.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doc.original_filename}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {doc.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(doc.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.mime_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => downloadDocument(doc.id, doc.original_filename)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
