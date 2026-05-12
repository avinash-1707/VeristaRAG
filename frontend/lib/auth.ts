import { cookies } from 'next/headers'

export async function getAccessToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get('access_token')?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies()
  return store.get('refresh_token')?.value
}
