'use client'

import { useState } from 'react'
import type { Media } from '@/types'
import { track, events } from '@/lib/analytics'

interface Props {
  media: Media[]
}

export default function MediaGallery({ media }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (media.length === 0) return null

  const getMediaUrl = (m: Media) => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    return `${baseUrl}/storage/v1/object/public/media/${m.storage_path}`
  }

  return (
    <>
      {/* Thumbnail grid */}
      <div className={`grid gap-2 ${
        media.length === 1 ? 'grid-cols-1' :
        media.length === 2 ? 'grid-cols-2' :
        'grid-cols-3'
      }`}>
        {media.map((m, index) => (
          <button
            key={m.id}
            onClick={() => {
              track(events.MEDIA_GALLERY_OPEN, { media_type: m.media_type, index })
              setSelectedIndex(index)
            }}
            className="relative aspect-video bg-gray-700 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            {m.media_type === 'image' ? (
              <img
                src={getMediaUrl(m)}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full">
                <video
                  src={getMediaUrl(m)}
                  className="w-full h-full object-cover"
                  muted
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[2000] bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((selectedIndex - 1 + media.length) % media.length)
                }}
                className="absolute left-4 p-2 text-white hover:text-gray-300"
                aria-label="Previous"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((selectedIndex + 1) % media.length)
                }}
                className="absolute right-4 p-2 text-white hover:text-gray-300"
                aria-label="Next"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Content */}
          <div
            className="max-w-4xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {media[selectedIndex].media_type === 'image' ? (
              <img
                src={getMediaUrl(media[selectedIndex])}
                alt=""
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={getMediaUrl(media[selectedIndex])}
                className="max-w-full max-h-[90vh]"
                controls
                autoPlay
              />
            )}
          </div>

          {/* Counter */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
              {selectedIndex + 1} / {media.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}
