import { Sparkles } from 'lucide-react'
import type { Message } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import GroundingWarning from './GroundingWarning'

interface MessageBubbleProps {
  message: Message
  streaming?: boolean
}

export default function MessageBubble({ message, streaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const showWarning =
    !isUser &&
    typeof message.grounding_score === 'number' &&
    message.grounding_score < 0.6

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mr-3 mt-1"
          style={{ background: 'var(--accent-subtle)' }}
        >
          <Sparkles className="h-3.5 w-3.5" style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}
      <div className="max-w-[75%]">
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={
            isUser
              ? {
                  background: 'var(--accent-subtle)',
                  border: '1px solid var(--border-accent)',
                  borderRadius: '16px 16px 4px 16px',
                  color: 'var(--text-primary)',
                }
              : {
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px 16px 16px 4px',
                  color: 'var(--text-primary)',
                }
          }
        >
          {message.content}
          {streaming && (
            <span
              className="ml-0.5 animate-pulse font-bold"
              style={{ color: 'var(--accent-primary)' }}
            >
              |
            </span>
          )}
        </div>
        {showWarning && <GroundingWarning />}
        <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)' }}>
          {formatRelativeTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
