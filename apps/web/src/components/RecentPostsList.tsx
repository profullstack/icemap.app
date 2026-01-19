'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/types'
import { track } from '@/lib/analytics'

export default function RecentPostsList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  async function fetchRecentPosts() {
    try {
      const res = await fetch('/api/posts/recent')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
        track('recent_posts_view', { count: data.posts.length })
      } else {
        setError('Failed to load posts')
      }
    } catch {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">{error}</p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <svg
          className="w-16 h-16 text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-xl font-medium text-white mb-2">No recent posts</h2>
        <p className="text-gray-400 mb-6">
          Be the first to report an incident in your area.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
        >
          Open Map
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="block glass rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white capitalize mb-2">
                  {post.incident_type.replace(/_/g, ' ')}
                </span>
                <p className="text-white line-clamp-2">{post.summary}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {post.city && `${post.city}, `}
                  {post.state}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500 flex-shrink-0">
                <p>{getTimeAgo(new Date(post.created_at))}</p>
                <p className="text-yellow-500">
                  Expires {getTimeUntil(new Date(post.expires_at))}
                </p>
              </div>
            </div>
          </Link>
        ))}
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

function getTimeUntil(date: Date): string {
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000)
  if (seconds < 60) return 'soon'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `in ${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `in ${hours}h`
}
