import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: 'icemap - Anonymous Incident Reporting',
  description: 'Anonymous, real-time incident reporting on a map. No accounts. No tracking. Posts auto-delete after 7 days.',
  metadataBase: new URL('https://icemap.app'),
  manifest: '/manifest.json',
  openGraph: {
    title: 'icemap - Anonymous Incident Reporting',
    description: 'Anonymous, real-time incident reporting on a map. No accounts. No tracking. Posts auto-delete after 7 days.',
    url: 'https://icemap.app',
    siteName: 'icemap',
    images: [
      {
        url: '/banner.png',
        width: 1200,
        height: 630,
        alt: 'icemap - Anonymous Incident Reporting',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'icemap - Anonymous Incident Reporting',
    description: 'Anonymous, real-time incident reporting on a map. No accounts. No tracking. Posts auto-delete after 7 days.',
    images: ['/banner.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/icons/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/icons/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/icons/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/icons/apple-touch-icon-60x60.png', sizes: '60x60' },
      { url: '/icons/apple-touch-icon-57x57.png', sizes: '57x57' },
    ],
    other: [
      { rel: 'mask-icon', url: '/favicon.svg', color: '#1a1a2e' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'icemap',
  },
  other: {
    'msapplication-TileColor': '#1a1a2e',
    'msapplication-config': '/icons/browserconfig.xml',
    'msapplication-TileImage': '/icons/apple-touch-icon-144x144.png',
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
