import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { contactGuard } from '@/lib/contact-guard'

export const metadata: Metadata = {
  title: 'Contact - icemap',
  description: 'Get in touch with the icemap team. Report bugs, ask questions, or share feedback.',
}

// The form carries a token minted at render time, so this page must not
// be cached — a stale page would hand every visitor the same dead token.
export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const token = contactGuard ? await contactGuard.issue() : null
  const guardFields = token ? contactGuard!.fields(token) : null

  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Contact Us</h1>
            <p className="text-gray-400">
              Have a question, found a bug, or want to share feedback? We&apos;d love to hear from you.
            </p>
          </div>

          <ContactForm
            token={token}
            tokenName={guardFields?.token.name ?? null}
            honeypotName={guardFields?.honeypot.name ?? null}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}
