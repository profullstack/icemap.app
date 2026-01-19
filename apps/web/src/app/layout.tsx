import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'icemap - Anonymous Incident Reporting',
  description: 'Anonymous, real-time incident reporting on a map. No accounts. No tracking. Posts auto-delete after 8 hours.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'icemap',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          defer
          data-website-id="dfid_ApxSLoyHaiNiNl5mXq82L"
          data-domain="icemap.app"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-gray-900 text-white antialiased">
        <ServiceWorkerRegistration />
        <Header />
        {children}
      </body>
    </html>
  )
}
