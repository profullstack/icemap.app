'use client'

import { useState } from 'react'
import { track, events } from '@/lib/analytics'

interface Props {
  postId: string
}

export default function ReportButton({ postId }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleOpenModal() {
    track(events.REPORT_OPEN, { post_id: postId })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim() || loading) return

    track(events.REPORT_SUBMIT, { post_id: postId })
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      })

      if (res.ok) {
        track(events.REPORT_SUCCESS, { post_id: postId })
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit report')
      }
    } catch {
      setError('Failed to submit report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        aria-label="Report post"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <span className="text-sm">Report</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            {submitted ? (
              <div className="text-center">
                <svg
                  className="w-12 h-12 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">Report Submitted</h3>
                <p className="text-gray-400 mb-4">Thank you for helping keep icemap safe.</p>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSubmitted(false)
                    setReason('')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-medium text-white mb-4">Report Post</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Please describe why you&apos;re reporting this post. Our team will review it.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for reporting..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                />
                <p className="text-gray-500 text-xs mt-1 mb-4">{reason.length}/500 characters</p>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !reason.trim()}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
