'use client'

import { use } from 'react'
import PostDetailPage from '@/components/PostDetailPage'

interface Props {
  params: Promise<{ id: string }>
}

export default function PostPage({ params }: Props) {
  const { id } = use(params)

  return <PostDetailPage postId={id} />
}
