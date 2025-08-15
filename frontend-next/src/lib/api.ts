import axios, { AxiosInstance } from 'axios'

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Authentication Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user_id: string
  email: string
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  company_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  name: string
  domain: string
  industry: string
  size: string
  status: string
  created_at: string
  updated_at: string
}

export interface Document {
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

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  session_id: string
}

export interface ChatSession {
  id: string
  title: string
  company_id: string
  created_by: string
  created_at: string
  updated_at: string
  message_count: number
}

// API Client Class
class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    // Force the backend URL for now to debug the issue
    this.baseURL = 'http://localhost:8000'
    console.log('API Client initialized with baseURL:', this.baseURL)
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          this.clearAuth()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication methods
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  // Authentication API
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Login attempt with credentials:', credentials)
    console.log('Making request to:', `${this.baseURL}/api/v1/auth/login`)
    
    const response = await this.client.post<LoginResponse>('/api/v1/auth/login', credentials)
    console.log('Login response:', response.data)
    
    const { access_token, user_id, email } = response.data
    
    this.setAuthToken(access_token)
    if (typeof window !== 'undefined') {
      // Store user info from the response
      const userInfo = { id: user_id, email: email }
      localStorage.setItem('user', JSON.stringify(userInfo))
    }
    
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout')
    } catch {
      // Continue with logout even if API call fails
    } finally {
      this.clearAuth()
    }
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await this.client.post<{ access_token: string }>('/api/v1/auth/refresh')
    const { access_token } = response.data
    return response.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/api/v1/auth/me')
    return response.data
  }

  // Companies API
  async getCompanies(page = 1, limit = 10): Promise<PaginatedResponse<Company>> {
    const response = await this.client.get<PaginatedResponse<Company>>('/api/v1/companies', {
      params: { page, limit }
    })
    return response.data
  }

  async getCompany(id: string): Promise<Company> {
    const response = await this.client.get<Company>(`/api/v1/companies/${id}`)
    return response.data
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const response = await this.client.post<Company>('/api/v1/companies', company)
    return response.data
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    const response = await this.client.put<Company>(`/api/v1/companies/${id}`, company)
    return response.data
  }

  // Documents API
  async getDocuments(page = 1, limit = 10, companyId?: string): Promise<PaginatedResponse<Document>> {
    const params: Record<string, unknown> = { page, limit }
    if (companyId) params.company_id = companyId
    
    const response = await this.client.get<PaginatedResponse<Document>>('/api/v1/documents/', { params })
    return response.data
  }

  async getDocument(id: string): Promise<Document> {
    const response = await this.client.get<Document>(`/api/v1/documents/${id}`)
    return response.data
  }

  async uploadDocument(file: File, companyId: string): Promise<Document> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('company_id', companyId)

    const response = await this.client.post<Document>('/api/v1/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteDocument(id: string): Promise<void> {
    await this.client.delete(`/api/v1/documents/${id}`)
  }

  // AI Chat API
  async getChatSessions(companyId?: string): Promise<ChatSession[]> {
    const params = companyId ? { company_id: companyId } : {}
    const response = await this.client.get<ChatSession[]>('/api/v1/ai-chat/sessions', { params })
    return response.data
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const response = await this.client.get<ChatMessage[]>(`/api/v1/ai-chat/sessions/${sessionId}/messages`)
    return response.data
  }

  async sendMessage(sessionId: string, content: string, documentIds?: string[]): Promise<ChatMessage> {
    const formData = new FormData()
    formData.append('message', content)
    formData.append('session_id', sessionId)
    if (documentIds && documentIds.length > 0) {
      formData.append('document_ids', documentIds.join(','))
    }

    const response = await this.client.post<ChatMessage>('/api/v1/ai-chat/chat', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async createChatSession(title: string, companyId: string, createdBy: string): Promise<ChatSession> {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('company_id', companyId)
    formData.append('created_by', createdBy)

    const response = await this.client.post<ChatSession>('/api/v1/ai-chat/sessions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.client.delete(`/api/v1/ai-chat/sessions/${sessionId}`)
  }

  async archiveChatSession(sessionId: string): Promise<void> {
    await this.client.post(`/api/v1/ai-chat/sessions/${sessionId}/archive`)
  }

  // Analytics API
  async getAnalyticsDashboard(): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/dashboard')
    return response.data
  }

  async getDashboardStats(): Promise<{
    total_documents: number
    total_conversations: number
    total_companies: number
    active_users: number
    documents_today: number
    conversations_today: number
  }> {
    const response = await this.client.get('/api/v1/analytics/dashboard')
    return response.data
  }

  async getDocumentAnalytics(companyId?: string, period = '30d'): Promise<{
    uploads_by_date: Array<{ date: string; count: number }>
    documents_by_status: Array<{ status: string; count: number }>
    documents_by_type: Array<{ type: string; count: number }>
  }> {
    const params: Record<string, unknown> = { period }
    if (companyId) params.company_id = companyId
    
    const response = await this.client.get('/api/v1/analytics/documents', { params })
    return response.data
  }

  async getUserAnalytics(period: string = '30d'): Promise<any> {
    const response = await this.client.get(`/api/v1/analytics/users?period=${period}`)
    return response.data
  }

  async getAIUsageAnalytics(period: string = '30d'): Promise<any> {
    const response = await this.client.get(`/api/v1/analytics/ai-usage?period=${period}`)
    return response.data
  }

  async getPerformanceAnalytics(): Promise<any> {
    const response = await this.client.get('/api/v1/analytics/performance')
    return response.data
  }

  async exportAnalyticsData(format: string = 'json'): Promise<any> {
    const response = await this.client.get(`/api/v1/analytics/export?format=${format}`)
    return response.data
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health')
    return response.data
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
