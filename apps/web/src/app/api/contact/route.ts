import { NextRequest, NextResponse } from 'next/server'
import { provenanceBlock, type Verdict } from '@profullstack/form-guard'
import { contactGuard } from '@/lib/contact-guard'

/**
 * User input is interpolated into the notification email's HTML. Without
 * escaping, a submitter can inject markup into the mail we read.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const SUBJECT_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  question: 'Question',
  feedback: 'Feedback',
  other: 'Other',
}

// POST /api/contact - Send contact form email
export async function POST(request: NextRequest) {
  let body: { name: string; email: string; subject: string; message: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, email, subject, message } = body

  // Spam checks run before validation on purpose: a bot that gets
  // "Name must be at least 2 characters" back has learned what to send
  // next time, where one that gets a plain success has learned nothing.
  let verdict: Verdict | null = null
  if (contactGuard) {
    verdict = await contactGuard.check({
      fields: body as unknown as Record<string, unknown>,
      headers: request.headers,
    })
    if (!verdict.allow) {
      if (verdict.action === 'drop') {
        console.warn(`contact: dropped submission (${verdict.reason}) ip=${verdict.ip ?? '?'}`)
        return NextResponse.json({ success: true }, { status: 200 })
      }
      if (verdict.action === 'limited') {
        return NextResponse.json(
          { error: 'Too many messages from this connection. Please try again later.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'That took too long, or came through too quickly. Please send it again.' },
        { status: 400 }
      )
    }
  }

  // Validate name
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 })
  }
  if (name.length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Validate subject
  if (!subject || !SUBJECT_LABELS[subject]) {
    return NextResponse.json({ error: 'Please select a valid subject' }, { status: 400 })
  }

  // Validate message
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 })
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Message must be 2000 characters or less' }, { status: 400 })
  }

  // Send email (async, don't wait)
  sendContactEmail(name.trim(), email.trim(), subject, message.trim(), verdict).catch(
    console.error
  )

  return NextResponse.json({ success: true }, { status: 200 })
}

async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  verdict: Verdict | null
) {
  const adminEmail = process.env.ADMIN_EMAIL
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const smtpFrom = process.env.SMTP_FROM

  if (!adminEmail || !smtpHost || !smtpUser || !smtpPassword) {
    console.log('SMTP not configured, skipping contact email')
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

    const subjectLabel = SUBJECT_LABELS[subject] || subject
    const truncatedMessage = message.length > 50 ? message.substring(0, 50) + '...' : message
    // A flagged message still arrives; the tag is only so an inbox rule
    // can sort it. Scoring never drops anything.
    const spamTag = verdict?.suspicious ? ` [spam? ${verdict.score}]` : ''
    // Where it came from and why it scored as it did. None of this is in
    // the headers: the notification is sent by us to us, so it
    // authenticates identically whoever filled the form in.
    const provenance = verdict
      ? `\n\n${provenanceBlock({ ip: verdict.ip, userAgent: verdict.userAgent, verdict })}`
      : ''

    await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to: adminEmail,
      replyTo: email,
      subject: `[icemap Contact] ${subjectLabel}: ${truncatedMessage}${spamTag}`,
      text: `
New contact form submission from icemap.

From: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}${provenance}
      `.trim(),
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6366f1;">New Contact Form Submission</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; color: #6b7280; width: 100px;"><strong>From:</strong></td>
      <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(name)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
      <td style="padding: 8px 0;"><a href="mailto:${encodeURIComponent(email)}" style="color: #6366f1;">${escapeHtml(email)}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td>
      <td style="padding: 8px 0; color: #1f2937;">${escapeHtml(subjectLabel)}</td>
    </tr>
  </table>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
  <div style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #1f2937;">${escapeHtml(message)}</div>
  ${provenance ? `<pre style="font: 12px/1.5 monospace; color: #9ca3af;">${escapeHtml(provenance.trim())}</pre>` : ''}
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <p style="color: #9ca3af; font-size: 12px;">
    This message was sent from the icemap contact form. Reply directly to respond to the sender.
  </p>
</div>
      `.trim(),
    })
  } catch (error) {
    console.error('Failed to send contact email:', error)
  }
}
