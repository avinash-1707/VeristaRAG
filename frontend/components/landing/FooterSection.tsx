import Link from 'next/link'
import { ArrowRight, Shield } from 'lucide-react'

export function FooterSection() {
  return (
    <footer
      style={{
        background:
          'linear-gradient(to bottom, var(--bg-surface) 0%, var(--bg-base) 100%)',
        borderTop: '1px solid var(--border-default)',
      }}
    >
      <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-12">
        <div
          className="pointer-events-none absolute inset-x-6 top-0 h-32 md:inset-x-12"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(212,88,10,0.08) 0%, transparent 72%)',
          }}
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #d4580a, #b84208)',
                  boxShadow: '0 0 12px 4px rgba(212,88,10,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                VeritasRAG
              </span>
            </div>
            <p className="mb-2 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Helping researchers and professionals get grounded, cited answers from their documents — instantly.
            </p>
            <p className="mb-6 text-xs" style={{ color: 'var(--text-muted)' }}>
              Let&apos;s build something great.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #d4580a, #b84208)',
                boxShadow: '0 0 16px 4px rgba(212,88,10,0.35)',
              }}
            >
              Start Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <FooterLinks title="Product" links={['Features', 'Process', 'FAQ'].map((item) => ({ label: item, href: `#${item.toLowerCase()}` }))} />
          <FooterLinks
            title="Account"
            links={[
              { label: 'Sign In', href: '/login' },
              { label: 'Sign Up', href: '/signup' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Documents', href: '/documents' },
            ]}
            useNextLink
          />
        </div>
      </div>

      <div className="px-6 py-5 md:px-12" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2025 VeritasRAG. All rights reserved.
          </p>
          <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Document intelligence powered by hybrid RAG · Zero hallucination guaranteed
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({
  title,
  links,
  useNextLink = false,
}: {
  title: string
  links: { label: string; href: string }[]
  useNextLink?: boolean
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      <div className="space-y-2.5">
        {links.map((item) =>
          useNextLink ? (
            <Link key={item.label} href={item.href} className="block text-sm transition-colors duration-150" style={{ color: 'var(--text-secondary)' }}>
              {item.label}
            </Link>
          ) : (
            <a key={item.label} href={item.href} className="block text-sm transition-colors duration-150" style={{ color: 'var(--text-secondary)' }}>
              {item.label}
            </a>
          )
        )}
      </div>
    </div>
  )
}
