'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Citation } from '@/lib/types'

interface CitationCardProps {
  citation: Citation
  index: number
}

export default function CitationCard({ citation, index }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="rounded-2xl p-3 mb-2 border transition-all duration-200 cursor-pointer"
      style={{
        background: 'var(--citation-bg)',
        borderColor: 'var(--citation-border)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = '0 0 20px 4px var(--glow-soft)'
        el.style.borderColor = 'var(--border-accent)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = ''
        el.style.borderColor = 'var(--citation-border)'
      }}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start gap-2 justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-bold shrink-0"
              style={{ color: 'var(--accent-primary)' }}
            >
              [{index}]
            </span>
            <p
              className="text-xs font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {citation.document_name}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {citation.page_number} · score {(citation.similarity_score * 100).toFixed(0)}%
          </p>
        </div>
        <button className="shrink-0 p-0.5" style={{ color: 'var(--text-muted)' }}>
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {expanded && citation.content && (
        <div
          className="mt-2 text-xs leading-relaxed border-t pt-2"
          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-3 mb-1.5 space-y-0.5">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-3 mb-1.5 space-y-0.5">{children}</ol>,
              li: ({ children }) => <li>{children}</li>,
              strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</strong>,
              code: ({ children }) => (
                <code className="rounded px-0.5 font-mono" style={{ background: 'var(--bg-base)', color: 'var(--accent-bright)' }}>
                  {children}
                </code>
              ),
            }}
          >
            {citation.content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
