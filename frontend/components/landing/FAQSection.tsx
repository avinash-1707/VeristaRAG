'use client'

import { motion } from 'motion/react'
import { EASE_EXPO, FAQ_ITEMS } from './constants'
import { FAQItem } from './FAQItem'
import { PillLabel } from './shared'

export function FAQSection() {
  return (
    <section id="faq" className="px-6 py-28 md:px-12" style={{ borderTop: '1px solid var(--border-default)' }}>
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE_EXPO }}
          className="mb-14 text-center"
        >
          <PillLabel>FAQ</PillLabel>
          <h2 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl" style={{ color: 'var(--text-primary)' }}>
            Questions? We&apos;ve got answers.
          </h2>
          <p className="mx-auto max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
            We&apos;ve answered the most common questions below. If you need more, just ask.
          </p>
        </motion.div>

        <div className="space-y-2.5">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={item.q} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
