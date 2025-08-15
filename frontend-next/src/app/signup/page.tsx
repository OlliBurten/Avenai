'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SparklesIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface SignupForm {
  companyName: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  website: string
  industry: string
  companySize: string
  useCase: string
}

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignupForm>({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    website: '',
    industry: '',
    companySize: '',
    useCase: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<SignupForm>>({})

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Consulting',
    'Legal',
    'Real Estate',
    'Other'
  ]

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-1000 employees',
    '1000+ employees'
  ]

  const useCases = [
    'Customer Support',
    'Document Processing',
    'Data Analysis',
    'Content Creation',
    'Process Automation',
    'Research & Development',
    'Compliance & Auditing',
    'Other'
  ]

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SignupForm> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select an industry'
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Please select company size'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you'd send this to your backend
      console.log('Signup data:', formData)
      
      // Redirect to onboarding
      router.push('/onboarding?step=1')
    } catch (error) {
      console.error('Signup error:', error)
      alert('There was an error creating your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="flex justify-center">
                <SparklesIcon className="h-12 w-12 text-indigo-400" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-white">
                Create Your Account
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Start your journey with enterprise-grade AI
              </p>
            </div>

            {/* Signup Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Company Information */}
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-300">
                    Company Name *
                  </label>
                  <div className="mt-1 relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`appearance-none relative block w-full px-10 py-3 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.companyName ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your company name"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                      First Name *
                    </label>
                    <div className="mt-1 relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`appearance-none relative block w-full px-10 py-3 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.firstName ? 'border-red-500' : ''
                        }`}
                        placeholder="First name"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                      Last Name *
                    </label>
                    <div className="mt-1 relative">
                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`appearance-none relative block w-full px-10 py-3 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                          errors.lastName ? 'border-red-500' : ''
                        }`}
                        placeholder="Last name"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email Address *
                  </label>
                  <div className="mt-1 relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`appearance-none relative block w-full px-10 py-3 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password *
                  </label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`appearance-none relative block w-full px-10 py-3 pr-12 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.password ? 'border-red-500' : ''
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                    Confirm Password *
                  </label>
                  <div className="mt-1 relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`appearance-none relative block w-full px-10 py-3 pr-12 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        errors.confirmPassword ? 'border-red-500' : ''
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="appearance-none relative block w-full px-10 py-3 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-300">
                    Website
                  </label>
                  <div className="mt-1 relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="appearance-none relative block w-full px-10 py-3 border rounded-lg placeholder-gray-400 text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-300">
                    Industry *
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border rounded-lg text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.industry ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="mt-1 text-sm text-red-400">{errors.industry}</p>
                  )}
                </div>

                {/* Company Size */}
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-300">
                    Company Size *
                  </label>
                  <select
                    id="companySize"
                    name="companySize"
                    required
                    value={formData.companySize}
                    onChange={(e) => handleInputChange('companySize', e.target.value)}
                    className={`appearance-none relative block w-full px-3 py-3 border rounded-lg text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errors.companySize ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select company size</option>
                    {companySizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {errors.companySize && (
                    <p className="mt-1 text-sm text-red-400">{errors.companySize}</p>
                  )}
                </div>

                {/* Use Case */}
                <div>
                  <label htmlFor="useCase" className="block text-sm font-medium text-gray-300">
                    Primary Use Case
                  </label>
                  <select
                    id="useCase"
                    name="useCase"
                    value={formData.useCase}
                    onChange={(e) => handleInputChange('useCase', e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border rounded-lg text-white bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select primary use case</option>
                    {useCases.map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>

              {/* Terms */}
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-indigo-400 hover:text-indigo-300">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-8">
          <div className="max-w-lg text-white">
            <h3 className="text-2xl font-bold mb-6">
              Why Choose Avenai AI?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Enterprise-Grade Security</h4>
                  <p className="text-indigo-100 text-sm">SOC2 compliant with bank-level encryption</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Advanced AI Models</h4>
                  <p className="text-indigo-100 text-sm">GPT-4, Claude, and custom models</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Multi-Tenant Architecture</h4>
                  <p className="text-indigo-100 text-sm">Serve multiple clients securely</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckIcon className="h-6 w-6 text-green-300 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">24/7 Support</h4>
                  <p className="text-indigo-100 text-sm">Dedicated account management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
