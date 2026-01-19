'use client'

import { useState } from 'react'
import { track, events } from '@/lib/analytics'

interface Props {
  postId: string
  voteCount: number
  userVote: 1 | -1 | null
  onVoteChange: (newCount: number, newVote: 1 | -1 | null) => void
}

export default function VoteButtons({ postId, voteCount, userVote, onVoteChange }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleVote(voteType: 1 | -1) {
    if (loading) return

    setLoading(true)
    try {
      // If clicking the same vote, remove it
      const newVoteType = userVote === voteType ? 0 : voteType

      // Track the vote action
      if (newVoteType === 0) {
        track(events.VOTE_REMOVE, { post_id: postId })
      } else if (newVoteType === 1) {
        track(events.VOTE_UP, { post_id: postId })
      } else {
        track(events.VOTE_DOWN, { post_id: postId })
      }

      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: newVoteType }),
      })

      if (res.ok) {
        const data = await res.json()
        onVoteChange(data.vote_count, newVoteType === 0 ? null : newVoteType)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors ${
          userVote === 1
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        aria-label="Upvote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <span className={`min-w-[2rem] text-center font-medium ${
        voteCount > 0 ? 'text-green-400' : voteCount < 0 ? 'text-red-400' : 'text-gray-400'
      }`}>
        {voteCount}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors ${
          userVote === -1
            ? 'bg-red-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        aria-label="Downvote"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
