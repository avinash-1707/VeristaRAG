import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()

  const res = await fetch(`${DJANGO_URL}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: (err as { detail?: string }).detail ?? 'Invalid credentials' },
      { status: res.status },
    )
  }

  const data = (await res.json()) as {
    access: string
    refresh: string
    user: { id: string; email: string; name: string }
  }

  const store = await cookies()
  store.set('access_token', data.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60,
  })
  store.set('refresh_token', data.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  })

  return NextResponse.json({ data: data.user })
}
