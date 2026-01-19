import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// POST /api/posts/[id]/vote - Upvote or downvote a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fingerprint = await getFingerprint()

  let body: { vote_type: 1 | -1 | 0 }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { vote_type } = body

  if (vote_type !== 1 && vote_type !== -1 && vote_type !== 0) {
    return NextResponse.json(
      { error: 'vote_type must be 1 (upvote), -1 (downvote), or 0 (remove)' },
      { status: 400 }
    )
  }

  // Verify post exists and is not expired
  const { data: post } = await supabase
    .from('posts')
    .select('id')
    .eq('id', id)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (!post) {
    return NextResponse.json({ error: 'Post not found or expired' }, { status: 404 })
  }

  if (vote_type === 0) {
    // Remove vote
    await supabase
      .from('votes')
      .delete()
      .eq('post_id', id)
      .eq('fingerprint', fingerprint)
  } else {
    // Upsert vote
    const { error } = await supabase
      .from('votes')
      .upsert(
        {
          post_id: id,
          fingerprint,
          vote_type,
        },
        {
          onConflict: 'post_id,fingerprint',
        }
      )

    if (error) {
      console.error('Error voting:', error)
      return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
    }
  }

  // Get updated vote count
  const { data: voteCount } = await supabase.rpc('get_post_vote_count', {
    p_post_id: id,
  })

  return NextResponse.json({ vote_count: voteCount || 0 })
}
