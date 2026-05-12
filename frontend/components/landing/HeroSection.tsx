'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react'
import { ChatMockup } from './ChatMockup'
import { EASE_EXPO, PARTICLES } from './constants'

export function HeroSection() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 600], [0, -80])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24 pb-20 md:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 58% at 50% 100%, rgba(212,88,10,0.48) 0%, rgba(138,58,6,0.16) 48%, transparent 68%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '55%',
          height: '42%',
          background:
            'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,117,26,0.58) 0%, rgba(212,88,10,0.16) 42%, transparent 65%)',
          filter: 'blur(32px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,88,10,0.13) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: '#d4580a',
            opacity: p.opacity,
          }}
          animate={{ y: [0, -22, 0], opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
          >
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: 'var(--accent-bright)' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--accent-primary)' }} />
            </span>
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--accent-bright)' }}>
              Hybrid RAG · Gemini 2.0 · pgvector
            </span>
          </motion.div>

          <div className="mb-6">
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease: EASE_EXPO }}
                className="text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl lg:text-[4.5rem]"
                style={{ color: 'var(--text-primary)' }}
              >
                No guessing.
              </motion.p>
            </div>
            <div className="mt-[0.04em] overflow-hidden">
              <motion.p
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, duration: 0.9, ease: EASE_EXPO }}
                className="text-5xl font-bold leading-[1.02] tracking-tight md:text-6xl lg:text-[4.5rem]"
                style={{
                  background: 'linear-gradient(120deg, #f0905a 0%, #e8751a 25%, #d4580a 55%, #b84208 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                No hallucination.
              </motion.p>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.65, ease: EASE_EXPO }}
            className="mb-9 max-w-[26rem] text-lg leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Upload documents, ask questions, and get answers{' '}
            <span style={{ color: 'var(--text-primary)' }}>grounded in your actual content</span> — with exact
            citations showing document, page, and passage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6, ease: EASE_EXPO }}
            className="mb-8 flex flex-wrap gap-3"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-150"
              style={{
                background: 'linear-gradient(135deg, #d4580a, #b84208)',
                boxShadow: '0 0 28px 8px rgba(212,88,10,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              Get Started Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm transition-all duration-150"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border-strong)' }}
            >
              See Features
              <ChevronRight className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap items-center gap-5"
          >
            {['Zero hallucination', 'Exact citations', '< 3s response'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--state-success)' }} />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div className="flex justify-center lg:justify-end">
          <ChatMockup />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-6 w-4 items-start justify-center rounded-full pt-1"
          style={{ border: '1px solid var(--border-strong)' }}
        >
          <div className="h-1.5 w-1 rounded-full" style={{ background: 'var(--accent-primary)' }} />
        </motion.div>
      </motion.div>
    </section>
  )
}
