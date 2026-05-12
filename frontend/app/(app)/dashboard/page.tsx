import StatsPanel from '@/components/dashboard/StatsPanel'
import QueryLogTable from '@/components/dashboard/QueryLogTable'

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest mb-2"
          style={{
            borderColor: 'var(--border-accent)',
            background: 'var(--accent-subtle)',
            color: 'var(--accent-bright)',
          }}
        >
          Overview
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          System-wide analytics and query history
        </p>
      </div>

      <StatsPanel />

      <div className="mt-10">
        <div className="mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Queries
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Last 100 queries across all sessions
          </p>
        </div>
        <div
          className="rounded-2xl border p-5"
          style={{
            background: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <QueryLogTable />
        </div>
      </div>
    </div>
  )
}
