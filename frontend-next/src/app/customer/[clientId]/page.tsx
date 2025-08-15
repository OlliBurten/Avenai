'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  UserIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import CustomerChat from '@/components/customer/customer-chat'
import CustomerUpload from '@/components/customer/customer-upload'
import CustomerProfile from '@/components/customer/customer-profile'

interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  company_name: string
  created_at: string
}

interface ClientCompany {
  id: string
  name: string
  domain: string
  industry: string
  logo_url?: string
  welcome_message?: string
}

export default function CustomerPortal() {
  const params = useParams()
  const clientId = params.clientId as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [clientCompany, setClientCompany] = useState<ClientCompany | null>(null)
  const [activeTab, setActiveTab] = useState('chat')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (clientId) {
      fetchClientCompany()
      checkCustomerSession()
    }
  }, [clientId])

  const fetchClientCompany = async () => {
    try {
      // In production, this would be a public endpoint
      const response = await fetch(`/api/v1/public/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClientCompany(data)
      }
    } catch (error) {
      console.error('Failed to fetch client company:', error)
    }
  }

  const checkCustomerSession = async () => {
    try {
      // Check if customer is logged in
      const customerId = localStorage.getItem(`customer_${clientId}`)
      if (customerId) {
        const response = await fetch(`/api/v1/customers/${customerId}`)
        if (response.ok) {
          const data = await response.json()
          setCustomer(data)
        }
      }
    } catch (error) {
      console.error('Failed to check customer session:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerLogin = async (email: string, firstName: string, lastName: string) => {
    try {
      const response = await fetch('/api/v1/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          client_id: clientId
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
        localStorage.setItem(`customer_${clientId}`, data.id)
      }
    } catch (error) {
      console.error('Failed to register customer:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!clientCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Not Found</h1>
          <p className="text-gray-600">The company you're looking for doesn't exist or is not available.</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              {clientCompany.logo_url ? (
                <img src={clientCompany.logo_url} alt={clientCompany.name} className="h-16 mx-auto mb-4" />
              ) : (
                <div className="h-16 w-16 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{clientCompany.name[0]}</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {clientCompany.name}</h1>
              <p className="text-gray-600">
                {clientCompany.welcome_message || `Access AI-powered insights and document analysis powered by ${clientCompany.name}`}
              </p>
            </div>

            <CustomerLoginForm onLogin={handleCustomerLogin} clientCompany={clientCompany} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {clientCompany.logo_url ? (
                <img src={clientCompany.logo_url} alt={clientCompany.name} className="h-8 w-8" />
              ) : (
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">{clientCompany.name[0]}</span>
                </div>
              )}
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">{clientCompany.name}</h1>
                <p className="text-sm text-gray-500">AI Assistant Portal</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {customer.first_name}!
              </span>
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <UserIcon className="h-5 w-5 mr-1" />
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'chat', name: 'AI Chat', icon: ChatBubbleLeftRightIcon, description: 'Ask questions and get AI-powered insights' },
              { id: 'upload', name: 'Document Upload', icon: DocumentTextIcon, description: 'Upload documents for AI analysis' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center">
                <SparklesIcon className="h-6 w-6 text-white mr-3" />
                <h2 className="text-xl font-semibold text-white">AI Assistant</h2>
              </div>
              <p className="text-indigo-100 mt-1">
                Ask me anything about your documents or business questions
              </p>
            </div>
            <CustomerChat clientId={clientId} customerId={customer.id} />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-6 w-6 text-white mr-3" />
                <h2 className="text-xl font-semibold text-white">Document Upload</h2>
              </div>
              <p className="text-green-100 mt-1">
                Upload documents for AI analysis and insights
              </p>
            </div>
            <CustomerUpload clientId={clientId} customerId={customer.id} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-slate-600 px-6 py-4">
              <div className="flex items-center">
                <UserIcon className="h-6 w-6 text-white mr-3" />
                <h2 className="text-xl font-semibold text-white">Your Profile</h2>
              </div>
              <p className="text-gray-100 mt-1">
                Manage your account and preferences
              </p>
            </div>
            <CustomerProfile customer={customer} clientCompany={clientCompany} />
          </div>
        )}
      </div>
    </div>
  )
}

function CustomerLoginForm({ onLogin, clientCompany }: { 
  onLogin: (email: string, firstName: string, lastName: string) => void
  clientCompany: ClientCompany 
}) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !firstName || !lastName) return
    
    setIsSubmitting(true)
    await onLogin(email, firstName, lastName)
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            Get Started
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </>
        )}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        By continuing, you agree to {clientCompany.name}'s terms of service and privacy policy.
      </p>
    </form>
  )
}
