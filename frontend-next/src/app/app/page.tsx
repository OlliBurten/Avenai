'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function AppRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main app after a brief delay
    const timer = setTimeout(() => {
      router.push('/client')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <SparklesIcon className="h-16 w-16 text-indigo-400 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Welcome to Avenai AI
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Redirecting you to the application...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          If you're not redirected automatically,{' '}
          <button
            onClick={() => router.push('/client')}
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            click here
          </button>
        </p>
      </div>
    </div>
  )
}
