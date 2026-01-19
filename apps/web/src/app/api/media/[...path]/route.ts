import { NextRequest, NextResponse } from 'next/server'

// GET /api/media/[...path] - Proxy media files from Supabase storage
// Supports HTTP Range requests for Safari video playback
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const storagePath = path.join('/')

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 500 })
  }

  // Construct the Supabase storage URL
  const storageUrl = `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`

  try {
    // Forward range header if present (required for Safari video)
    const rangeHeader = request.headers.get('range')
    const fetchHeaders: HeadersInit = {}
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader
    }

    const response = await fetch(storageUrl, { headers: fetchHeaders })

    if (!response.ok && response.status !== 206) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentLength = response.headers.get('content-length')
    const contentRange = response.headers.get('content-range')
    const acceptRanges = response.headers.get('accept-ranges')
    const data = await response.arrayBuffer()

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Accept-Ranges': acceptRanges || 'bytes',
    }

    if (contentLength) {
      headers['Content-Length'] = contentLength
    }
    if (contentRange) {
      headers['Content-Range'] = contentRange
    }

    // Return 206 for partial content, 200 for full content
    return new NextResponse(data, {
      status: response.status === 206 ? 206 : 200,
      headers,
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
