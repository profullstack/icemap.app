import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'
import type { Post, BoundingBox } from '@/types'

const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '3600', 10)

// GET /api/posts - Fetch posts within bounding box
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const north = parseFloat(searchParams.get('north') || '')
  const south = parseFloat(searchParams.get('south') || '')
  const east = parseFloat(searchParams.get('east') || '')
  const west = parseFloat(searchParams.get('west') || '')

  if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
    return NextResponse.json(
      { error: 'Missing or invalid bounding box parameters' },
      { status: 400 }
    )
  }

  // Query posts within bounding box using PostGIS
  const { data: posts, error } = await supabase
    .rpc('get_posts_in_bounds', {
      min_lat: south,
      max_lat: north,
      min_lng: west,
      max_lng: east,
    })

  if (error) {
    // If the function doesn't exist, fall back to a raw query
    const { data: fallbackPosts, error: fallbackError } = await supabase
      .from('posts')
      .select(`
        id,
        city,
        state,
        cross_street,
        summary,
        incident_type,
        created_at,
        expires_at
      `)
      .gte('expires_at', new Date().toISOString())

    if (fallbackError) {
      console.error('Error fetching posts:', fallbackError)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    return NextResponse.json({ posts: fallbackPosts || [] })
  }

  return NextResponse.json({ posts: posts || [] })
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  const fingerprint = await getFingerprint()

  // Check rate limit
  const { data: canPost } = await supabase.rpc('can_user_post', {
    p_fingerprint: fingerprint,
    p_window_seconds: RATE_LIMIT_WINDOW,
  })

  if (canPost === false) {
    return NextResponse.json(
      { error: 'Rate limited. Please wait before posting again.' },
      { status: 429 }
    )
  }

  let body: {
    lat: number
    lng: number
    summary: string
    incident_type: string
    city?: string
    state?: string
    cross_street?: string
    media_ids?: string[]
    links?: { url: string; title?: string }[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { lat, lng, summary, incident_type, city, state, cross_street, media_ids, links } = body

  // Debug log incoming data
  console.log('POST /api/posts - received:', { lat, lng, latType: typeof lat, lngType: typeof lng, summary: summary?.slice(0, 50) })

  // Validate required fields - use explicit checks to allow 0 coordinates
  if (typeof lat !== 'number' || typeof lng !== 'number' || !summary || !incident_type) {
    console.log('POST /api/posts - validation failed:', { lat, lng, summary: !!summary, incident_type: !!incident_type })
    return NextResponse.json(
      { error: 'Missing required fields: lat, lng, summary, incident_type' },
      { status: 400 }
    )
  }

  // Validate coordinates
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    console.log('POST /api/posts - invalid coordinates:', { lat, lng })
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  // Validate summary length
  if (summary.length > 500) {
    return NextResponse.json(
      { error: 'Summary must be 500 characters or less' },
      { status: 400 }
    )
  }

  // Validate links
  if (links && links.length > 3) {
    return NextResponse.json(
      { error: 'Maximum 3 links allowed' },
      { status: 400 }
    )
  }

  // Validate link URLs
  if (links) {
    for (const link of links) {
      try {
        new URL(link.url)
      } catch {
        return NextResponse.json(
          { error: 'Invalid URL in links' },
          { status: 400 }
        )
      }
    }
  }

  // Create the post using RPC function for proper geography handling
  console.log('POST /api/posts - calling create_post RPC with:', { lat, lng })

  const { data: postId, error } = await supabase.rpc('create_post', {
    p_lat: lat,
    p_lng: lng,
    p_city: city || null,
    p_state: state || null,
    p_cross_street: cross_street || null,
    p_summary: summary,
    p_incident_type: incident_type,
    p_fingerprint: fingerprint,
    p_links: links || [],
  })

  if (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }

  const post = { id: postId }
  console.log('POST /api/posts - created post with id:', postId)

  // Link media to post if provided
  if (media_ids && media_ids.length > 0) {
    await supabase
      .from('media')
      .update({ post_id: post.id })
      .in('id', media_ids)
  }

  // Record the post for rate limiting
  await supabase.rpc('record_post', { p_fingerprint: fingerprint })

  // Find and notify subscriptions (async, don't wait)
  notifySubscribers(lat, lng, post.id, summary, incident_type).catch(console.error)

  return NextResponse.json({ id: post.id }, { status: 201 })
}

async function notifySubscribers(
  lat: number,
  lng: number,
  postId: string,
  summary: string,
  incidentType: string
) {
  const { data: subscriptions } = await supabase.rpc('find_subscriptions_for_post', {
    p_lat: lat,
    p_lng: lng,
  })

  if (!subscriptions || subscriptions.length === 0) return

  // Import web-push dynamically to avoid loading it if not needed
  const webPush = await import('web-push')

  webPush.setVapidDetails(
    `mailto:${process.env.ADMIN_EMAIL || 'admin@icemap.app'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
  )

  const payload = JSON.stringify({
    title: `New ${incidentType.replace('_', ' ')} nearby`,
    body: summary.slice(0, 100),
    url: `/post/${postId}`,
  })

  for (const sub of subscriptions) {
    if (sub.push_endpoint && sub.push_p256dh && sub.push_auth) {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.push_endpoint,
            keys: {
              p256dh: sub.push_p256dh,
              auth: sub.push_auth,
            },
          },
          payload
        )
      } catch (error) {
        console.error('Failed to send push notification:', error)
      }
    }
  }
}
