'use client'

import { motion } from 'motion/react'
import { ArrowRight, BookOpen, FileText } from 'lucide-react'
import { EASE_EXPO } from './constants'

export function ChatMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -12 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 0.45, duration: 1, ease: EASE_EXPO }}
      style={{ perspective: 1400, transformStyle: 'preserve-3d' }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="pointer-events-none absolute -inset-8 rounded-3xl"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(212,88,10,0.14) 0%, transparent 70%)',
            filter: 'blur(16px)',
          }}
        />

        <div
          className="relative overflow-hidden"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 20,
            boxShadow:
              '0 8px 80px 20px var(--glow-soft), 0 0 0 1px var(--border-accent)',
          }}
        >
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderBottom: '1px solid var(--border-default)',
              background: 'var(--bg-surface-elevated)',
            }}
          >
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#ef4444] opacity-60" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] opacity-60" />
              <div className="h-2.5 w-2.5 rounded-full bg-[#22c55e] opacity-60" />
            </div>
            <div className="ml-2 flex flex-1 items-center gap-1.5">
              <FileText className="h-3 w-3" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                research-paper.pdf
              </span>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: 'var(--state-success-subtle)',
                color: 'var(--state-success)',
                border: '1px solid rgba(34,197,94,0.2)',
              }}
            >
              Ready
            </span>
          </div>

          <div className="min-w-[280px] max-w-[340px] space-y-3 p-4">
            <div className="flex justify-end">
              <div
                className="max-w-[82%] rounded-2xl rounded-br-sm px-3.5 py-2.5"
                style={{
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  What methodology was used?
                </p>
              </div>
            </div>

            <div className="flex justify-start">
              <div
                className="max-w-[88%] rounded-2xl rounded-bl-sm px-3.5 py-2.5"
                style={{
                  background: 'var(--bg-card-inner)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  The study employed a mixed-methods approach combining quantitative analysis with
                  qualitative interviews across three cohorts
                  <motion.span
                    className="ml-0.5 inline-block h-3 w-[2px] rounded-full align-text-bottom"
                    style={{ background: 'var(--accent-primary)' }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                </p>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Sources
                </span>
              </div>

              {[
                {
                  page: 'p.4',
                  score: '0.94',
                  text: '"The methodology employed a mixed-methods approach, combining quantitative data..."',
                  delay: 1.8,
                },
                {
                  page: 'p.7',
                  score: '0.87',
                  text: '"Qualitative interviews were conducted with 45 participants across..."',
                  delay: 2.1,
                },
              ].map((c) => (
                <motion.div
                  key={c.page}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: c.delay, duration: 0.5 }}
                  className="mb-1.5 rounded-xl p-2.5 last:mb-0"
                  style={{
                    background: 'var(--bg-card-inner)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      research-paper.pdf · {c.page}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                      style={{
                        color: 'var(--accent-primary)',
                        background: 'var(--accent-subtle)',
                      }}
                    >
                      {c.score}
                    </span>
                  </div>
                  <p className="line-clamp-2 font-mono text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {c.text}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 0.5 }}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Grounding confidence
                </span>
                <span className="font-mono text-[10px] font-semibold" style={{ color: 'var(--state-success)' }}>
                  0.91
                </span>
              </div>
              <div
                className="h-1 overflow-hidden rounded-full"
                style={{
                  background: 'var(--bg-card-inner)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #d4580a 0%, #22c55e 100%)' }}
                  initial={{ width: 0 }}
                  animate={{ width: '91%' }}
                  transition={{ delay: 2.6, duration: 1, ease: EASE_EXPO }}
                />
              </div>
            </motion.div>
          </div>

          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{
              borderTop: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
            }}
          >
            <div
              className="flex h-8 flex-1 items-center rounded-lg px-3"
              style={{
                background: 'var(--bg-card-inner)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Ask another question...
              </span>
            </div>
            <button
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #d4580a, #b84208)',
                boxShadow: '0 0 12px 4px rgba(212,88,10,0.5)',
              }}
            >
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
