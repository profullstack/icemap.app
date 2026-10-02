/**
 * Where a www. request should go: the apex on https, same path and query.
 *
 * Built from the public host (x-forwarded-host first, then Host) with any port
 * dropped. Cloning request.nextUrl and setting .host keeps the port the
 * standalone server listens on, which is how www.icemap.app used to redirect
 * to https://icemap.app:8080/. Returns null when the host is not www.
 */
export function wwwRedirectLocation(headers: Headers, pathname: string, search: string): string | null {
  const raw = headers.get('x-forwarded-host') || headers.get('host') || ''
  const host = (raw.split(',')[0] ?? '').trim().toLowerCase().replace(/:\d+$/, '')
  if (!host.startsWith('www.') || host.length <= 4) return null
  return `https://${host.slice(4)}${pathname}${search}`
}
