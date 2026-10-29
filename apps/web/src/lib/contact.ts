import { createContactForm, withQuestions } from '@profullstack/contact-form'

/**
 * The contact form: /contact renders it and /api/contact answers it, both
 * from this one object, so the token binding, the honeypot and the
 * questions can never disagree.
 *
 * Delivery is the SMTP relay the site already uses (SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASSWORD, SMTP_FROM) to ADMIN_EMAIL. As before, the sender
 * is told the message arrived even when SMTP is unconfigured or fails; the
 * failure is logged. The token secret is FORM_GUARD_SECRET, else
 * SMTP_PASSWORD (as before), else RESEND_API_KEY.
 */

// Read at runtime: Next.js inlines a literal process.env.NAME at build time.
const env = (name: string): string | undefined => process.env[String(name)] || undefined

export const SUBJECT_LABELS: Record<string, string> = {
  bug: 'Bug Report',
  question: 'Question',
  feedback: 'Feedback',
  other: 'Other',
}

const secret = env('FORM_GUARD_SECRET') ?? env('SMTP_PASSWORD')

export const contact = createContactForm({
  binding: 'icemap:contact',
  brandTerms: ['icemap'],
  // No FORM_GUARD_SECRET or SMTP_PASSWORD: the module falls back to RESEND_API_KEY.
  guard: secret ? { secret } : undefined,
  to: env('ADMIN_EMAIL') ?? 'admin@icemap.app',
  from: env('SMTP_FROM') ?? env('SMTP_USER'),
  subject: (s) => {
    const label = SUBJECT_LABELS[s.values?.subject ?? ''] ?? s.values?.subject ?? ''
    const short = s.message.length > 50 ? `${s.message.substring(0, 50)}...` : s.message
    return `[icemap Contact] ${label}: ${short}`
  },
  send: async (mail) => {
    const host = env('SMTP_HOST')
    const user = env('SMTP_USER')
    const pass = env('SMTP_PASSWORD')
    if (!env('ADMIN_EMAIL') || !host || !user || !pass) {
      console.log('SMTP not configured, skipping contact email')
      return { sent: false, error: 'SMTP not configured' }
    }
    try {
      const nodemailer = await import('nodemailer')
      const port = env('SMTP_PORT')
      const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port || '587', 10),
        secure: port === '465',
        auth: { user, pass },
      })
      const info = await transporter.sendMail({
        from: mail.from || user,
        to: mail.to,
        replyTo: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      })
      return { sent: true, id: info.messageId }
    } catch (error) {
      return { sent: false, error: error instanceof Error ? error.message : String(error) }
    }
  },
  onSendError: 'ignore',
  questions: withQuestions({
    override: {
      name: {
        label: 'Name',
        placeholder: 'Your name',
        maxLength: 100,
        minLength: 2,
      },
      email: { label: 'Email', placeholder: 'your@email.com' },
      message: {
        label: 'Message',
        placeholder: 'How can we help?',
        rows: 6,
        maxLength: 2000,
        minLength: 10,
        help: 'Up to 2000 characters',
      },
    },
    add: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'select',
        required: true,
        options: Object.entries(SUBJECT_LABELS).map(([value, label]) => ({ value, label })),
      },
    ],
  }),
  submitLabel: 'Send Message',
  successMessage: "Message Sent! Thank you for reaching out. We'll get back to you as soon as possible.",
  responses: {
    limited: {
      body: { error: 'Too many messages from this connection. Please try again later.' },
      status: 429,
    },
    retry: {
      body: { error: 'That took too long, or came through too quickly. Please send it again.' },
      status: 400,
    },
  },
})
