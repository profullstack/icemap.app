import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { wwwRedirectLocation } from './lib/www-redirect'

export function middleware(request: NextRequest) {
  // Redirect www to non-www, built from the public host (never the server port)
  const location = wwwRedirectLocation(request.headers, request.nextUrl.pathname, request.nextUrl.search)
  if (location) {
    return NextResponse.redirect(location, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that shouldn't redirect
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
}
