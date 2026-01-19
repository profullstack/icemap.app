import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/posts/recent - Fetch recent posts (newest first)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      id,
      location,
      city,
      state,
      cross_street,
      summary,
      incident_type,
      created_at,
      expires_at,
      vote_count,
      comment_count
    `)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }

  return NextResponse.json({ posts: posts || [] })
}
