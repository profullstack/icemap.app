import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// GET /api/favorites - Get user's favorited posts
export async function GET(request: NextRequest) {
  const fingerprint = await getFingerprint()

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      post:posts (
        id,
        city,
        state,
        cross_street,
        summary,
        incident_type,
        created_at,
        expires_at
      )
    `)
    .eq('fingerprint', fingerprint)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 })
  }

  // Filter out favorites with expired or deleted posts
  const validFavorites = (favorites || []).filter(
    (f) => {
      const post = f.post as unknown as { expires_at: string } | null
      return post && new Date(post.expires_at) > new Date()
    }
  )

  return NextResponse.json({ favorites: validFavorites })
}
