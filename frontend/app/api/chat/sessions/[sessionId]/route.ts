import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await params

  const res = await fetch(`${DJANGO_URL}/api/chat/sessions/${sessionId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Session not found' }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ data })
}
