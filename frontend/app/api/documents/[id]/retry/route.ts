import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const res = await fetch(`${DJANGO_URL}/api/documents/${id}/retry/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json(
      { error: (err as { error?: string }).error ?? 'Retry failed' },
      { status: res.status },
    )
  }

  const data = await res.json()
  return NextResponse.json(data)
}
