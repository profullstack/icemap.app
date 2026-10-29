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
    <Form
      {...form}
      className="glass rounded-2xl p-8 border border-white/10"
      resetLabel="Send Another Message"
      onSubmit={(body) => {
        track(events.CONTACT_SUBMIT, { subject: body.subject ?? '' })
        return undefined
      }}
      onSent={(body) => track(events.CONTACT_SUCCESS, { subject: body.subject ?? '' })}
      onError={(message) => track(events.CONTACT_ERROR, { error: message })}
    />
  )
}
