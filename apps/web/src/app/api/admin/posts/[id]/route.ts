import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

// DELETE /api/admin/posts/[id] - Delete a post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check admin authentication
  const adminAuth = await isAdmin()
  if (!adminAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
  }

  // Get media files associated with this post (for storage cleanup)
  const { data: mediaFiles } = await supabase
    .from('media')
    .select('storage_path')
    .eq('post_id', id)

  // Delete media files from storage
  if (mediaFiles && mediaFiles.length > 0) {
    const paths = mediaFiles.map((m) => m.storage_path)
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove(paths)

    if (storageError) {
      console.error('Error deleting media files:', storageError)
      // Continue with post deletion even if storage cleanup fails
    }
  }

  // Delete the post (CASCADE will remove media, comments, votes, favorites)
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
