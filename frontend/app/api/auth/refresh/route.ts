import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function POST(): Promise<NextResponse> {
  const store = await cookies()
  const refresh = store.get('refresh_token')?.value

  if (!refresh) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const res = await fetch(`${DJANGO_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    store.delete('access_token')
    store.delete('refresh_token')
    return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  }

  const data = (await res.json()) as { access: string; refresh?: string }

  store.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
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

  return NextResponse.json({ data: { access: data.access } })
}
