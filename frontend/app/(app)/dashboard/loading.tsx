import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-40 mb-8 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" style={{ background: 'var(--bg-surface-hover)' }} />
        ))}
      </div>
    </div>
  )
}
