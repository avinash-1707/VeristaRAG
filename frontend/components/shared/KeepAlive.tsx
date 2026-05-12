'use client'

import { useEffect } from 'react'

const PING_INTERVAL = 4 * 60 * 1000

export default function KeepAlive() {
  useEffect(() => {
    const ping = () => {
      fetch('/api/auth/me').catch(() => null)
    }

    const id = setInterval(ping, PING_INTERVAL)
    return () => clearInterval(id)
  }, [])

  return null
}
