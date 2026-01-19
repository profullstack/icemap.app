'use client'

import { useState } from 'react'
import { track, events } from '@/lib/analytics'

interface Props {
  postId: string
}

export default function ShareButton({ postId }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `${window.location.origin}/post/${postId}`

    track(events.SHARE_CLICK, { post_id: postId })

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Incident Report - icemap',
          url,
        })
        track(events.SHARE_SUCCESS, { post_id: postId, method: 'native' })
        return
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        if ((err as Error).name === 'AbortError') return
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      track(events.SHARE_SUCCESS, { post_id: postId, method: 'clipboard' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      track(events.SHARE_SUCCESS, { post_id: postId, method: 'fallback' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
      aria-label="Share post"
    >
      {copied ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm">Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="text-sm">Share</span>
        </>
      )}
    </button>
  )
}
