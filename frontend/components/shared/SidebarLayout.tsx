'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import type { User } from '@/lib/types'
import Sidebar from './Sidebar'

export default function SidebarLayout({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored === 'true') setCollapsed(true)
  }, [])

  function toggleCollapse() {
    setCollapsed(v => {
      localStorage.setItem('sidebar-collapsed', String(!v))
      return !v
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header
          className="flex items-center gap-3 border-b px-4 h-14 shrink-0 md:hidden"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center select-none">
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Veritas
            </span>
            <span className="text-base font-bold" style={{ color: 'var(--accent-primary)' }}>
              RAG
            </span>
          </Link>
        </header>

        <main className="flex-1 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
