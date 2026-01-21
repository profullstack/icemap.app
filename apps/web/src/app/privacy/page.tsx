import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy - icemap',
  description: 'Privacy policy for icemap, the anonymous incident reporting platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
              <p className="text-gray-300">
                icemap is designed with privacy as a core principle. We collect minimal data
                and do not require any personal information to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">What we collect</h2>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>
                  <strong>Anonymous fingerprint:</strong> A hashed combination of your IP address,
                  user agent, and browser language. This is used solely to track your votes and
                  favorites, and cannot be used to identify you personally.
                </li>
                <li>
                  <strong>Post content:</strong> The incident reports you submit, including
                  descriptions, locations, and any media you upload.
                </li>
                <li>
                  <strong>Interaction data:</strong> Your votes, favorites, and comments on posts.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">What we don&apos;t collect</h2>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Email addresses</li>
                <li>Names or usernames</li>
                <li>Phone numbers</li>
                <li>Payment information</li>
                <li>Precise device identifiers</li>
                <li>Browsing history outside of icemap</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Data retention</h2>
              <p className="text-gray-300">
                All posts and associated media are automatically deleted after 7 days.
                Your anonymous fingerprint and interaction data (votes, favorites) are retained
                only as long as the associated posts exist.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Cookies</h2>
              <p className="text-gray-300">
                We do not use cookies for tracking. We may use essential cookies for
                service functionality only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Analytics</h2>
              <p className="text-gray-300">
                We use privacy-focused analytics (Datafast) to understand how the service is used.
                This data is aggregated and cannot be used to identify individual users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Third parties</h2>
              <p className="text-gray-300">
                We do not sell, trade, or transfer your data to third parties. Media files
                are stored securely on our infrastructure and are deleted along with the
                associated posts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Your rights</h2>
              <p className="text-gray-300">
                Since we don&apos;t collect personal information, there is no personal data to
                access, modify, or delete. Posts automatically expire after 7 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Changes to this policy</h2>
              <p className="text-gray-300">
                We may update this privacy policy from time to time. Changes will be posted
                on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
              <p className="text-gray-300">
                For privacy-related questions, please open an issue on our{' '}
                <a
                  href="https://github.com/profullstack/icemap.app/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  GitHub repository
                </a>.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
