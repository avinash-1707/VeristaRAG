import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getAccessToken, getRefreshToken } from '@/lib/auth'
import type { User } from '@/lib/types'
import Sidebar from '@/components/shared/Sidebar'
import KeepAlive from '@/components/shared/KeepAlive'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

async function fetchMe(token: string): Promise<User | null> {
  const res = await fetch(`${DJANGO_URL}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json() as Promise<User>
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const res = await fetch(`${DJANGO_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })
  if (!res.ok) return null

  const data = (await res.json()) as { access: string; refresh?: string }
  const store = await cookies()
  store.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
  if (data.refresh) {
    store.set('refresh_token', data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
  }
  return data.access
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let token = await getAccessToken()

  if (!token) {
    token = await tryRefresh()
    if (!token) redirect('/login')
  }

  let user = await fetchMe(token)

  if (!user) {
    const newToken = await tryRefresh()
    if (!newToken) redirect('/login')
    user = await fetchMe(newToken)
    if (!user) redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <KeepAlive />
      <Sidebar user={user} />
      <main className="flex-1 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        {children}
      </main>
    </div>
  )
}
