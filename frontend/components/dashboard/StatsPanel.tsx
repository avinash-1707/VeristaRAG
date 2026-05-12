'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText, MessageSquare, Shield, Zap } from 'lucide-react'
import { getDashboardStatsApi } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
        boxShadow: '0 0 24px 4px var(--glow-soft)',
      }}
    >
      <div
        className="inline-flex items-center justify-center h-10 w-10 rounded-xl mb-3"
        style={{ background: 'var(--accent-subtle)' }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}

export default function StatsPanel() {
  const { data: result, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getDashboardStatsApi,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: 'var(--bg-surface-hover)' }} />
        ))}
      </div>
    )
  }

  if (!result || 'error' in result) return null

  const stats = result.data

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<FileText className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />}
        label="Total Documents"
        value={stats.document_count}
      />
      <StatCard
        icon={<MessageSquare className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />}
        label="Total Queries"
        value={stats.query_count}
      />
      <StatCard
        icon={<Shield className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />}
        label="Avg Grounding Score"
        value={`${(stats.avg_grounding_score * 100).toFixed(1)}%`}
      />
      <StatCard
        icon={<Zap className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />}
        label="Cache Hit Rate"
        value={`${(stats.cache_hit_rate * 100).toFixed(1)}%`}
      />
    </div>
  )
}
