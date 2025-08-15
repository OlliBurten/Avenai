import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    name: string
    role: string
    company_id: string
  }
}

export interface DocumentUploadResponse {
  id: string
  name: string
  status: string
  file_size: number
  uploaded_at: string
}

export interface DocumentAnalysisResponse {
  id: string
  insights: Array<{
    type: string
    title: string
    description: string
    confidence: number
  }>
  sections: Array<{
    title: string
    content: string
    insights: string[]
  }>
}

export interface DashboardStats {
  documents_analyzed: number
  ai_conversations: number
  active_users: number
  response_time: number
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  company_id: string
  created_at: string
}

export interface Document {
  id: string
  name: string
  type: string
  size: number
  status: string
  uploaded_at: string
  insights_count: number
}

// API Client Class
class ApiClient {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    
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
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearAuthToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )

    console.log('API Client initialized with baseURL:', this.baseURL)
  }

  // Auth token management
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('avenai_token')
    }
    return null
  }

  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('avenai_token', token)
    }
  }

  private clearAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('avenai_token')
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.client.post<LoginResponse>('/api/v1/auth/login', credentials)
      this.setAuthToken(response.data.access_token)
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/v1/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearAuthToken()
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get<User>('/api/v1/auth/me')
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  // Document methods
  async uploadDocument(file: File): Promise<ApiResponse<DocumentUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await this.client.post<DocumentUploadResponse>(
        '/api/v1/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getDocuments(): Promise<ApiResponse<Document[]>> {
    try {
      const response = await this.client.get<Document[]>('/api/v1/documents')
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async analyzeDocument(documentId: string): Promise<ApiResponse<DocumentAnalysisResponse>> {
    try {
      const response = await this.client.post<DocumentAnalysisResponse>(
        `/api/v1/documents/${documentId}/analyze`
      )
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await this.client.get<DashboardStats>('/api/v1/analytics/dashboard')
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  // AI Chat methods
  async sendMessage(sessionId: string, message: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.post('/api/v1/ai/chat', {
        session_id: sessionId,
        message: message
      })
      return { success: true, data: response.data }
    } catch (error) {
      return this.handleError(error)
    }
  }

  // Utility methods
  private handleError(error: any): ApiResponse {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.detail || 'Server error'
      return {
        success: false,
        error: message,
        message: message
      }
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: 'No response from server',
        message: 'Network error - please check your connection'
      }
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'Unknown error',
        message: 'An unexpected error occurred'
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  // Get auth token for external use
  getToken(): string | null {
    return this.getAuthToken()
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types for use in components
export type { ApiResponse, LoginRequest, LoginResponse, DocumentUploadResponse, DocumentAnalysisResponse, DashboardStats, User, Document }
