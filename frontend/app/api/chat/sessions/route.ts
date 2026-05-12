import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function GET(): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const res = await fetch(`${DJANGO_URL}/api/chat/sessions/`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: res.status })

  const data = await res.json()
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const res = await fetch(`${DJANGO_URL}/api/chat/sessions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: (err as { detail?: string }).detail ?? 'Failed to create session' },
      { status: res.status },
    )
  }

  const data = await res.json()
  return NextResponse.json({ data }, { status: 201 })
}
