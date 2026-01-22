import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      id: session.id,
      email: session.email,
      is_admin: session.is_admin,
    },
  })
}
