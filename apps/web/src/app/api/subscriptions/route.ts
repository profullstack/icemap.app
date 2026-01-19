import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// POST /api/subscriptions - Subscribe to area notifications
export async function POST(request: NextRequest) {
  const fingerprint = await getFingerprint()

  let body: {
    sw_lat: number
    sw_lng: number
    ne_lat: number
    ne_lng: number
    push_subscription?: {
      endpoint: string
      keys: {
        p256dh: string
        auth: string
      }
    }
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { sw_lat, sw_lng, ne_lat, ne_lng, push_subscription } = body

  // Validate bounding box
  if (
    typeof sw_lat !== 'number' ||
    typeof sw_lng !== 'number' ||
    typeof ne_lat !== 'number' ||
    typeof ne_lng !== 'number'
  ) {
    return NextResponse.json(
      { error: 'Invalid bounding box coordinates' },
      { status: 400 }
    )
  }

  // Validate coordinates are within valid ranges
  if (
    sw_lat < -90 || sw_lat > 90 ||
    ne_lat < -90 || ne_lat > 90 ||
    sw_lng < -180 || sw_lng > 180 ||
    ne_lng < -180 || ne_lng > 180
  ) {
    return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 })
  }

  // Create subscription
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert({
      fingerprint,
      sw_lat,
      sw_lng,
      ne_lat,
      ne_lng,
      push_endpoint: push_subscription?.endpoint,
      push_p256dh: push_subscription?.keys?.p256dh,
      push_auth: push_subscription?.keys?.auth,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }

  return NextResponse.json({ id: subscription.id }, { status: 201 })
}

// DELETE /api/subscriptions - Unsubscribe from notifications
export async function DELETE(request: NextRequest) {
  const fingerprint = await getFingerprint()

  const { searchParams } = new URL(request.url)
  const subscriptionId = searchParams.get('id')

  if (subscriptionId) {
    // Delete specific subscription
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', subscriptionId)
      .eq('fingerprint', fingerprint) // Ensure user owns the subscription

    if (error) {
      console.error('Error deleting subscription:', error)
      return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
    }
  } else {
    // Delete all subscriptions for this user
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('fingerprint', fingerprint)

    if (error) {
      console.error('Error deleting subscriptions:', error)
      return NextResponse.json({ error: 'Failed to delete subscriptions' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}

// GET /api/subscriptions - Get user's subscriptions
export async function GET(request: NextRequest) {
  const fingerprint = await getFingerprint()

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('fingerprint', fingerprint)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }

  return NextResponse.json({ subscriptions: subscriptions || [] })
}
