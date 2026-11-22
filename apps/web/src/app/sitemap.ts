import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { siteUrl } from '@/lib/site-url'

// Built per request: posts expire, so the list must be current.
export const dynamic = 'force-dynamic'

const STATIC_PAGES = ['/', '/recent', '/about', '/donate', '/contact', '/privacy', '/terms']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const pages: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({ url: `${base}${p}` }))

  try {
    const { data } = await supabase
      .from('posts')
      .select('id, created_at')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5000)
    for (const post of data ?? []) {
      pages.push({ url: `${base}/post/${post.id}`, lastModified: new Date(post.created_at) })
    }
  } catch (err) {
    // The static pages are still a valid sitemap when the database is unreachable.
    console.error('sitemap: could not list posts', err)
  }

  return pages
}
