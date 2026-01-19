import type { Metadata } from 'next'
import FavoritesList from '@/components/FavoritesList'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Saved Posts - icemap',
  description: 'Your saved incident reports on icemap.',
}

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-6">Saved Posts</h1>
        </div>
        <FavoritesList />
      </div>
      <Footer />
    </div>
  )
}
