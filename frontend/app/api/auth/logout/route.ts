import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

export async function POST(): Promise<NextResponse> {
  const store = await cookies()
  const refresh = store.get('refresh_token')?.value
  const access = store.get('access_token')?.value

  if (refresh && access) {
    await fetch(`${DJANGO_URL}/api/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`,
      },
      body: JSON.stringify({ refresh }),
    }).catch(() => null)
  }

  store.delete('access_token')
  store.delete('refresh_token')

  return NextResponse.json(null)
}
