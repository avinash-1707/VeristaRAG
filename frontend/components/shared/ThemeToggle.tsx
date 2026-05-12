'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useCallback, useSyncExternalStore } from 'react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    useCallback(() => true, []),
    useCallback(() => false, [])
  )

  if (!mounted) return <div className="h-8 w-8" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-lg p-2 transition-colors hover:bg-muted hover:text-foreground"
      style={{ color: 'var(--text-muted)' }}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
