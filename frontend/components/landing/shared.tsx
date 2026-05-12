import React from 'react'

export function PillLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
      style={{ border: '1px solid var(--border-accent)', background: 'var(--accent-subtle)' }}
    >
      <span
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: 'var(--accent-bright)' }}
      >
        {children}
      </span>
    </div>
  )
}

export function IconBadge3D({
  icon: Icon,
  size = 52,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  size?: number
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: 'linear-gradient(145deg, rgba(212,88,10,0.88) 0%, rgba(15,10,4,1) 80%)',
        boxShadow: [
          '0 0 0 1px rgba(255,255,255,0.12) inset',
          '0 -1px 0 rgba(0,0,0,0.6) inset',
          '0 1px 0 rgba(255,255,255,0.08) inset',
          '0 8px 24px rgba(212,88,10,0.45)',
          '0 0 40px 4px rgba(212,88,10,0.12)',
        ].join(', '),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon
        className="text-white"
        style={{
          width: size * 0.38,
          height: size * 0.38,
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
        }}
      />
    </div>
  )
}
