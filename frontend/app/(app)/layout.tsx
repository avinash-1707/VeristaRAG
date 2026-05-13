import { redirect } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'
import type { User } from '@/lib/types'
import SidebarLayout from '@/components/shared/SidebarLayout'
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

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const token = await getAccessToken()
  if (!token) redirect('/login')

  const user = await fetchMe(token)
  if (!user) redirect('/login')

  return (
    <>
      <KeepAlive />
      <SidebarLayout user={user}>{children}</SidebarLayout>
    </>
  )
}
