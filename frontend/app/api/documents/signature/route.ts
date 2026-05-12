import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = await getAccessToken()
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const filename = req.nextUrl.searchParams.get('filename') ?? ''

  const res = await fetch(
    `${DJANGO_URL}/api/documents/signature/?filename=${encodeURIComponent(filename)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Signature failed' }, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json({ data })
}
