'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { EASE_EXPO, FAQ_ITEMS } from './constants'

export function FAQItem({
  item,
  index,
}: {
  item: (typeof FAQ_ITEMS)[0]
  index: number
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: EASE_EXPO }}
      style={{
        borderRadius: 16,
        border: `1px solid ${open ? 'var(--border-accent)' : 'var(--border-default)'}`,
        background: 'var(--bg-surface)',
        overflow: 'hidden',
        transition: 'border-color 200ms',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <span className="pr-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {item.q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
          <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-6 pb-5">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
