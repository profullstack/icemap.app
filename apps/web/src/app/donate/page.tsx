import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import DonateForm from '@/components/DonateForm'

export const metadata: Metadata = {
  title: 'Donate - icemap',
  description: 'Support icemap.app with a cryptocurrency donation. Help us keep the platform free and open source.',
}

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Support icemap</h1>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              Help us keep icemap free, open source, and accessible to everyone.
              Your donation directly supports server costs and development.
            </p>
          </div>

          {/* Donation Form */}
          <DonateForm />

          {/* Info section */}
          <div className="mt-12 space-y-6">
            <div className="glass rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure & Anonymous
              </h3>
              <p className="text-gray-400 text-sm">
                Payments are processed securely through CoinPayPortal. We don&apos;t collect any personal
                information with your donation.
              </p>
            </div>

            <div className="glass rounded-xl p-6 border border-white/10">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Open Source
              </h3>
              <p className="text-gray-400 text-sm">
                icemap is 100% open source. Your donations help us maintain the infrastructure
                and continue developing new features for the community.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
