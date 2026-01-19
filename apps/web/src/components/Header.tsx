'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { track, events } from '@/lib/analytics'

export default function Header() {
  const pathname = usePathname()
  const isMapPage = pathname === '/'

  return (
    <header className="fixed top-0 left-0 right-0 z-[1000] glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 rounded-lg">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            ice<span className="gradient-text">map</span>
          </span>
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
            href="/about"
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === '/about'
                ? 'bg-white/15 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}
