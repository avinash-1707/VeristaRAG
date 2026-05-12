import { AlertTriangle } from 'lucide-react'

export default function GroundingWarning() {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl px-4 py-2.5 mt-2"
      style={{
        background: 'var(--state-warning-subtle)',
        border: '1px solid color-mix(in srgb, var(--state-warning) 40%, transparent)',
      }}
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--state-warning)' }} />
      <p className="text-xs leading-relaxed" style={{ color: 'var(--state-warning)' }}>
        Answer confidence is low — documents may not contain sufficient information to answer this question.
      </p>
    </div>
  )
}
