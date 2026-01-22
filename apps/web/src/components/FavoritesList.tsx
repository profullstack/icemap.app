'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/types'
import { track, events } from '@/lib/analytics'
import { getTimeAgo, getTimeUntil } from '@/lib/time'

interface FavoriteWithPost {
  id: string
  created_at: string
  post: Post
}

export default function FavoritesList() {
  const [favorites, setFavorites] = useState<FavoriteWithPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites)
        track(events.FAVORITES_VIEW, { count: data.favorites.length })
      } else {
        setError('Failed to load favorites')
      }
    } catch {
      setError('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
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

  if (favorites.length === 0) {
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
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <h2 className="text-xl font-medium text-white mb-2">No saved posts</h2>
        <p className="text-gray-400 mb-6">
          Posts you save will appear here for easy access.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Explore Map
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-4">
        {favorites.map((favorite) => (
          <Link
            key={favorite.id}
            href={`/post/${favorite.post.id}`}
            className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-600 text-white capitalize mb-2">
                  {favorite.post.incident_type.replace(/_/g, ' ')}
                </span>
                <p className="text-white line-clamp-2">{favorite.post.summary}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {favorite.post.city && `${favorite.post.city}, `}
                  {favorite.post.state}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>{getTimeAgo(new Date(favorite.post.created_at))}</p>
                <p className="text-yellow-500">
                  Expires {getTimeUntil(new Date(favorite.post.expires_at))}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
