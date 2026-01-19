'use client'

import { useState } from 'react'
import { track, events } from '@/lib/analytics'

interface Props {
  postId: string
  isFavorited: boolean
  onFavoriteChange: (isFavorited: boolean) => void
}

export default function FavoriteButton({ postId, isFavorited, onFavoriteChange }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (loading) return

    // Track the action
    track(isFavorited ? events.FAVORITE_REMOVE : events.FAVORITE_ADD, { post_id: postId })

    setLoading(true)
    try {
      const method = isFavorited ? 'DELETE' : 'POST'
      const res = await fetch(`/api/posts/${postId}/favorite`, { method })

      if (res.ok) {
        onFavoriteChange(!isFavorited)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
        isFavorited
          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-amber-400 border border-white/10 hover:border-amber-500/30'
      }`}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`w-5 h-5 transition-transform ${!isFavorited ? 'group-hover:scale-110' : ''}`}
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
      <span className="text-sm font-medium">{isFavorited ? 'Saved' : 'Save'}</span>
    </button>
  )
}
