import { Shield } from 'lucide-react'
import { groundingLabel } from '@/lib/utils'

interface GroundingBadgeProps {
  score: number
}

const levelConfig = {
  high: { color: 'var(--state-success)', bg: 'var(--state-success-subtle)', label: 'High confidence' },
  medium: { color: 'var(--state-warning)', bg: 'var(--state-warning-subtle)', label: 'Medium confidence' },
  low: { color: 'var(--state-error)', bg: 'var(--state-error-subtle)', label: 'Low confidence' },
}

export default function GroundingBadge({ score }: GroundingBadgeProps) {
  const level = groundingLabel(score)
  const { color, bg, label } = levelConfig[level]

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ color, background: bg }}
    >
      <Shield className="h-3 w-3" />
      {label} ({(score * 100).toFixed(0)}%)
    </span>
  )
}
