'use client'

import { useState } from 'react'
import type { Comment } from '@/types'
import { track, events } from '@/lib/analytics'

interface Props {
  postId: string
  comments: Comment[]
  onCommentAdded: (comment: Comment) => void
}

export default function CommentsSection({ postId, comments, onCommentAdded }: Props) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || loading) return

    setLoading(true)
    setError(null)
    track(events.COMMENT_SUBMIT, { post_id: postId })

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        track(events.COMMENT_SUCCESS, { post_id: postId })
        onCommentAdded(data.comment)
        setContent('')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to post comment')
      }
    } catch {
      setError('Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          maxLength={1000}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-500 text-xs">{content.length}/1000</span>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 font-medium text-sm">
                  {comment.anonymous_id}
                </span>
                <span className="text-gray-500 text-xs">
                  {getTimeAgo(new Date(comment.created_at))}
                </span>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
