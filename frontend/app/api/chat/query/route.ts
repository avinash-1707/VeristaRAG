import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const djangoRes = await fetch(`${DJANGO_URL}/api/chat/query/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!djangoRes.ok) {
    const err = await djangoRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: (err as { detail?: string }).detail ?? 'Query failed' },
      { status: djangoRes.status },
    )
  }

  return new NextResponse(djangoRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
