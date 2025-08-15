import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Company } from '@/lib/api'

// Query keys for React Query
export const queryKeys = {
  // User queries
  user: ['user'] as const,
  
  // Company queries
  companies: ['companies'] as const,
  company: (id: string) => ['company', id] as const,
  
  // Document queries
  documents: ['documents'] as const,
  documentsByCompany: (companyId: string) => ['documents', 'company', companyId] as const,
  document: (id: string) => ['document', id] as const,
  
  // Chat queries
  chatSessions: ['chat-sessions'] as const,
  chatSessionsByCompany: (companyId: string) => ['chat-sessions', 'company', companyId] as const,
  chatMessages: (sessionId: string) => ['chat-messages', sessionId] as const,
  
  // Analytics queries
  dashboardStats: ['dashboard-stats'] as const,
  documentAnalytics: ['document-analytics'] as const,
  documentAnalyticsByCompany: (companyId: string) => ['document-analytics', 'company', companyId] as const,
}

// Company hooks
export function useCompanies(page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.companies,
    queryFn: () => apiClient.getCompanies(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: queryKeys.company(id),
    queryFn: () => apiClient.getCompany(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCreateCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (company: Partial<Company>) => apiClient.createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, company }: { id: string; company: Partial<Company> }) =>
      apiClient.updateCompany(id, company),
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies })
      queryClient.invalidateQueries({ queryKey: queryKeys.company(updatedCompany.id) })
    },
  })
}

// Document hooks
export function useDocuments(page = 1, limit = 10, companyId?: string) {
  const queryKey = companyId ? queryKeys.documentsByCompany(companyId) : queryKeys.documents
  
  return useQuery({
    queryKey: [...queryKey, page, limit],
    queryFn: () => apiClient.getDocuments(page, limit, companyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: queryKeys.document(id),
    queryFn: () => apiClient.getDocument(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ file, companyId }: { file: File; companyId: string }) =>
      apiClient.uploadDocument(file, companyId),
    onSuccess: (document) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      queryClient.invalidateQueries({ queryKey: queryKeys.documentsByCompany(document.company_id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      queryClient.invalidateQueries({ queryKey: queryKeys.documentAnalytics })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
      queryClient.invalidateQueries({ queryKey: queryKeys.documentAnalytics })
    },
  })
}

// Chat hooks
export function useChatSessions(companyId?: string) {
  const queryKey = companyId ? queryKeys.chatSessionsByCompany(companyId) : queryKeys.chatSessions
  
  return useQuery({
    queryKey: queryKey,
    queryFn: () => apiClient.getChatSessions(companyId),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useChatMessages(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.chatMessages(sessionId),
    queryFn: () => apiClient.getChatMessages(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) =>
      apiClient.sendMessage(sessionId, content),
    onSuccess: (message) => {
      // Optimistically update the messages
      queryClient.setQueryData(
        queryKeys.chatMessages(message.session_id),
        (old: unknown) => {
          if (!old || !Array.isArray(old)) return [message]
          return [...old, message]
        }
      )
      
      // Invalidate to get the full updated list
      queryClient.invalidateQueries({ queryKey: queryKeys.chatMessages(message.session_id) })
    },
  })
}

export function useCreateChatSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ title, companyId, createdBy }: { title: string; companyId: string; createdBy: string }) =>
      apiClient.createChatSession(title, companyId, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chatSessions })
    },
  })
}

// Analytics hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export function useDocumentAnalytics(companyId?: string, period = '30d') {
  const queryKey = companyId 
    ? queryKeys.documentAnalyticsByCompany(companyId) 
    : queryKeys.documentAnalytics
  
  return useQuery({
    queryKey: [...queryKey, period],
    queryFn: () => apiClient.getDocumentAnalytics(companyId, period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Health check hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.healthCheck(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Check every 30 seconds
  })
}
