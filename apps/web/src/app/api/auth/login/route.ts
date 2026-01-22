import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { supabase } from '@/lib/supabase'
import { createToken, getAuthCookieOptions, AUTH_COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  let body: { email: string; password: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Fetch admin by email
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, email, password_hash, is_admin')
    .eq('email', email.toLowerCase())
    .single()

  if (error || !admin) {
    // Don't reveal whether email exists
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Verify password
  const validPassword = await bcrypt.compare(password, admin.password_hash)
  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Create JWT token
  const token = createToken({
    id: admin.id,
    email: admin.email,
    is_admin: admin.is_admin,
  })

  // Set cookie
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions = getAuthCookieOptions(isProduction)
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, cookieOptions)

  return NextResponse.json({
    success: true,
    user: {
      id: admin.id,
      email: admin.email,
      is_admin: admin.is_admin,
    },
  })
}
