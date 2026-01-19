import type { Metadata } from 'next'
import Link from 'next/link'
import PostDetail from '@/components/PostDetail'
import Footer from '@/components/Footer'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Post - icemap',
  description: 'View incident report details on icemap.',
}

export default async function PostPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to map
          </Link>
        </div>
        <PostDetail postId={id} />
      </div>
      <Footer />
    </div>
  )
}
