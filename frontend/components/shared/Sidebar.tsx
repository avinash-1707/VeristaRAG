'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { logoutApi, getSessionsApi } from '@/lib/api'
import type { ChatSession, User } from '@/lib/types'
import ThemeToggle from './ThemeToggle'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user: User
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const { data: sessionsResult } = useQuery({
    queryKey: ['sessions'],
    queryFn: getSessionsApi,
  })

  const sessions: ChatSession[] =
    sessionsResult && 'data' in sessionsResult ? sessionsResult.data : []

  async function handleLogout(): Promise<void> {
    await logoutApi()
    router.push('/login')
    router.refresh()
  }

  const navItem = (href: string, icon: React.ReactNode, label: string) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
        pathname === href || pathname.startsWith(href + '/')
          ? 'font-medium'
          : '',
      )}
      style={{
        color:
          pathname === href || pathname.startsWith(href + '/')
            ? 'var(--accent-bright)'
            : 'var(--text-secondary)',
        background:
          pathname === href || pathname.startsWith(href + '/')
            ? 'var(--accent-subtle)'
            : 'transparent',
      }}
    >
      {icon}
      {label}
    </Link>
  )

  return (
    <aside
      className="flex flex-col h-full w-60 shrink-0 border-r"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          Veritas<span style={{ color: 'var(--accent-primary)' }}>RAG</span>
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Document Intelligence
        </p>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItem('/dashboard', <LayoutDashboard className="h-4 w-4" />, 'Dashboard')}

        <div className="pt-4 pb-1">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest mb-2"
            style={{
              borderColor: 'var(--border-accent)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-bright)',
            }}
          >
            <FileText className="h-3 w-3" />
            Documents
          </div>
          {navItem('/documents', <FileText className="h-4 w-4" />, 'All Documents')}
        </div>

        <div className="pt-2 pb-1">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest mb-2"
            style={{
              borderColor: 'var(--border-accent)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-bright)',
            }}
          >
            <MessageSquare className="h-3 w-3" />
            Chat
          </div>
          <Link
            href="/chat"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-1"
            style={{
              color: 'var(--accent-primary)',
              border: '1px dashed var(--border-strong)',
            }}
          >
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Link>
          {sessions.slice(0, 8).map((s) => (
            <Link
              key={s.id}
              href={`/chat/${s.id}`}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors truncate',
                pathname === `/chat/${s.id}` ? 'font-medium' : '',
              )}
              style={{
                color:
                  pathname === `/chat/${s.id}`
                    ? 'var(--accent-bright)'
                    : 'var(--text-muted)',
                background:
                  pathname === `/chat/${s.id}` ? 'var(--accent-subtle)' : 'transparent',
              }}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{s.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User footer */}
      <div
        className="px-4 py-4 border-t flex items-center gap-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {user.name}
          </p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {user.email}
          </p>
        </div>
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}
