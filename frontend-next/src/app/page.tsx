'use client'

import { useState } from 'react'
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const features = [
    {
      icon: DocumentTextIcon,
      title: "Smart Document Analysis",
      description: "Upload any document and get instant AI-powered insights, summaries, and answers to your questions.",
      color: "text-blue-600"
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Intelligent AI Chat",
      description: "Have natural conversations with your documents. Ask questions, get explanations, and discover hidden insights.",
      color: "text-green-600"
    },
    {
      icon: ChartBarIcon,
      title: "Business Intelligence",
      description: "Transform your data into actionable insights with AI-powered analytics and reporting.",
      color: "text-purple-600"
    },
    {
      icon: ShieldExclamationIcon,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access control, audit logs, and compliance features.",
      color: "text-red-600"
    }
  ]

  const stats = [
    { number: "10x", label: "Faster Document Processing" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "AI Support" },
    { number: "0", label: "Setup Time" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Avenai
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </a>
              <a href="/dashboard" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <SparklesIcon className="h-4 w-4 mr-2" />
              AI-Powered Business Intelligence
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Documents into
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Upload any document and instantly get AI-powered insights, summaries, and answers. 
              Transform how your team works with intelligent document analysis and business intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center">
                Start Free Trial
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </button>
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <PlayIcon className="h-5 w-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to work smarter
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Avenai combines cutting-edge AI with enterprise-grade security to give your team superpowers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of teams already using Avenai to work smarter, not harder.
          </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/dashboard" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 flex items-center">
                Start Free Trial
                <RocketLaunchIcon className="h-5 w-5 ml-2" />
              </a>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                Schedule Demo
              </button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">Avenai</span>
              </div>
              <p className="text-gray-400">
                Transforming documents into intelligence with AI-powered insights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Avenai Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Avenai Demo</h3>
              <button 
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Demo video would play here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
