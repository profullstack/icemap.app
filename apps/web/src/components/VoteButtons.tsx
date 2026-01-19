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
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`group relative p-2.5 rounded-xl transition-all duration-200 ${
          userVote === 1
            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30'
        }`}
        aria-label="Upvote"
      >
        <svg className={`w-5 h-5 transition-transform ${userVote !== 1 ? 'group-hover:-translate-y-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <div className={`min-w-[3rem] py-2 px-3 rounded-xl text-center font-bold text-lg transition-colors ${
        voteCount > 0
          ? 'text-emerald-400 bg-emerald-500/10'
          : voteCount < 0
            ? 'text-rose-400 bg-rose-500/10'
            : 'text-gray-400 bg-white/5'
      }`}>
        {voteCount > 0 ? '+' : ''}{voteCount}
      </div>

      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`group relative p-2.5 rounded-xl transition-all duration-200 ${
          userVote === -1
            ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25'
            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30'
        }`}
        aria-label="Downvote"
      >
        <svg className={`w-5 h-5 transition-transform ${userVote !== -1 ? 'group-hover:translate-y-0.5' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}
