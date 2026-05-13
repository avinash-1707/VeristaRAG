'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PlusCircle,
  X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { logoutApi, getSessionsApi } from '@/lib/api'
import type { ChatSession, User } from '@/lib/types'
import ThemeToggle from './ThemeToggle'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  user: User
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
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

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/')
  }

  function NavItem({
    href,
    icon,
    label,
    onClick,
  }: {
    href: string
    icon: React.ReactNode
    label: string
    onClick?: () => void
  }) {
    const active = isActive(href)
    const linkClass = cn(
      'flex items-center rounded-lg text-sm transition-colors',
      collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
      active ? 'font-medium' : ''
    )
    const linkStyle = {
      color: active ? 'var(--accent-bright)' : 'var(--text-secondary)',
      background: active ? 'var(--accent-subtle)' : 'transparent',
    }

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger
            render={
              <Link href={href} onClick={onClick} className={linkClass} style={linkStyle}>
                {icon}
              </Link>
            }
          />
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )
    }
    return (
      <Link href={href} onClick={onClick} className={linkClass} style={linkStyle}>
        {icon}
        {label}
      </Link>
    )
  }

  const initials = user.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full shrink-0 border-r transition-all duration-300 ease-in-out',
          collapsed ? 'w-14' : 'w-60'
        )}
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <SidebarInner
          user={user}
          sessions={sessions}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          handleLogout={handleLogout}
          NavItem={NavItem}
          initials={initials}
          pathname={pathname}
          onNavClick={undefined}
        />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-72 border-r md:hidden transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-5 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Link href="/" onClick={onMobileClose} className="flex items-center select-none">
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Veritas
            </span>
            <span className="text-base font-bold" style={{ color: 'var(--accent-primary)' }}>
              RAG
            </span>
          </Link>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarInner
          user={user}
          sessions={sessions}
          collapsed={false}
          onToggleCollapse={onToggleCollapse}
          handleLogout={handleLogout}
          NavItem={({ href, icon, label }) => (
            <Link
              href={href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive(href) ? 'font-medium' : ''
              )}
              style={{
                color: isActive(href) ? 'var(--accent-bright)' : 'var(--text-secondary)',
                background: isActive(href) ? 'var(--accent-subtle)' : 'transparent',
              }}
            >
              {icon}
              {label}
            </Link>
          )}
          initials={initials}
          showCollapseToggle={false}
          pathname={pathname}
          onNavClick={onMobileClose}
        />
      </aside>
    </>
  )
}

function SidebarInner({
  user,
  sessions,
  collapsed,
  onToggleCollapse,
  handleLogout,
  NavItem,
  initials,
  pathname,
  showCollapseToggle = true,
  onNavClick,
}: {
  user: User
  sessions: ChatSession[]
  collapsed: boolean
  onToggleCollapse: () => void
  handleLogout: () => void
  NavItem: React.ComponentType<{ href: string; icon: React.ReactNode; label: string; onClick?: () => void }>
  initials: string
  pathname: string
  showCollapseToggle?: boolean
  onNavClick?: () => void
}) {
  return (
    <>
      {/* Logo — desktop only (mobile has its own header) */}
      {!collapsed && (
        <div className="px-5 py-5 border-b hidden md:block" style={{ borderColor: 'var(--border-default)' }}>
          <Link href="/" className="flex items-center select-none">
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Veritas
            </span>
            <span className="text-base font-bold" style={{ color: 'var(--accent-primary)' }}>
              RAG
            </span>
          </Link>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Document Intelligence
          </p>
        </div>
      )}
      {collapsed && (
        <div
          className="flex justify-center py-4 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Link
            href="/"
            className="flex items-center justify-center h-8 w-8 rounded-lg font-bold text-sm select-none"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}
            title="VeritasRAG — Home"
          >
            V
          </Link>
        </div>
      )}

      {/* Nav */}
      <div className={cn('flex-1 overflow-y-auto py-4 space-y-1', collapsed ? 'px-1.5' : 'px-3')}>
        <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4 shrink-0" />} label="Dashboard" />

        {!collapsed && (
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
            <NavItem href="/documents" icon={<FileText className="h-4 w-4 shrink-0" />} label="All Documents" />
          </div>
        )}
        {collapsed && (
          <div className="pt-2">
            <NavItem href="/documents" icon={<FileText className="h-4 w-4 shrink-0" />} label="All Documents" />
          </div>
        )}

        {!collapsed && (
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
              onClick={onNavClick}
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
                onClick={onNavClick}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors truncate',
                  pathname === `/chat/${s.id}` ? 'font-medium' : ''
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
        )}
        {collapsed && (
          <div className="pt-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/chat"
                    className="flex items-center justify-center p-2.5 rounded-lg transition-colors"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Link>
                }
              />
              <TooltipContent side="right">New Chat</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Collapse toggle (desktop only) */}
      {showCollapseToggle && (
        <div className="px-3 pb-2">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'flex items-center rounded-lg text-xs transition-colors w-full py-2',
              collapsed ? 'justify-center px-0' : 'gap-2 px-3'
            )}
            style={{ color: 'var(--text-muted)' }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* User footer */}
      <div
        className={cn(
          'border-t',
          collapsed ? 'px-1.5 py-3 flex flex-col items-center gap-2' : 'px-4 py-4 flex items-center gap-3'
        )}
        style={{ borderColor: 'var(--border-default)' }}
      >
        {collapsed ? (
          <>
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-bright)' }}
              title={user.name}
            >
              {initials}
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
          </>
        ) : (
          <>
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent-bright)' }}
            >
              {initials}
            </div>
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
          </>
        )}
      </div>
    </>
  )
}
