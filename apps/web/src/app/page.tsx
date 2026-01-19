'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  ),
})

export default function HomePage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <Map />
    </main>
  )
}
