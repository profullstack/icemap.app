'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { track, events } from '@/lib/analytics'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    setIsIOS(ios)

    // Listen for install prompt (Chrome, Edge, etc.)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null)
      setIsStandalone(true)
      track(events.PWA_INSTALLED)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  async function handleInstall() {
    if (isIOS) {
      setShowIOSModal(true)
      track(events.PWA_INSTALL_CLICK, { platform: 'ios' })
      return
    }

    if (installPrompt) {
      track(events.PWA_INSTALL_CLICK, { platform: 'android' })

      try {
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice

        if (outcome === 'accepted') {
          setInstallPrompt(null)
        } else {
          track(events.PWA_INSTALL_DISMISSED)
        }
      } catch (error) {
        console.error('Install prompt error:', error)
      }
    }
  }

  // Don't show if already installed
  if (isStandalone) {
    return null
  }

  return (
    <>
      <button
        onClick={handleInstall}
        className="transition-opacity hover:opacity-80"
        aria-label="Install App"
      >
        <Image
          src="/PWA-dark-en.svg"
          alt="Install as Progressive Web App"
          width={150}
          height={45}
          className="h-10 w-auto"
        />
      </button>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-black/60 p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Install icemap</h3>
              <p className="text-gray-400 text-sm mb-6">
                Add icemap to your home screen for quick access and offline use.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">1. Tap the Share button</p>
                  <p className="text-gray-500 text-xs">At the bottom of Safari</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">2. Tap &quot;Add to Home Screen&quot;</p>
                  <p className="text-gray-500 text-xs">Scroll down if needed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">3. Tap &quot;Add&quot;</p>
                  <p className="text-gray-500 text-xs">In the top right corner</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all text-sm font-medium"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  )
}
