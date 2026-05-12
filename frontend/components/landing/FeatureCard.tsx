'use client'

import { motion } from 'motion/react'
import { EASE_EXPO, FEATURES } from './constants'
import { IconBadge3D } from './shared'

export function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof FEATURES)[0]
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1, duration: 0.65, ease: EASE_EXPO }}
      className="group relative cursor-default overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 24,
        padding: '28px',
        transition: 'border-color 300ms, box-shadow 300ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-accent)'
        e.currentTarget.style.boxShadow = '0 0 48px 8px var(--glow-soft)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 110%, rgba(212,88,10,0.18) 0%, transparent 65%)',
          borderRadius: 24,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(212,88,10,0.30) 0%, transparent 65%)',
          borderRadius: 24,
        }}
      />

      <div className="relative">
        <div className="mb-5">
          <IconBadge3D icon={feature.icon} />
        </div>
        <h3 className="mb-2 text-base font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {feature.title}
        </h3>
        <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {feature.desc}
        </p>
        <div
          className="inline-flex flex-col"
          style={{
            background: 'var(--bg-card-inner)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '10px 14px',
          }}
        >
          <span className="font-mono text-xl font-bold leading-tight" style={{ color: 'var(--accent-bright)' }}>
            {feature.metric}
          </span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {feature.metricLabel}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
