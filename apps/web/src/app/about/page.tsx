import type { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About - icemap',
  description: 'Learn about icemap, the anonymous real-time incident reporting platform.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-14 flex flex-col">
      <div className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-6">About icemap</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 text-lg mb-6">
            icemap is an anonymous, real-time incident reporting platform that helps communities
            stay informed about what&apos;s happening around them.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">How it works</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">1.</span>
              <span>Tap anywhere on the map to report an incident at that location</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">2.</span>
              <span>Select the incident type, add a description, and optionally attach photos or videos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">3.</span>
              <span>Your report appears on the map for others to see</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 mt-1">4.</span>
              <span>Community members can upvote, downvote, and comment on reports</span>
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Privacy first</h2>
          <p className="text-gray-300 mb-4">
            We believe in protecting your privacy. icemap is designed with anonymity at its core:
          </p>
          <ul className="space-y-2 text-gray-300 list-disc list-inside">
            <li>No account or login required</li>
            <li>No personal information collected</li>
            <li>Posts automatically delete after 7 days</li>
            <li>Your identity is protected by a randomized fingerprint</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Open source</h2>
          <p className="text-gray-300 mb-4">
            icemap is fully open source. You can view the code, contribute, or run your own instance.
          </p>
          <a
            href="https://github.com/profullstack/icemap.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            View on GitHub
          </a>

          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact</h2>
          <p className="text-gray-300">
            For questions, feedback, or to report issues, please open an issue on our{' '}
            <a
              href="https://github.com/profullstack/icemap.app/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              GitHub repository
            </a>.
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  )
}
