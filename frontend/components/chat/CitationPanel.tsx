import { BookOpen } from 'lucide-react'
import type { Citation } from '@/lib/types'
import CitationCard from './CitationCard'
import GroundingBadge from './GroundingBadge'

interface CitationPanelProps {
  citations: Citation[]
  groundingScore: number
}

export default function CitationPanel({ citations, groundingScore }: CitationPanelProps) {
  if (citations.length === 0) return null

  const progressColor =
    groundingScore >= 0.75
      ? 'var(--state-success)'
      : groundingScore >= 0.6
        ? 'var(--state-warning)'
        : 'var(--state-error)'

  return (
    <aside
      className="w-[560px] shrink-0 border-l flex flex-col"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest"
            style={{
              borderColor: 'var(--border-accent)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-bright)',
            }}
          >
            <BookOpen className="h-3 w-3" />
            Sources
          </div>
          <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
            {citations.length} found
          </span>
        </div>
        <GroundingBadge score={groundingScore} />
        <div className="mt-2 h-1.5 rounded-full" style={{ background: 'var(--border-default)' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${groundingScore * 100}%`, background: progressColor }}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-y-auto p-4">
          {citations.map((c, i) => (
            <CitationCard key={c.chunk_id} citation={c} index={i + 1} />
          ))}
        </div>
      </div>
    </aside>
  )
}
