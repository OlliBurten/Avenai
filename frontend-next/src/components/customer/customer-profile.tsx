'use client'

import { useState } from 'react'
import { 
  UserIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  CogIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

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

interface CustomerProfileProps {
  customer: Customer
  clientCompany: ClientCompany
}

export default function CustomerProfile({ customer, clientCompany }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState(customer)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/v1/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedCustomer)
      })

      if (response.ok) {
        setIsEditing(false)
        // In a real app, you'd update the parent state here
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedCustomer(customer)
    setIsEditing(false)
  }

  const handleLogout = () => {
    // Clear local storage and redirect to login
    localStorage.removeItem(`customer_${clientCompany.id}`)
    window.location.reload()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-4">
          <UserIcon className="h-10 w-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {customer.first_name} {customer.last_name}
        </h2>
        <p className="text-gray-600">Customer Account</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CogIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Personal Details
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedCustomer.first_name}
                    onChange={(e) => setEditedCustomer(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{customer.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedCustomer.last_name}
                    onChange={(e) => setEditedCustomer(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{customer.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedCustomer.email}
                    onChange={(e) => setEditedCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{customer.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Account Details
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{clientCompany.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{formatDate(customer.created_at)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Status
                </label>
                <div className="flex items-center">
                  <ShieldCheckIcon className="h-4 w-4 text-green-400 mr-2" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Account Actions</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <div className="flex items-center">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </div>
              <span className="text-red-400">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">Privacy & Security</h3>
        </div>
        
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Data Protection</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your data is encrypted and protected. We never share your information with third parties.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900">Company Access</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Your data is only accessible to authorized personnel at {clientCompany.name}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
