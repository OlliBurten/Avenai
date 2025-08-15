'use client'

import { useState, useEffect } from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'purple' | 'gray'
  text?: string
  showDots?: boolean
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text,
  showDots = false 
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (!showDots) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [showDots])

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      {text && (
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-gray-700">{text}</p>
          {showDots && (
            <p className="text-sm text-gray-500 mt-1 min-h-[1rem]">
              {dots}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function LoadingSkeleton({ 
  lines = 3, 
  className = "h-4 bg-gray-200 rounded" 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse ${className} ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

export function LoadingCard({ 
  title = true, 
  content = true,
  footer = false 
}: { 
  title?: boolean
  content?: boolean
  footer?: boolean 
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      {title && (
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      )}
      {content && (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      )}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      )}
    </div>
  )
}

export function LoadingGrid({ 
  rows = 3, 
  cols = 3,
  className = "h-32 bg-gray-200 rounded" 
}: { 
  rows?: number
  cols?: number
  className?: string 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse ${className}`}
        />
      ))}
    </div>
  )
}
