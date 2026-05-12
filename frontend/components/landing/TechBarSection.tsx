'use client'

import { motion } from 'motion/react'
import { TECH } from './constants'

export function TechBarSection() {
  return (
    <section
      className="overflow-hidden py-7"
      style={{
        borderTop: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-2.5 px-6 md:px-12">
        <span className="mr-2 text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Powered by
        </span>
        {TECH.map((tech, i) => (
          <motion.span
            key={tech}
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            className="rounded-full px-3 py-1 text-xs"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
            }}
          >
            {tech}
          </motion.span>
        ))}
      </div>
    </section>
  )
}
