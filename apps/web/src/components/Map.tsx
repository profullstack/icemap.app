'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { Post } from '@/types'
import CreatePostForm from './CreatePostForm'
import CitySearch from './CitySearch'
import { track, events } from '@/lib/analytics'

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795] // US center
const DEFAULT_ZOOM = 4

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Gradient colors for incident types
const incidentColors: Record<string, { from: string; to: string }> = {
  ice_sighting: { from: '#06b6d4', to: '#0891b2' },
  traffic_accident: { from: '#ef4444', to: '#dc2626' },
  road_hazard: { from: '#f97316', to: '#ea580c' },
  police_activity: { from: '#3b82f6', to: '#2563eb' },
  fire_emergency: { from: '#ef4444', to: '#b91c1c' },
  weather_event: { from: '#8b5cf6', to: '#7c3aed' },
  construction: { from: '#eab308', to: '#ca8a04' },
  public_safety: { from: '#22c55e', to: '#16a34a' },
  other: { from: '#6b7280', to: '#4b5563' },
}

// Filter labels for display
const filterLabels: Record<string, string> = {
  ice_sighting: 'ICE',
  traffic_accident: 'Traffic',
  road_hazard: 'Hazard',
  police_activity: 'Police',
  fire_emergency: 'Fire',
  weather_event: 'Weather',
  construction: 'Construction',
  public_safety: 'Safety',
  other: 'Other',
}

// Custom incident icons with gradient effect
const incidentIcons: Record<string, L.DivIcon> = Object.fromEntries(
  Object.entries(incidentColors).map(([key, { from, to }]) => [
    key,
    L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: linear-gradient(135deg, ${from} 0%, ${to} 100%);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2);
        transition: transform 0.2s;
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    }),
  ])
)

interface MapPost extends Post {
  location: { lat: number; lng: number }
}

