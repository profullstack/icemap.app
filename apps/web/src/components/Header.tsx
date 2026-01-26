'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { track, events } from '@/lib/analytics'
import InstallButton from './InstallButton'

export default function Header() {
  const pathname = usePathname()
  const isMapPage = pathname === '/'
  const [locating, setLocating] = useState(false)

  const handleFindLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    track(events.MAP_LOCATE, { source: 'header' })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat, lng } }))
        setLocating(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Unable to get your location. Please check your browser permissions.')
        setLocating(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.svg"
            alt="icemap"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Report Incident Button */}
          {isMapPage ? (
            <button
              onClick={() => {
                track(events.POST_CREATE_START, { source: 'header' })
                window.dispatchEvent(new CustomEvent('openReportModal'))
              }}
              className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Report</span>
            </button>
          ) : (
            <Link
              href="/?report=1"
              onClick={() => track(events.POST_CREATE_START, { source: 'header' })}
              className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Report</span>
            </Link>
          )}

          {/* Find My Location Button - only on map page */}
          {isMapPage && (
            <button
              onClick={handleFindLocation}
              disabled={locating}
              className="relative p-2.5 rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
              aria-label="Find my location"
            >
              {locating ? (
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          )}

          <Link
            href="/recent"
            onClick={() => track(events.NAV_RECENT)}
            className={`relative p-2.5 rounded-xl transition-all duration-200 ${
              pathname === '/recent'
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Recent posts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
          <Link
            href="/favorites"
            onClick={() => track(events.NAV_FAVORITES)}
            className={`relative p-2.5 rounded-xl transition-all duration-200 ${
              pathname === '/favorites'
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Saved posts"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </Link>
          <Link
            href="/donate"
            onClick={() => track(events.NAV_DONATE)}
            className={`relative p-2.5 rounded-xl transition-all duration-200 ${
              pathname === '/donate'
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            aria-label="Donate"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </Link>
          <Link
            href="/about"
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === '/about'
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            About
          </Link>
          <div className="hidden sm:block">
            <InstallButton />
          </div>
        </nav>
      </div>
    </header>
  )
}
