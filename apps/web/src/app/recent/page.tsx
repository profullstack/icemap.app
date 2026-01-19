import type { Metadata } from 'next'
import RecentPostsList from '@/components/RecentPostsList'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Recent Posts - icemap',
  description: 'Browse the most recent incident reports on icemap.',
}

export default function RecentPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white mb-2">Recent Posts</h1>
          <p className="text-gray-400 text-sm">Latest incident reports from the community</p>
        </div>
        <RecentPostsList />
      </div>
      <Footer />
    </div>
  )
}