function MapContent({
  posts,
  onBoundsChange,
  onMapClick,
}: {
  posts: MapPost[]
  onBoundsChange: (bounds: L.LatLngBounds) => void
  onMapClick: (lat: number, lng: number) => void
}) {
  const map = useMap()
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null)

  // Listen for flyTo events from +Report button
  useEffect(() => {
    const handleFlyTo = (e: CustomEvent<{ lat: number; lng: number }>) => {
      map.flyTo([e.detail.lat, e.detail.lng], 14, { duration: 1.5 })
    }
    window.addEventListener('mapFlyTo', handleFlyTo as EventListener)
    return () => window.removeEventListener('mapFlyTo', handleFlyTo as EventListener)
  }, [map])

  // Initialize marker cluster group
  useEffect(() => {
    const loadMarkerCluster = async () => {
      const markerClusterModule = await import('leaflet.markercluster')
      const MarkerClusterGroup = (markerClusterModule as unknown as { default: { MarkerClusterGroup: typeof L.MarkerClusterGroup } }).default?.MarkerClusterGroup || L.MarkerClusterGroup

      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current)
      }

      const markerCluster = new MarkerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      })

      markerClusterRef.current = markerCluster
      map.addLayer(markerCluster)
    }

    loadMarkerCluster()

    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current)
      }
    }
  }, [map])

  // Update markers when posts change
  useEffect(() => {
    if (!markerClusterRef.current) return

    markerClusterRef.current.clearLayers()

    posts.forEach((post) => {
      const icon = incidentIcons[post.incident_type] || incidentIcons.other
      const marker = L.marker([post.location.lat, post.location.lng], { icon })

      const colors = incidentColors[post.incident_type] || incidentColors.other
      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="
            display: inline-block;
            padding: 4px 10px;
            background: linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%);
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          ">
            ${post.incident_type.replace(/_/g, ' ')}
          </div>
          <p style="margin: 0 0 12px; color: #9ca3af; font-size: 14px; line-height: 1.5;">
            ${post.summary.slice(0, 100)}${post.summary.length > 100 ? '...' : ''}
          </p>
          <a href="/post/${post.id}" style="
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: #818cf8;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: color 0.2s;
          " onmouseover="this.style.color='#a5b4fc'" onmouseout="this.style.color='#818cf8'">
            View Details
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      `

      marker.bindPopup(popupContent)
      markerClusterRef.current?.addLayer(marker)
    })
  }, [posts])

  // Handle map events
  useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds())
    },
    click: (e) => {
      track(events.MAP_CLICK, { lat: e.latlng.lat, lng: e.latlng.lng })
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
    zoomend: () => {
      track(events.MAP_ZOOM, { zoom: map.getZoom() })
    },
  })

  // Initial bounds fetch
  useEffect(() => {
    onBoundsChange(map.getBounds())
  }, [map, onBoundsChange])

  return null
}

function LocateButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    track(events.MAP_LOCATE)
    setLocating(true)
    map.locate({ setView: true, maxZoom: 14 })
  }

  useEffect(() => {
    const onLocationFound = () => setLocating(false)
    const onLocationError = () => setLocating(false)

    map.on('locationfound', onLocationFound)
    map.on('locationerror', onLocationError)

    return () => {
      map.off('locationfound', onLocationFound)
      map.off('locationerror', onLocationError)
    }
  }, [map])

  return (
    <button
      onClick={handleLocate}
      disabled={locating}
      className="absolute bottom-24 right-4 z-[1000] group"
      aria-label="Find my location"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
        <div className="relative glass rounded-2xl p-3.5 border border-white/20 group-hover:border-white/30 transition-all group-hover:scale-105 group-disabled:opacity-50">
          {locating ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          ) : (
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

export default function Map() {
  const [posts, setPosts] = useState<MapPost[]>([])
  const [createPostLocation, setCreatePostLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(Object.keys(incidentColors)))
  const [showFilters, setShowFilters] = useState(false)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const hasHandledReportParam = useRef(false)
  const searchedLocationRef = useRef<{ lat: number; lng: number; timestamp: number } | null>(null)

  // Listen for city search location events
  useEffect(() => {
    const handleCitySearchLocation = (e: CustomEvent<{ lat: number; lng: number }>) => {
      searchedLocationRef.current = {
        lat: e.detail.lat,
        lng: e.detail.lng,
        timestamp: Date.now(),
      }
    }
    window.addEventListener('citySearchLocation', handleCitySearchLocation as EventListener)
    return () => window.removeEventListener('citySearchLocation', handleCitySearchLocation as EventListener)
  }, [])

  // Function to open report modal using geolocation or default location
  const openReportModal = useCallback(() => {
    // If user searched for a location in the last 30 seconds, use that
    const searchedLoc = searchedLocationRef.current
    if (searchedLoc && Date.now() - searchedLoc.timestamp < 30000) {
      window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat: searchedLoc.lat, lng: searchedLoc.lng } }))
      setCreatePostLocation({ lat: searchedLoc.lat, lng: searchedLoc.lng })
      searchedLocationRef.current = null // Clear after use
      return
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          // Fly map to user's location
          window.dispatchEvent(new CustomEvent('mapFlyTo', { detail: { lat, lng } }))
          setCreatePostLocation({ lat, lng })
        },
        () => {
          // Fallback to map center or default
          const center = boundsRef.current?.getCenter()
          setCreatePostLocation({
            lat: center?.lat ?? DEFAULT_CENTER[0],
            lng: center?.lng ?? DEFAULT_CENTER[1],
          })
        },
        { timeout: 5000, maximumAge: 60000 }
      )
    } else {
      // No geolocation, use map center
      const center = boundsRef.current?.getCenter()
      setCreatePostLocation({
        lat: center?.lat ?? DEFAULT_CENTER[0],
        lng: center?.lng ?? DEFAULT_CENTER[1],
      })
    }
  }, [])

  // Listen for custom event from Header
  useEffect(() => {
    const handleOpenReportModal = () => openReportModal()
    window.addEventListener('openReportModal', handleOpenReportModal)
    return () => window.removeEventListener('openReportModal', handleOpenReportModal)
  }, [openReportModal])

  // Handle ?report=1 URL parameter
  useEffect(() => {
    if (searchParams.get('report') === '1' && !hasHandledReportParam.current) {
      hasHandledReportParam.current = true
      openReportModal()
      // Clear the URL parameter
      router.replace('/', { scroll: false })
    }
  }, [searchParams, openReportModal, router])

  const toggleFilter = (type: string) => {
    track(events.MAP_FILTER, { type, action: activeFilters.has(type) ? 'remove' : 'add' })
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }

  const selectAll = () => {
    setActiveFilters(new Set(Object.keys(incidentColors)))
  }

  const selectNone = () => {
    setActiveFilters(new Set())
  }

  const fetchPosts = useCallback(async (bounds: L.LatLngBounds) => {
    boundsRef.current = bounds
    // Debounce fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          north: bounds.getNorth().toString(),
          south: bounds.getSouth().toString(),
          east: bounds.getEast().toString(),
          west: bounds.getWest().toString(),
        })

        const res = await fetch(`/api/posts?${params}`)
        if (res.ok) {
          const data = await res.json()
          // Transform posts to include parsed location
          const transformedPosts = (data.posts || []).map((post: unknown) => {
            const p = post as { location?: string; id: string; summary: string; incident_type: string }
            let location = { lat: 0, lng: 0 }
            if (typeof p.location === 'string') {
              const match = p.location.match(/POINT\(([^ ]+) ([^)]+)\)/)
              if (match) {
                location = { lat: parseFloat(match[2]), lng: parseFloat(match[1]) }
              }
            }
            return { ...p, location }
          })
          setPosts(transformedPosts)
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  // Filter posts based on active filters
  const filteredPosts = posts.filter(post => activeFilters.has(post.incident_type))

  const handleMapClick = useCallback((lat: number, lng: number) => {
    track(events.POST_CREATE_START, { lat, lng })
    setCreatePostLocation({ lat, lng })
  }, [])

  const handlePostCreated = useCallback((postId: string) => {
    setCreatePostLocation(null)
    window.location.href = `/post/${postId}`
  }, [])

  return (
    <div className="map-container">
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapContent posts={filteredPosts} onBoundsChange={fetchPosts} onMapClick={handleMapClick} />
        <LocateButton />
        <CitySearch />
      </MapContainer>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-16 right-4 z-[1000] glass rounded-xl px-4 py-2.5 flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          <span className="text-white/80 text-sm font-medium">Loading...</span>
        </div>
      )}

      {/* Filter toggle button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="absolute top-4 left-4 z-[1000] group"
        aria-label="Filter incidents"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative glass rounded-xl px-4 py-2.5 border border-white/20 group-hover:border-white/30 transition-all flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-white text-sm font-medium">Filter</span>
            {activeFilters.size < Object.keys(incidentColors).length && (
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-bold">
                {activeFilters.size}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Filter panel */}
      {showFilters && (
        <div className="absolute top-16 left-4 z-[1000] w-72">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur" />
            <div className="relative glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white font-medium text-sm">Filter by Type</span>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    All
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    onClick={selectNone}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    None
                  </button>
                </div>
              </div>
              <div className="p-3 grid grid-cols-3 gap-2">
                {Object.entries(incidentColors).map(([type, colors]) => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(type)}
                    className={`relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${
                      activeFilters.has(type)
                        ? 'bg-white/10 ring-2 ring-offset-1 ring-offset-transparent'
                        : 'bg-white/5 hover:bg-white/10 opacity-50'
                    }`}
                    style={{
                      '--tw-ring-color': activeFilters.has(type) ? colors.from : 'transparent',
                    } as React.CSSProperties}
                  >
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                      }}
                    />
                    <span className="text-white text-[10px] font-medium leading-tight text-center">
                      {filterLabels[type]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-white/10 bg-white/5">
                <p className="text-gray-400 text-xs text-center">
                  Showing {filteredPosts.length} of {posts.length} incidents
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur" />
          <div className="relative glass rounded-xl px-4 py-3 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Tap anywhere on the map</p>
                <p className="text-white/60 text-xs">to report an incident</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create post form */}
      {createPostLocation && (
        <CreatePostForm
          lat={createPostLocation.lat}
          lng={createPostLocation.lng}
          onClose={() => setCreatePostLocation(null)}
          onSuccess={handlePostCreated}
        />
      )}
    </div>
  )
}
