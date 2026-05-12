'use client'

import { motion } from 'motion/react'
import { EASE_EXPO, STEPS } from './constants'
import { IconBadge3D, PillLabel } from './shared'

export function ProcessSection() {
  return (
    <section
      id="process"
      className="relative overflow-hidden px-6 py-28 md:px-12"
      style={{ borderTop: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(212,88,10,0.05) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="mb-16 text-center"
        >
          <PillLabel>Process</PillLabel>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)' }}>
            The Process. Fast, Clear, Done.
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            No manual work. No waiting. Just answers grounded in your content.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: EASE_EXPO }}
              className="relative overflow-hidden"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 24,
                padding: '28px 24px',
              }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(212,88,10,0.14) 0%, transparent 65%)',
                  borderRadius: 24,
                }}
              />
              <div className="relative">
                <div className="mb-5 flex items-start gap-3">
                  <IconBadge3D icon={step.icon} />
                  <span className="mt-1 font-mono text-3xl font-bold tracking-tight" style={{ color: 'var(--border-strong)' }}>
                    {step.step}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
