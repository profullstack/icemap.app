'use client'

import { useState, useRef, useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { track, events } from '@/lib/analytics'

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export default function CitySearch() {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showInput])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('.city-search-container')) {
        setIsOpen(false)
        if (!query) setShowInput(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query])

  async function searchCities(searchQuery: string) {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      // Use Nominatim API (OpenStreetMap's free geocoding)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: searchQuery,
          format: 'json',
          limit: '5',
          addressdetails: '1',
          countrycodes: 'us', // Focus on US, remove for global
        }),
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )

      if (res.ok) {
        const data: SearchResult[] = await res.json()
        setResults(data)
        setIsOpen(data.length > 0)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(value: string) {
    setQuery(value)

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchCities(value)
    }, 300)
  }

  function handleSelect(result: SearchResult) {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)

    track(events.MAP_SEARCH, { query, lat, lng })

    map.flyTo([lat, lng], 13, {
      duration: 1.5,
    })

    setQuery('')
    setResults([])
    setIsOpen(false)
    setShowInput(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (results.length > 0) {
      handleSelect(results[0])
    }
  }

  if (!showInput) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowInput(true)
        }}
        className="absolute top-4 right-4 z-[1000] group"
        aria-label="Search location"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative glass rounded-xl px-4 py-2.5 border border-white/20 group-hover:border-white/30 transition-all flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-white text-sm font-medium hidden sm:inline">Search</span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div
      className="city-search-container absolute top-4 right-4 z-[1000] w-72"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur" />
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative glass rounded-xl border border-white/20 overflow-hidden">
            <div className="flex items-center">
              <div className="pl-4">
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search city or address..."
                className="flex-1 px-3 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setResults([])
                  setIsOpen(false)
                  setShowInput(false)
                }}
                className="px-3 py-3 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* Results dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-white/10 overflow-hidden">
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
              >
                <p className="text-white text-sm truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
