'use client'

import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Zap } from 'lucide-react'
import { getQueryLogsApi } from '@/lib/api'
import { formatRelativeTime, groundingLabel, truncate } from '@/lib/utils'

const groundingColors = {
  high: 'var(--state-success)',
  medium: 'var(--state-warning)',
  low: 'var(--state-error)',
}

export default function QueryLogTable() {
  const { data: result, isLoading } = useQuery({
    queryKey: ['query-logs'],
    queryFn: getQueryLogsApi,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }} />
        ))}
      </div>
    )
  }

  if (!result || 'error' in result || result.data.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
        No queries yet
      </p>
    )
  }

  const logs = result.data

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
            {['Question', 'Grounding', 'Top Similarity', 'Cache', 'Time'].map((h) => (
              <th
                key={h}
                className="text-left pb-3 pr-4 text-xs font-medium uppercase tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => {
            const grounding = log.grounding_score ?? 0
            const level = groundingLabel(grounding)
            return (
              <tr
                key={log.id}
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface)',
                }}
              >
                <td className="py-3 pr-4" style={{ color: 'var(--text-primary)' }}>
                  {truncate(log.question ?? '', 60)}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="text-xs font-medium"
                    style={{ color: groundingColors[level] }}
                  >
                    {(grounding * 100).toFixed(1)}%
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {log.top_similarity_score != null ? `${(log.top_similarity_score * 100).toFixed(1)}%` : '—'}
                </td>
                <td className="py-3 pr-4">
                  {log.cache_hit && (
                    <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--accent-bright)' }}>
                      <Zap className="h-3 w-3" />
                      Hit
                    </span>
                  )}
                </td>
                <td className="py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatRelativeTime(log.created_at)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
