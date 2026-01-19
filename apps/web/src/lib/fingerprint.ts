import { createHash } from 'crypto'
import { headers } from 'next/headers'

/**
 * Generates an anonymous fingerprint from request headers.
 * Combines IP, User-Agent, and Accept-Language for consistent identification.
 * Used for rate limiting and anonymous user tracking.
 */
export async function getFingerprint(): Promise<string> {
  const headersList = await headers()

  // Get IP from various headers (Railway/proxies use X-Forwarded-For)
  const forwardedFor = headersList.get('x-forwarded-for')
  const realIp = headersList.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

  // Get User-Agent
  const userAgent = headersList.get('user-agent') || 'unknown'

  // Get Accept-Language
  const acceptLanguage = headersList.get('accept-language') || 'unknown'

  // Create fingerprint by hashing combined values
  const data = `${ip}|${userAgent}|${acceptLanguage}`
  const hash = createHash('sha256').update(data).digest('hex')

  return hash
}

/**
 * Generates a shorter fingerprint for display purposes (first 12 chars)
 */
export function shortenFingerprint(fingerprint: string): string {
  return fingerprint.slice(0, 12)
}
