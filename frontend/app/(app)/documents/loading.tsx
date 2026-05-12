import { Skeleton } from '@/components/ui/skeleton'

export default function DocumentsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Skeleton className="h-8 w-48 mb-8 rounded-xl" style={{ background: 'var(--bg-surface-hover)' }} />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" style={{ background: 'var(--bg-surface-hover)' }} />
        ))}
      </div>
    </div>
  )
}
