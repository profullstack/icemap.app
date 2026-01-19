'use client'

import { useEffect, useState } from 'react'
import type { Post, Comment, Media } from '@/types'
import VoteButtons from './VoteButtons'
import FavoriteButton from './FavoriteButton'
import ReportButton from './ReportButton'
import CommentsSection from './CommentsSection'
import MediaGallery from './MediaGallery'
import { track, events } from '@/lib/analytics'

interface PostWithDetails extends Post {
  media: Media[]
  comments: Comment[]
  vote_count: number
  user_vote: 1 | -1 | null
  is_favorited: boolean
}

interface Props {
  postId: string
}

export default function PostDetail({ postId }: Props) {
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [postId])

  async function fetchPost() {
    try {
      const res = await fetch(`/api/posts/${postId}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Post not found or has expired')
        } else {
          setError('Failed to load post')
        }
        return
      }
      const data = await res.json()
      setPost(data.post)
      track(events.POST_VIEW, { post_id: postId, incident_type: data.post.incident_type })
    } catch {
      setError('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  function handleVoteChange(newVoteCount: number, newUserVote: 1 | -1 | null) {
    if (post) {
      setPost({ ...post, vote_count: newVoteCount, user_vote: newUserVote })
    }
  }

  function handleFavoriteChange(isFavorited: boolean) {
    if (post) {
      setPost({ ...post, is_favorited: isFavorited })
    }
  }

  function handleCommentAdded(comment: Comment) {
    if (post) {
      setPost({ ...post, comments: [...post.comments, comment] })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">{error || 'Post not found'}</p>
      </div>
    )
  }

  const incidentLabel = post.incident_type.replace(/_/g, ' ')
  const timeAgo = getTimeAgo(new Date(post.created_at))
  const expiresIn = getTimeUntil(new Date(post.expires_at))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white capitalize">
          {incidentLabel}
        </span>
        <p className="text-gray-400 text-sm mt-2">
          {post.cross_street && `${post.cross_street} • `}
          {post.city && `${post.city}, `}
          {post.state}
        </p>
      </div>

      {/* Media Gallery */}
      {post.media.length > 0 && (
        <div className="mb-6">
          <MediaGallery media={post.media} />
        </div>
      )}

      {/* Summary */}
      <p className="text-white text-lg mb-4">{post.summary}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
        <span>{timeAgo}</span>
        <span className="text-yellow-500">Expires {expiresIn}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 py-4 border-t border-b border-gray-700">
        <VoteButtons
          postId={post.id}
          voteCount={post.vote_count}
          userVote={post.user_vote}
          onVoteChange={handleVoteChange}
        />
        <FavoriteButton
          postId={post.id}
          isFavorited={post.is_favorited}
          onFavoriteChange={handleFavoriteChange}
        />
        <ReportButton postId={post.id} />
      </div>

      {/* Comments */}
      <CommentsSection
        postId={post.id}
        comments={post.comments}
        onCommentAdded={handleCommentAdded}
      />
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

function getTimeUntil(date: Date): string {
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000)
  if (seconds < 60) return 'in less than a minute'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `in ${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `in ${hours}h ${minutes % 60}m`
}
