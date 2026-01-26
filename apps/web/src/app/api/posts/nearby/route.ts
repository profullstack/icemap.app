import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/posts/nearby - Get posts within radius of a point
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radiusMiles = parseFloat(searchParams.get('radius') || '100')
  const excludeId = searchParams.get('exclude') || ''
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'Missing or invalid lat/lng parameters' },
      { status: 400 }
    )
  }

  // Convert miles to meters for PostGIS (1 mile = 1609.34 meters)
  const radiusMeters = radiusMiles * 1609.34

  // Query posts within radius using PostGIS ST_DWithin
  const { data: posts, error } = await supabase.rpc('get_nearby_posts', {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
    p_exclude_id: excludeId || null,
    p_limit: limit,
  })

  if (error) {
    console.error('Error fetching nearby posts:', error)
    return NextResponse.json({ error: 'Failed to fetch nearby posts' }, { status: 500 })
  }

  return NextResponse.json({ posts: posts || [] })
}
