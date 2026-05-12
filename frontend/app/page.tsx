import { redirect } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'

export default async function RootPage() {
  const token = await getAccessToken()
  if (token) {
    redirect('/dashboard')
  }
  redirect('/login')
}
