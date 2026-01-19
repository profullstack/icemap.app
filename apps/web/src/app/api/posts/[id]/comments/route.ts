import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// GET /api/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }

  return NextResponse.json({ comments: comments || [] })
}

// POST /api/posts/[id]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fingerprint = await getFingerprint()

  let body: { content: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { content } = body

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
  }

  if (content.length > 1000) {
    return NextResponse.json(
      { error: 'Comment must be 1000 characters or less' },
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

  // Get or create anonymous ID for this user
  const { data: anonymousId } = await supabase.rpc('get_or_create_anonymous_id', {
    p_fingerprint: fingerprint,
  })

  // Create the comment
  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_id: id,
      fingerprint,
      anonymous_id: anonymousId,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }

  return NextResponse.json({ comment }, { status: 201 })
}
