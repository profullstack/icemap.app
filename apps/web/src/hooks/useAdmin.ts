'use client'

import { useState, useEffect } from 'react'

interface AdminUser {
  id: string
  email: string
  is_admin: boolean
}

export function useAdmin() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        setUser(data.user || null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  return {
    user,
    isAdmin: user?.is_admin === true,
    loading,
  }
}
