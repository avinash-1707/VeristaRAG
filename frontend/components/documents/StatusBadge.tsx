import { CheckCircle2, Loader2, AlertTriangle, Clock } from 'lucide-react'
import type { DocumentStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: DocumentStatus
}

const config: Record<
  DocumentStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
  uploaded: {
    label: 'Uploaded',
    icon: <Clock className="h-3 w-3" />,
    color: 'var(--text-muted)',
    bg: 'transparent',
  },
  processing: {
    label: 'Processing',
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    color: 'var(--state-processing)',
    bg: 'var(--accent-subtle)',
  },
  ready: {
    label: 'Ready',
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'var(--state-success)',
    bg: 'var(--state-success-subtle)',
  },
  failed: {
    label: 'Failed',
    icon: <AlertTriangle className="h-3 w-3" />,
    color: 'var(--state-error)',
    bg: 'var(--state-error-subtle)',
  },
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, icon, color, bg } = config[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition-colors duration-300"
      style={{ color, background: bg }}
    >
      {icon}
      {label}
    </span>
  )
}
