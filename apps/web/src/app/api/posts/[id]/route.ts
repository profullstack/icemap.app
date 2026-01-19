import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// GET /api/posts/[id] - Get single post with media, comments, and vote count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fingerprint = await getFingerprint()

  // Get the post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Get media for the post
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // Get comments for the post
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  // Get vote count
  const { data: voteCount } = await supabase.rpc('get_post_vote_count', {
    p_post_id: id,
  })

  // Get user's vote on this post
  const { data: userVote } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('post_id', id)
    .eq('fingerprint', fingerprint)
    .single()

  // Check if user has favorited this post
  const { data: userFavorite } = await supabase
    .from('favorites')
    .select('id')
    .eq('post_id', id)
    .eq('fingerprint', fingerprint)
    .single()

  // Parse location from PostGIS format
  let location = { lat: 0, lng: 0 }
  if (post.location) {
    // PostGIS returns POINT(lng lat) format
    const match = post.location.match(/POINT\(([^ ]+) ([^)]+)\)/)
    if (match) {
      location = { lat: parseFloat(match[2]), lng: parseFloat(match[1]) }
    }
  }

  return NextResponse.json({
    post: {
      ...post,
      location,
      media: media || [],
      comments: comments || [],
      vote_count: voteCount || 0,
      user_vote: userVote?.vote_type || null,
      is_favorited: !!userFavorite,
    },
  })
}
