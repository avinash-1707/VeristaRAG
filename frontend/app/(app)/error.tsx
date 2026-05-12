'use client'

import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
      <AlertTriangle className="h-10 w-10" style={{ color: 'var(--state-error)' }} />
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Something went wrong
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
      </div>
      <button
        onClick={reset}
        className="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150"
        style={{
          background: 'linear-gradient(to bottom, #d4580a, #b84208)',
          color: 'var(--text-on-accent)',
        }}
      >
        Try again
      </button>
    </div>
  )
}
