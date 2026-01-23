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
  const [links, setLinks] = useState<string[]>([''])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function updateLink(index: number, value: string) {
    setLinks(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function addLink() {
    if (links.length < 3) {
      setLinks(prev => [...prev, ''])
    }
  }

  function removeLink(index: number) {
    setLinks(prev => prev.filter((_, i) => i !== index))
  }

  function isValidUrl(url: string): boolean {
    if (!url.trim()) return true // Empty is OK
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

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

    // Validate URLs
    const validLinks = links.filter(l => l.trim()).map(l => l.trim())
    for (const link of validLinks) {
      if (!isValidUrl(link)) {
        setError('Please enter valid URLs for all links')
        return
      }
    }

    setSubmitting(true)
    setError(null)
    track(events.POST_CREATE_SUBMIT, { incident_type: incidentType, has_media: media.length > 0, has_links: validLinks.length > 0 })

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
          links: validLinks.length > 0 ? validLinks.map(url => ({ url })) : undefined,
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
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="relative w-full sm:max-w-lg">
        {/* Decorative gradient blur */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20" />

        <div className="relative glass rounded-2xl max-h-[85vh] overflow-y-auto border border-white/10">
          {/* Header */}
          <div className="sticky top-0 glass border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Report Incident</h2>
                <p className="text-xs text-gray-400">Share what&apos;s happening</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Location info */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-300">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
            </div>

            {/* Incident Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Incident Type <span className="text-indigo-400">*</span>
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
              >
                <option value="" className="bg-gray-900">Select type...</option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description <span className="text-indigo-400">*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="What's happening?"
                rows={4}
                maxLength={500}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-gray-500 text-xs">{summary.length}/500 characters</p>
              </div>
            </div>

            {/* Location details (optional) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cross Street / Landmark</label>
              <input
                type="text"
                value={crossStreet}
                onChange={(e) => setCrossStreet(e.target.value)}
                placeholder="e.g., Near Main St & Oak Ave"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {/* Media upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photos / Videos</label>
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
                className="w-full px-4 py-4 bg-white/5 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-indigo-500/50 hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add Photos/Videos
                  </>
                )}
              </button>
              {media.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {media.map((m) => (
                    <div key={m.id} className="relative group">
                      {m.media_type === 'image' ? (
                        <img src={m.url} alt="" className="w-20 h-20 object-cover rounded-xl border border-white/10" />
                      ) : (
                        <div className="w-20 h-20 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(m.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-gray-500 text-xs mt-2">{media.length}/5 files</p>
            </div>

            {/* Links section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  News / Social Links
                </div>
              </label>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      placeholder="https://twitter.com/... or news article URL"
                      className={`flex-1 px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all ${
                        link && !isValidUrl(link) ? 'border-rose-500/50' : 'border-white/10'
                      }`}
                    />
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="p-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all"
                        aria-label="Remove link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {links.length < 3 && (
                <button
                  type="button"
                  onClick={addLink}
                  className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add another link
                </button>
              )}
              <p className="text-gray-500 text-xs mt-2">Add news articles or social media posts ({links.filter(l => l.trim()).length}/3)</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !summary.trim() || !incidentType}
              className="relative w-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {submitting ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Posting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Post Report
                  </>
                )}
              </div>
            </button>

            <p className="text-gray-500 text-xs text-center flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Anonymous · Auto-deletes after 7 days
            </p>
            <p className="text-gray-600 text-xs text-center mt-1">
              Spam will be removed. Repeat offenders may be banned.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
