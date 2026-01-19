'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/lib/registerSW'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return null
}
