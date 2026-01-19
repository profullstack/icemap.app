'use client'

import { useState, useRef } from 'react'
import { INCIDENT_TYPES } from '@/types'
import { track, events } from '@/lib/analytics'

interface Props {
  lat: number
  lng: number
  onClose: () => void
  onSuccess: (postId: string) => void
}

interface UploadedMedia {
  id: string
  url: string
  media_type: 'image' | 'video'
}

export default function CreatePostForm({ lat, lng, onClose, onSuccess }: Props) {
  const [summary, setSummary] = useState('')
  const [incidentType, setIncidentType] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [crossStreet, setCrossStreet] = useState('')
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (media.length + files.length > 5) {
      setError('Maximum 5 media files allowed')
      return
    }

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      try {
        track(events.MEDIA_UPLOAD_START, { file_type: file.type })
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          track(events.MEDIA_UPLOAD_SUCCESS, { media_type: data.media_type })
          setMedia((prev) => [...prev, data])
        } else {
          const data = await res.json()
          track(events.MEDIA_UPLOAD_ERROR, { error: data.error })
          setError(data.error || 'Failed to upload file')
        }
      } catch {
        track(events.MEDIA_UPLOAD_ERROR, { error: 'network_error' })
        setError('Failed to upload file')
      }
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function removeMedia(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!summary.trim() || !incidentType || submitting) return

    setSubmitting(true)
    setError(null)
    track(events.POST_CREATE_SUBMIT, { incident_type: incidentType, has_media: media.length > 0 })

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat,
          lng,
          summary: summary.trim(),
          incident_type: incidentType,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          cross_street: crossStreet.trim() || undefined,
          media_ids: media.map((m) => m.id),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        track(events.POST_CREATE_SUCCESS, { post_id: data.id, incident_type: incidentType })
        onSuccess(data.id)
      } else {
        const data = await res.json()
        track(events.POST_CREATE_ERROR, { error: data.error })
        setError(data.error || 'Failed to create post')
      }
    } catch {
      track(events.POST_CREATE_ERROR, { error: 'network_error' })
      setError('Failed to create post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-gray-800 w-full sm:max-w-lg sm:rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Report Incident</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Location info */}
          <div className="text-sm text-gray-400">
            Location: {lat.toFixed(5)}, {lng.toFixed(5)}
          </div>

          {/* Incident Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Incident Type *
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type...</option>
              {INCIDENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="What's happening?"
              rows={4}
              maxLength={500}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-gray-500 text-xs mt-1">{summary.length}/500</p>
          </div>

          {/* Location details (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cross Street / Landmark
            </label>
            <input
              type="text"
              value={crossStreet}
              onChange={(e) => setCrossStreet(e.target.value)}
              placeholder="e.g., Near Main St & Oak Ave"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Media upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Photos / Videos (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || media.length >= 5}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 border-dashed rounded-lg text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Add Photos/Videos'}
            </button>
            {media.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {media.map((m) => (
                  <div key={m.id} className="relative">
                    {m.media_type === 'image' ? (
                      <img src={m.url} alt="" className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-gray-500 text-xs mt-1">{media.length}/5 files</p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !summary.trim() || !incidentType}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Report'}
          </button>

          <p className="text-gray-500 text-xs text-center">
            Posts are anonymous and auto-delete after 8 hours
          </p>
        </form>
      </div>
    </div>
  )
}
