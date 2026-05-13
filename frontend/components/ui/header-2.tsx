'use client'

import React from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon'
import { useScroll } from '@/components/ui/use-scroll'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Process', href: '#process' },
  { label: 'FAQ', href: '#faq' },
]

type HeaderProps = { isLoggedIn?: boolean }

export function Header({ isLoggedIn = false }: HeaderProps) {
  const [open, setOpen] = React.useState(false)
  const scrolled = useScroll(10)

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header
      className={cn(
        'fixed top-3 left-1/2 z-50 w-[calc(100%-1rem)] max-w-5xl -translate-x-1/2 border-b border-transparent md:top-4 md:rounded-md md:border md:transition-all md:ease-out',
        {
          'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:max-w-4xl md:shadow':
            scrolled && !open,
          'bg-background/90': open,
        }
      )}
    >
      <nav
        className={cn(
          'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
          { 'md:px-2': scrolled }
        )}
      >
        <Wordmark />
        <div className="hidden items-center gap-2 md:flex">
          {links.map((link, i) => (
            <a key={i} className={buttonVariants({ variant: 'ghost' })} href={link.href}>
              {link.label}
            </a>
          ))}
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/dashboard" className={buttonVariants()}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
                Sign In
              </Link>
              <Link href="/signup" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button size="icon" variant="outline" onClick={() => setOpen(v => !v)}>
            <MenuToggleIcon open={open} className="size-5" duration={300} />
          </Button>
        </div>
      </nav>

      <div
        className={cn(
          'bg-background/90 fixed top-[3.75rem] right-0 bottom-0 left-0 z-50 overflow-hidden border-t md:hidden',
          open ? 'flex flex-col' : 'hidden'
        )}
      >
        <div className="flex h-full w-full flex-col justify-between gap-y-2 p-4">
          <div className="grid gap-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={buttonVariants({ className: 'w-full' })}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ variant: 'outline', className: 'w-full' })}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className={buttonVariants({ className: 'w-full' })}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function Wordmark() {
  return (
    <Link href="/" className="flex items-center select-none">
      <span
        className="text-xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-outfit)', color: 'var(--text-primary)' }}
      >
        Veritas
      </span>
      <span
        className="text-xl font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-outfit)', color: 'var(--accent-primary)' }}
      >
        RAG
      </span>
    </Link>
  )
}
