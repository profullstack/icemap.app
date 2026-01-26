'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Gradient colors for incident types (same as main map)
const incidentColors: Record<string, { from: string; to: string }> = {
  ice_sighting: { from: '#06b6d4', to: '#0891b2' },
  traffic_accident: { from: '#ef4444', to: '#dc2626' },
  road_hazard: { from: '#f97316', to: '#ea580c' },
  police_activity: { from: '#3b82f6', to: '#2563eb' },
  fire_emergency: { from: '#ef4444', to: '#b91c1c' },
  weather_event: { from: '#8b5cf6', to: '#7c3aed' },
  construction: { from: '#eab308', to: '#ca8a04' },
  public_safety: { from: '#22c55e', to: '#16a34a' },
  protest_riot: { from: '#f43f5e', to: '#e11d48' },
  other: { from: '#6b7280', to: '#4b5563' },
}

interface Props {
  lat: number
  lng: number
  incidentType: string
}

export default function PostLocationMap({ lat, lng, incidentType }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
    })

    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    // Create marker with gradient icon
    const colors = incidentColors[incidentType] || incidentColors.other
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background: linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.2);
      "></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    L.marker([lat, lng], { icon }).addTo(map)

    // Cleanup
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [lat, lng, incidentType])

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10">
      <div ref={mapRef} className="h-48 w-full" />
      <div className="absolute bottom-2 right-2 z-[1000]">
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white/90 text-xs font-medium hover:bg-black/80 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in Maps
        </a>
      </div>
    </div>
  )
}
