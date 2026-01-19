import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// GET /api/me - Get current user's anonymous ID
export async function GET(request: NextRequest) {
  const fingerprint = await getFingerprint()

  // Get or create anonymous ID for this user
  const { data: anonymousId, error } = await supabase.rpc('get_or_create_anonymous_id', {
    p_fingerprint: fingerprint,
  })

  if (error) {
    console.error('Error getting anonymous ID:', error)
    return NextResponse.json({ error: 'Failed to get user ID' }, { status: 500 })
  }

  return NextResponse.json({ anonymous_id: anonymousId })
}
