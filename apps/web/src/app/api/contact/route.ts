import { NextRequest, NextResponse } from 'next/server'

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
  sendContactEmail(name.trim(), email.trim(), subject, message.trim()).catch(console.error)

  return NextResponse.json({ success: true }, { status: 200 })
}

async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
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

    await transporter.sendMail({
      from: smtpFrom || smtpUser,
      to: adminEmail,
      replyTo: email,
      subject: `[icemap Contact] ${subjectLabel}: ${truncatedMessage}`,
      text: `
New contact form submission from icemap.

From: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}
      `.trim(),
      html: `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6366f1;">New Contact Form Submission</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 8px 0; color: #6b7280; width: 100px;"><strong>From:</strong></td>
      <td style="padding: 8px 0; color: #1f2937;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
      <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #6366f1;">${email}</a></td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td>
      <td style="padding: 8px 0; color: #1f2937;">${subjectLabel}</td>
    </tr>
  </table>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
  <div style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap; color: #1f2937;">${message}</div>
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
