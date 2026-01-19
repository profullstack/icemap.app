import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service - icemap',
  description: 'Terms of service for icemap, the anonymous incident reporting platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-500 mb-8">Last updated: January 2025</p>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Acceptance of Terms</h2>
              <p className="text-gray-300">
                By using icemap, you agree to these terms of service. If you do not agree
                to these terms, please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Service Description</h2>
              <p className="text-gray-300">
                icemap is a free, anonymous incident reporting platform. Users can report
                incidents, view reports from others, and interact through votes and comments.
                All posts automatically expire and are deleted after 8 hours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">User Conduct</h2>
              <p className="text-gray-300 mb-3">You agree not to use icemap to:</p>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Post false, misleading, or malicious reports</li>
                <li>Harass, threaten, or harm others</li>
                <li>Post illegal content or content that violates others&apos; rights</li>
                <li>Attempt to identify or dox other users</li>
                <li>Spam or flood the service with automated posts</li>
                <li>Attempt to circumvent rate limits or security measures</li>
                <li>Upload malware or malicious files</li>
                <li>Use the service for any illegal purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Content Guidelines</h2>
              <p className="text-gray-300 mb-3">Posts should:</p>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Be truthful and accurate to the best of your knowledge</li>
                <li>Report genuine incidents or events</li>
                <li>Respect the privacy of individuals (avoid showing faces or identifying information)</li>
                <li>Not contain explicit violence, gore, or adult content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Reporting and Moderation</h2>
              <p className="text-gray-300">
                Users can report posts that violate these terms. We reserve the right to
                remove any content and ban users (via fingerprint) who violate these terms.
                Decisions are final.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Intellectual Property</h2>
              <p className="text-gray-300">
                By posting content on icemap, you grant us a non-exclusive, royalty-free
                license to display and distribute that content through the service. You
                retain ownership of your content. Content is automatically deleted after 8 hours.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Disclaimer</h2>
              <p className="text-gray-300">
                icemap is provided &quot;as is&quot; without warranties of any kind. We do not
                guarantee the accuracy, completeness, or reliability of any content posted
                by users. We are not responsible for any actions taken based on information
                found on icemap.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Limitation of Liability</h2>
              <p className="text-gray-300">
                To the maximum extent permitted by law, icemap and its operators shall not
                be liable for any indirect, incidental, special, consequential, or punitive
                damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Service Availability</h2>
              <p className="text-gray-300">
                We strive to maintain service availability but do not guarantee uninterrupted
                access. We may modify, suspend, or discontinue the service at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Changes to Terms</h2>
              <p className="text-gray-300">
                We may update these terms at any time. Continued use of the service after
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
              <p className="text-gray-300">
                For questions about these terms, please open an issue on our{' '}
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
