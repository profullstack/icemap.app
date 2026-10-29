'use client'

import { ContactForm as Form } from '@profullstack/contact-form/react'
import type { ContactFormProps } from '@profullstack/contact-form'
import { track, events } from '@/lib/analytics'

/**
 * The contact form (@profullstack/contact-form) with the site's analytics.
 * The props come from contact.props() on the server: the token is minted
 * there, at render time. The cf-* classes are styled in globals.css.
 */
export default function ContactForm({ form }: { form: ContactFormProps }) {
  return (
    <div
      onSubmitCapture={(e) => {
        const subject = new FormData(e.target as HTMLFormElement).get('subject')
        track(events.CONTACT_SUBMIT, { subject: typeof subject === 'string' ? subject : '' })
      }}
    >
      <Form
        {...form}
        className="glass rounded-2xl p-8 border border-white/10"
        onSent={(body) => track(events.CONTACT_SUCCESS, { subject: body.subject ?? '' })}
      />
    </div>
  )
}
