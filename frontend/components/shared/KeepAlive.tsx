'use client'

import { useEffect } from 'react'

const REFRESH_INTERVAL = 45 * 60 * 1000

export default function KeepAlive() {
  useEffect(() => {
    const refresh = () => {
      fetch('/api/auth/refresh', { method: 'POST' }).catch(() => null)
    }

    const id = setInterval(refresh, REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return null
}
