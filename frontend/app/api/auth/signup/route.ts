import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()

  const res = await fetch(`${DJANGO_URL}/api/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const detail = (err as Record<string, unknown>)
    const message =
      (detail.detail as string) ??
      Object.values(detail).flat().join(', ') ??
      'Signup failed'
    return NextResponse.json({ error: message }, { status: res.status })
  }

  const data = (await res.json()) as {
    access: string
    refresh: string
    user: { id: string; email: string; full_name: string }
  }

  const store = await cookies()
  store.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })
  store.set('refresh_token', data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return NextResponse.json(data.user, { status: 201 })
}
