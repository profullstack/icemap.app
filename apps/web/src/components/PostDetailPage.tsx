'use client'

import { useEffect, useState, memo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { Post, Comment, Media } from '@/types'
import VoteButtons from './VoteButtons'
import FavoriteButton from './FavoriteButton'
import ReportButton from './ReportButton'
import ShareButton from './ShareButton'
import CommentsSection from './CommentsSection'
import MediaGallery from './MediaGallery'
import AdminDeleteButton from './AdminDeleteButton'
import Footer from './Footer'
import { useAdmin } from '@/hooks/useAdmin'
import { track, events } from '@/lib/analytics'
import { getTimeAgo, getTimeUntil } from '@/lib/time'

// Load map the same way homepage does - at the top level of a client component
const PostLocationMap = dynamic(() => import('./PostLocationMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 w-full bg-gray-800 rounded-xl flex items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
    </div>
  ),
})

// Memoized map wrapper to prevent re-renders
const MemoizedMap = memo(function MemoizedMap({
  lat,
  lng,
  incidentType
}: {
  lat: number
  lng: number
  incidentType: string
}) {
  return (
    <PostLocationMap
      lat={lat}
      lng={lng}
      incidentType={incidentType}
    />
  )
})

interface PostWithDetails extends Post {
  media: Media[]
  comments: Comment[]
  vote_count: number
  user_vote: 1 | -1 | null
  is_favorited: boolean
  links?: { url: string; title?: string }[]
}

interface NearbyPost {
  id: string
  city: string | null
  state: string | null
  summary: string
  incident_type: string
  created_at: string
  distance_meters: number
}

interface Props {
  postId: string
}

export default function PostDetailPage({ postId }: Props) {
  const [post, setPost] = useState<PostWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nearbyPosts, setNearbyPosts] = useState<NearbyPost[]>([])
  const { isAdmin } = useAdmin()

  useEffect(() => {
    fetchPost()
  }, [postId])

  // Fetch nearby posts when we have the post location
  useEffect(() => {
    if (post?.location) {
      fetchNearbyPosts(post.location.lat, post.location.lng, post.id)
    }
  }, [post?.location, post?.id])

  async function fetchNearbyPosts(lat: number, lng: number, excludeId: string) {
    try {
      const res = await fetch(
        `/api/posts/nearby?lat=${lat}&lng=${lng}&radius=100&exclude=${excludeId}&limit=5`
      )
      if (res.ok) {
        const data = await res.json()
        setNearbyPosts(data.posts || [])
      }
    } catch (err) {
      console.error('Failed to fetch nearby posts:', err)
    }
  }

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
      <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
        <div className="flex-1 flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
        <div className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to map
            </Link>
          </div>
          <div className="max-w-2xl mx-auto px-4 py-12 text-center">
            <p className="text-gray-400">{error || 'Post not found'}</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const incidentLabel = post.incident_type.replace(/_/g, ' ')
  const timeAgo = getTimeAgo(new Date(post.created_at))
  const expiresIn = getTimeUntil(new Date(post.expires_at))

  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to map
          </Link>
        </div>

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

          {/* Location Map */}
          {post.location && (
            <div className="mb-6">
              <MemoizedMap
                lat={post.location.lat}
                lng={post.location.lng}
                incidentType={post.incident_type}
              />
            </div>
          )}

          {/* Media Gallery */}
          {post.media.length > 0 && (
            <div className="mb-6">
              <MediaGallery media={post.media} />
            </div>
          )}

          {/* Summary */}
          <p className="text-white text-lg mb-4">{post.summary}</p>

          {/* Links */}
          {post.links && post.links.length > 0 && (
            <div className="mb-6 space-y-2">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Related Links
              </h3>
              <div className="space-y-2">
                {post.links.map((link: { url: string; title?: string }, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                  >
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="text-indigo-400 group-hover:text-indigo-300 truncate text-sm">
                      {link.title || new URL(link.url).hostname}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

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
            <ShareButton postId={post.id} />
            <ReportButton postId={post.id} />
            {isAdmin && <AdminDeleteButton postId={post.id} />}
          </div>

          {/* Comments */}
          <CommentsSection
            postId={post.id}
            comments={post.comments}
            onCommentAdded={handleCommentAdded}
          />

          {/* Nearby Incidents */}
          {nearbyPosts.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Nearby Incidents
              </h3>
              <div className="space-y-3">
                {nearbyPosts.map((nearbyPost) => {
                  const distanceMiles = Math.round(nearbyPost.distance_meters / 1609.34)
                  const typeLabel = nearbyPost.incident_type.replace(/_/g, ' ')
                  const location = [nearbyPost.city, nearbyPost.state].filter(Boolean).join(', ')

                  return (
                    <Link
                      key={nearbyPost.id}
                      href={`/post/${nearbyPost.id}`}
                      className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/50 text-blue-300 capitalize">
                              {typeLabel}
                            </span>
                            <span className="text-xs text-gray-500">
                              {distanceMiles} mi away
                            </span>
                          </div>
                          <p className="text-white text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors">
                            {nearbyPost.summary}
                          </p>
                          {location && (
                            <p className="text-gray-500 text-xs mt-1">{location}</p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
