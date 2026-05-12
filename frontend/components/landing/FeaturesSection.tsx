'use client'

import { motion } from 'motion/react'
import { EASE_EXPO, FEATURES } from './constants'
import { FeatureCard } from './FeatureCard'
import { PillLabel } from './shared'

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-28 md:px-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,88,10,0.04) 0%, transparent 70%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="mb-16 text-center"
        >
          <PillLabel>Why VeritasRAG</PillLabel>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Why users stick with it.
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Every layer is engineered to maximize retrieval quality and response grounding. Zero hallucination is a
            design constraint, not a goal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
