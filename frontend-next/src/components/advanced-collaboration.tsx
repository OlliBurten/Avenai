'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import {
  DocumentTextIcon,
  UsersIcon,
  ClockIcon,
  ShareIcon,
  CogIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface CollaborationSession {
  id: string
  title: string
  company_id: string
  created_by: string
  session_type: string
  document_ids: string[]
  created_at: string
  updated_at: string
  active_users: number
  status: string
  connected_users?: string[]
  recent_chat?: any[]
}

interface DocumentVersion {
  version: number
  content: string
  changed_by: string
  timestamp: string
  change_type: string
}

interface UserPermission {
  level: string
  granted_by: string
  granted_at: string
  updated_at: string
}

export default function AdvancedCollaboration() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<CollaborationSession | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [documentContent, setDocumentContent] = useState('')
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>([])
  const [currentVersion, setCurrentVersion] = useState(1)
  const [userPermissions, setUserPermissions] = useState<Record<string, UserPermission>>({})
  const [showPermissions, setShowPermissions] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showFileSharing, setShowFileSharing] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [documents, setDocuments] = useState<any[]>([])
  const [sharedFiles, setSharedFiles] = useState<any[]>([])
  
  const { user } = useAuth()

  // Fetch collaboration sessions and documents
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch collaboration sessions
        const sessionsResponse = await apiClient.get('/api/v1/collaboration/sessions')
        if (sessionsResponse.success && sessionsResponse.data) {
          setSessions(sessionsResponse.data)
        }

        // Fetch documents
        const docsResponse = await apiClient.getDocuments()
        if (docsResponse.success && docsResponse.data) {
          setDocuments(docsResponse.data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()
  }, [])

  // Fetch document content when document is selected
  useEffect(() => {
    if (selectedDocument) {
      fetchDocumentContent(selectedDocument)
      fetchDocumentVersions(selectedDocument)
    }
  }, [selectedDocument])

  // Fetch user permissions when session is selected
  useEffect(() => {
    if (selectedSession) {
      fetchSessionPermissions(selectedSession.id)
    }
  }, [selectedSession])

  const fetchDocumentContent = async (documentId: string) => {
    try {
      const response = await apiClient.get(`/api/v1/collaboration/documents/${documentId}/content`)
      if (response.success && response.data) {
        setDocumentContent(response.data.content)
        setCurrentVersion(response.data.version)
      }
    } catch (error) {
      console.error('Failed to fetch document content:', error)
    }
  }

  const fetchDocumentVersions = async (documentId: string) => {
    try {
      const response = await apiClient.get(`/api/v1/collaboration/documents/${documentId}/versions`)
      if (response.success && response.data) {
        setDocumentVersions(response.data.versions)
      }
    } catch (error) {
      console.error('Failed to fetch document versions:', error)
    }
  }

  const fetchSessionPermissions = async (sessionId: string) => {
    try {
      const response = await apiClient.get(`/api/v1/collaboration/sessions/${sessionId}/permissions`)
      if (response.success && response.data) {
        setUserPermissions(response.data.permissions || {})
      }
    } catch (error) {
      console.error('Failed to fetch session permissions:', error)
    }
  }

  const updateDocumentContent = async () => {
    if (!selectedDocument || !selectedSession || !editContent.trim()) return

    try {
      const response = await apiClient.post(`/api/v1/collaboration/documents/${selectedDocument}/content`, {
        content: editContent,
        user_id: user?.id || 'user_001',
        session_id: selectedSession.id,
        change_type: 'text_edit'
      })

      if (response.success) {
        setDocumentContent(editContent)
        setCurrentVersion(response.data.version)
        setIsEditing(false)
        
        // Refresh versions
        await fetchDocumentVersions(selectedDocument)
      }
    } catch (error) {
      console.error('Failed to update document:', error)
    }
  }

  const restoreDocumentVersion = async (version: number) => {
    if (!selectedDocument || !selectedSession) return

    try {
      const response = await apiClient.post(`/api/v1/collaboration/documents/${selectedDocument}/restore`, {
        version: version,
        user_id: user?.id || 'user_001',
        session_id: selectedSession.id
      })

      if (response.success) {
        // Refresh document content and versions
        await fetchDocumentContent(selectedDocument)
        await fetchDocumentVersions(selectedDocument)
        setShowVersionHistory(false)
      }
    } catch (error) {
      console.error('Failed to restore version:', error)
    }
  }

  const updateUserPermission = async (userId: string, permissionLevel: string) => {
    if (!selectedSession) return

    try {
      const response = await apiClient.post(`/api/v1/collaboration/sessions/${selectedSession.id}/permissions`, {
        user_id: userId,
        permission_level: permissionLevel,
        granted_by: user?.id || 'user_001'
      })

      if (response.success) {
        // Refresh permissions
        await fetchSessionPermissions(selectedSession.id)
      }
    } catch (error) {
      console.error('Failed to update permissions:', error)
    }
  }

  const shareFile = async (fileId: string, sharedWith: string, permission: string) => {
    try {
      const response = await apiClient.post('/api/v1/collaboration/files/share', {
        file_id: fileId,
        shared_by: user?.id || 'user_001',
        shared_with: sharedWith,
        permission: permission
      })

      if (response.success) {
        // Refresh shared files
        await fetchSharedFiles()
      }
    } catch (error) {
      console.error('Failed to share file:', error)
    }
  }

  const fetchSharedFiles = async () => {
    try {
      const response = await apiClient.get('/api/v1/collaboration/files/shared', {
        params: { user_id: user?.id }
      })
      if (response.success && response.data) {
        setSharedFiles(response.data.shared_files || [])
      }
    } catch (error) {
      console.error('Failed to fetch shared files:', error)
    }
  }

  const getUserPermissionLevel = (userId: string) => {
    return userPermissions[userId]?.level || 'read'
  }

  const canEdit = () => {
    if (!user) return false
    const permission = getUserPermissionLevel(user.id)
    return permission === 'write' || permission === 'admin'
  }

  const canManagePermissions = () => {
    if (!user) return false
    const permission = getUserPermissionLevel(user.id)
    return permission === 'admin'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Advanced Collaboration</h2>
          <p className="text-sm text-gray-600">Rich text editing & version control</p>
        </div>

        {/* Sessions List */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Collaboration Sessions</h3>
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-500">No collaboration sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{session.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{session.session_type.replace('_', ' ')}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <UsersIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{session.active_users} active</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Selection */}
        {selectedSession && (
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Session Documents</h4>
            {selectedSession.document_ids.length > 0 ? (
              <div className="space-y-2">
                {selectedSession.document_ids.map(docId => {
                  const doc = documents.find(d => d.id === docId)
                  return (
                    <div
                      key={docId}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedDocument === docId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedDocument(docId)}
                    >
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{doc?.name || 'Unknown Document'}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No documents in this session.</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setShowPermissions(!showPermissions)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Permissions</span>
          </button>
          
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ClockIcon className="h-4 w-4" />
            <span>Version History</span>
          </button>
          
          <button
            onClick={() => setShowFileSharing(!showFileSharing)}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ShareIcon className="h-4 w-4" />
            <span>File Sharing</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedSession && selectedDocument ? (
          <>
            {/* Document Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {documents.find(d => d.id === selectedDocument)?.name || 'Document'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Version {currentVersion} • Last updated {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {canEdit() && (
                    <button
                      onClick={() => {
                        setIsEditing(!isEditing)
                        setEditContent(documentContent)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  )}
                  {isEditing && (
                    <button
                      onClick={updateDocumentContent}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Start editing your document..."
                    />
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <PencilIcon className="h-4 w-4" />
                      <span>Editing mode - Changes will be saved with version control</span>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap">{documentContent || 'No content yet. Start editing to add content.'}</div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Advanced Collaboration</h3>
              <p className="text-gray-600 mb-6">
                Select a collaboration session and document to start working with rich text editing, version control, and advanced permissions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Permissions, Versions, Sharing */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Permissions Panel */}
        {showPermissions && selectedSession && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Session Permissions</h4>
            <div className="space-y-3">
              {Object.entries(userPermissions).map(([userId, permission]) => (
                <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">User {userId}</p>
                    <p className="text-xs text-gray-500 capitalize">{permission.level} access</p>
                  </div>
                  {canManagePermissions() && (
                    <select
                      value={permission.level}
                      onChange={(e) => updateUserPermission(userId, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="read">Read</option>
                      <option value="write">Write</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>
              ))}
              {Object.keys(userPermissions).length === 0 && (
                <p className="text-sm text-gray-500">No custom permissions set.</p>
              )}
            </div>
          </div>
        )}

        {/* Version History Panel */}
        {showVersionHistory && selectedDocument && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Version History</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {documentVersions.map((version) => (
                <div key={version.version} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Version {version.version}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(version.timestamp).toLocaleDateString()} by {version.changed_by}
                    </p>
                  </div>
                  {canEdit() && (
                    <button
                      onClick={() => restoreDocumentVersion(version.version)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Restore
                    </button>
                  )}
                </div>
              ))}
              {documentVersions.length === 0 && (
                <p className="text-sm text-gray-500">No version history yet.</p>
              )}
            </div>
          </div>
        )}

        {/* File Sharing Panel */}
        {showFileSharing && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">File Sharing</h4>
            <div className="space-y-3">
              {sharedFiles.map((sharedFile) => (
                <div key={sharedFile.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">File {sharedFile.file_id}</p>
                      <p className="text-xs text-gray-500 capitalize">{sharedFile.permission} access</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(sharedFile.shared_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {sharedFiles.length === 0 && (
                <p className="text-sm text-gray-500">No shared files yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="flex-1 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Features</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-3 w-3" />
              <span>Rich text editing</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-3 w-3" />
              <span>Version control</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-3 w-3" />
              <span>Role-based permissions</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShareIcon className="h-3 w-3" />
              <span>File sharing</span>
            </div>
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftRightIcon className="h-3 w-3" />
              <span>Document comments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
