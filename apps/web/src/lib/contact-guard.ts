import 'server-only'
import { createFormGuard } from '@profullstack/form-guard'

/**
 * Shared guard for the public contact form.
 *
 * The page that renders the form mints a token; the route that receives
 * it verifies one. Both import this instance, because a `binding` or
 * field-name mismatch between them would reject every real submission
 * without saying so.
 *
 * A honeypot alone would not help here: most contact-form spam POSTs
 * straight at /api/contact and never renders the page, so a hidden field
 * is simply absent from the body rather than filled. The token is the
 * part a request that skipped the page cannot produce.
 *
 * The secret never reaches the browser, only the signature does. It must
 * be identical across every instance serving the form, so it falls back
 * to SMTP_PASSWORD, which sending already cannot work without.
 */
const secret =
  process.env.FORM_GUARD_SECRET ?? process.env.SMTP_PASSWORD ?? ''

if (!secret) {
  // Without a secret there is nothing to sign with, so the form falls back
  // to being unprotected. That is survivable only because SMTP is equally
  // unconfigured in that case and nothing is being delivered anyway — but
  // it should never be true silently.
  console.warn(
    'contact-guard: no FORM_GUARD_SECRET or SMTP_PASSWORD set — the contact form is UNPROTECTED'
  )
}

export const contactGuard = secret
  ? createFormGuard({
      secret,
      binding: 'icemap:contact',
      brandTerms: ['icemap'],
      rateLimit: { max: 5, windowMs: 60 * 60 * 1000 },
      // Set FORM_GUARD_ENFORCE=0 to score without blocking, if a real
      // sender ever reports being turned away.
      requireToken: process.env.FORM_GUARD_ENFORCE !== '0',
    })
  : null
