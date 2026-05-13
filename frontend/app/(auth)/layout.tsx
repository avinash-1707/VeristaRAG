import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/shared/ThemeToggle'
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

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Veritas<span style={{ color: 'var(--accent-primary)' }}>RAG</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Document intelligence, grounded in truth
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
