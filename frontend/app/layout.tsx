import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { TooltipProvider } from '@/components/ui/tooltip'
import LenisProvider from '@/providers/LenisProvider'
import QueryProvider from '@/providers/QueryProvider'
import ThemeProvider from '@/providers/ThemeProvider'
import 'lenis/dist/lenis.css'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'VeritasRAG — Document Intelligence',
  description: 'Upload documents, ask questions, get grounded cited answers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <LenisProvider>
            <QueryProvider>
              <TooltipProvider>{children}</TooltipProvider>
            </QueryProvider>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
