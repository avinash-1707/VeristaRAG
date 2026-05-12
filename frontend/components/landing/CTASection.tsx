'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, Shield } from 'lucide-react'
import { EASE_EXPO } from './constants'
import { IconBadge3D, PillLabel } from './shared'

export function CTASection() {
  return (
    <section
      className="relative overflow-hidden px-6 py-36 md:px-12"
      style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 100%, rgba(212,88,10,0.38) 0%, rgba(138,58,6,0.12) 52%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: '48%',
          height: '50%',
          background:
            'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(232,117,26,0.52) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.75, ease: EASE_EXPO }}
        className="relative mx-auto max-w-2xl text-center"
      >
        <div className="mb-8 flex justify-center">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <IconBadge3D icon={Shield} size={64} />
          </motion.div>
        </div>

        <PillLabel>Get Started</PillLabel>
        <h2 className="mb-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl" style={{ color: 'var(--text-primary)' }}>
          Ready to ask better questions?
        </h2>
        <p className="mx-auto mb-9 max-w-md text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Upload your first document and get grounded, cited answers in under 3 seconds. Free to start, no credit card
          required.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full px-9 py-4 text-sm font-semibold text-white transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #d4580a, #b84208)',
            boxShadow: '0 0 40px 12px rgba(212,88,10,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}
        >
          Get Started Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  )
}
