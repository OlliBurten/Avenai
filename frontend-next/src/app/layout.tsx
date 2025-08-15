import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import EnhancedNavigation from '@/components/enhanced-navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Avenai - AI-Powered Business Intelligence Platform',
  description: 'Enterprise AI integration platform for SaaS companies. AI-powered document analysis, business intelligence, and insights.',
  keywords: ['AI', 'Business Intelligence', 'Document Analysis', 'SaaS', 'Enterprise'],
  authors: [{ name: 'Avenai Technologies' }],
  creator: 'Avenai Technologies',
  publisher: 'Avenai Technologies',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://avenai.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Avenai - AI-Powered Business Intelligence Platform',
    description: 'Enterprise AI integration platform for SaaS companies',
    url: 'https://avenai.com',
    siteName: 'Avenai',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Avenai AI Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avenai - AI-Powered Business Intelligence Platform',
    description: 'Enterprise AI integration platform for SaaS companies',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <main>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
