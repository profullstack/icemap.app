import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getFingerprint } from '@/lib/fingerprint'

// POST /api/posts/[id]/report - Report a post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const fingerprint = await getFingerprint()

  let body: { reason: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { reason } = body

  if (!reason || reason.trim().length === 0) {
    return NextResponse.json({ error: 'Report reason is required' }, { status: 400 })
  }

  if (reason.length > 500) {
    return NextResponse.json(
      { error: 'Reason must be 500 characters or less' },
      { status: 400 }
    )
  }

  // Verify post exists
  const { data: post } = await supabase
    .from('posts')
    .select('id, summary, incident_type')
    .eq('id', id)
    .single()

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Check if user already reported this post
  const { data: existingReport } = await supabase
    .from('reports')
    .select('id')
    .eq('post_id', id)
    .eq('fingerprint', fingerprint)
    .single()

  if (existingReport) {
    return NextResponse.json(
      { error: 'You have already reported this post' },
      { status: 400 }
    )
  }

  // Create the report
  const { error } = await supabase
    .from('reports')
    .insert({
      post_id: id,
      fingerprint,
      reason: reason.trim(),
    })

  if (error) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 })
  }

  // Send email notification to admin (async, don't wait)
  sendReportEmail(id, post.summary, post.incident_type, reason).catch(console.error)

  return NextResponse.json({ success: true }, { status: 201 })
}

async function sendReportEmail(
  postId: string,
  summary: string,
  incidentType: string,
  reason: string
) {
  const adminEmail = process.env.ADMIN_EMAIL
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const smtpFrom = process.env.SMTP_FROM

  if (!adminEmail || !smtpHost || !smtpUser || !smtpPassword) {
    console.log('SMTP not configured, skipping report email')
    return
  }

  try {
    const nodemailer = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587', 10),
      secure: smtpPort === '465',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://icemap.app'

    await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to: adminEmail,
      subject: `[icemap] Post reported: ${incidentType}`,
      text: `
A post has been reported on icemap.

Post ID: ${postId}
Type: ${incidentType}
Summary: ${summary}

Report Reason: ${reason}

View post: ${appUrl}/post/${postId}
      `.trim(),
      html: `
<h2>A post has been reported on icemap</h2>
<p><strong>Post ID:</strong> ${postId}</p>
<p><strong>Type:</strong> ${incidentType}</p>
<p><strong>Summary:</strong> ${summary}</p>
<hr>
<p><strong>Report Reason:</strong> ${reason}</p>
<hr>
<p><a href="${appUrl}/post/${postId}">View post</a></p>
      `.trim(),
    })
  } catch (error) {
    console.error('Failed to send report email:', error)
  }
}
