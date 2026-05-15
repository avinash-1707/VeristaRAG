import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/shared/ThemeToggle'
import VeritasLogo from '@/components/shared/VeritasLogo'
import { getAccessToken } from '@/lib/auth'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const token = await getAccessToken()
  if (token) {
    redirect('/dashboard')
  }
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-1.5 transition-all duration-150 hover:bg-[var(--bg-surface-hover)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-col items-center mb-8 gap-2">
          <VeritasLogo href="/" markSize={36} textSize="text-xl" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Document intelligence, grounded in truth
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
