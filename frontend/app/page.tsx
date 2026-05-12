import { redirect } from 'next/navigation'
import { getAccessToken } from '@/lib/auth'
import LandingPage from '@/components/landing/LandingPage'

export default async function RootPage() {
  const token = await getAccessToken()
  if (token) {
    redirect('/dashboard')
  }
  return <LandingPage />
}
