import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const res = await fetch(`${DJANGO_URL}/api/documents/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Delete failed' }, { status: res.status })
  }

  return new NextResponse(null, { status: 204 })
}
