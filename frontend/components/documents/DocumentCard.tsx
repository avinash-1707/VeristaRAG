'use client'

import { FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Document } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import StatusBadge from './StatusBadge'

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => Promise<void>
}

export default function DocumentCard({ document: doc, onDelete }: DocumentCardProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(): Promise<void> {
    setDeleting(true)
    await onDelete(doc.id)
    setDeleting(false)
  }

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 group"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = '0 0 40px 8px var(--glow-soft)'
        el.style.borderColor = 'var(--border-accent)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.boxShadow = ''
        el.style.borderColor = 'var(--border-default)'
      }}
    >
      <div
        className="p-2.5 rounded-xl shrink-0"
        style={{ background: 'var(--accent-subtle)' }}
      >
        <FileText className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {doc.filename}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs uppercase font-medium" style={{ color: 'var(--text-muted)' }}>
            {doc.file_type}
          </span>
          {doc.chunk_count > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {doc.chunk_count} chunks
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatDate(doc.created_at)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={doc.status} />
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
          style={{ color: 'var(--state-error)' }}
          aria-label="Delete document"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
