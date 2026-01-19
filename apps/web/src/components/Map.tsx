'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { Post } from '@/types'
import CreatePostForm from './CreatePostForm'
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

// Custom incident icons
const incidentIcons: Record<string, L.DivIcon> = {
  traffic_accident: createIcon('red'),
  road_hazard: createIcon('orange'),
  police_activity: createIcon('blue'),
  fire_emergency: createIcon('red'),
  weather_event: createIcon('purple'),
  construction: createIcon('yellow'),
  public_safety: createIcon('green'),
  other: createIcon('gray'),
}

function createIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

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

      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: 600; margin-bottom: 4px; text-transform: capitalize;">
            ${post.incident_type.replace(/_/g, ' ')}
          </div>
          <p style="margin: 0 0 8px; color: #666; font-size: 14px;">
            ${post.summary.slice(0, 100)}${post.summary.length > 100 ? '...' : ''}
          </p>
          <a href="/post/${post.id}" style="color: #2563eb; text-decoration: none; font-size: 14px;">
            View Details &rarr;
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
      className="absolute bottom-24 right-4 z-[1000] rounded-full bg-white p-3 shadow-lg hover:bg-gray-100 disabled:opacity-50"
      aria-label="Find my location"
    >
      {locating ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      ) : (
        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  )
}

export default function Map() {
  const [posts, setPosts] = useState<MapPost[]>([])
  const [createPostLocation, setCreatePostLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchPosts = useCallback(async (bounds: L.LatLngBounds) => {
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
        <MapContent posts={posts} onBoundsChange={fetchPosts} onMapClick={handleMapClick} />
        <LocateButton />
      </MapContainer>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] px-3 py-2 bg-white rounded-lg shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-[1000] px-3 py-2 bg-black/70 rounded-lg text-white text-sm">
        Tap map to report an incident
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
