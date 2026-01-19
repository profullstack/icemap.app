import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// POST /api/posts/[id]/favorite - Add post to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fingerprint = await getFingerprint()

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

  // Add to favorites (ignore if already exists)
  const { error } = await supabase
    .from('favorites')
    .upsert(
      {
        post_id: id,
        fingerprint,
      },
      {
        onConflict: 'post_id,fingerprint',
        ignoreDuplicates: true,
      }
    )

  if (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

// DELETE /api/posts/[id]/favorite - Remove post from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fingerprint = await getFingerprint()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('post_id', id)
    .eq('fingerprint', fingerprint)

  if (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
