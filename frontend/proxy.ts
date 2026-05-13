import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DJANGO_URL = process.env.DJANGO_INTERNAL_URL ?? 'http://localhost:8000'

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

async function tryRefresh(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${DJANGO_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access: string }
    return data.access
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')
  const isApi = pathname.startsWith('/api')

  if (isApi || isPublic) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.next()
  }

  if (refreshToken) {
    const newAccess = await tryRefresh(refreshToken)
    if (newAccess) {
      const response = NextResponse.next()
      response.cookies.set('access_token', newAccess, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60,
      })
      return response
    }
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
}
