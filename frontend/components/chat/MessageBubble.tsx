'use client'

import { useState } from 'react'
import { BookOpen, Sparkles, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import GroundingWarning from './GroundingWarning'

interface MessageBubbleProps {
  message: Message
  streaming?: boolean
  isActive?: boolean
  onCitationsOpen?: () => void
}

export default function MessageBubble({ message, streaming, isActive, onCitationsOpen }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const hasCitations = !isUser && (message.citations?.length ?? 0) > 0
  const showWarning =
    !isUser &&
    typeof message.grounding_score === 'number' &&
    message.grounding_score < 0.2

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
          className={`px-4 py-3 text-sm leading-relaxed transition-all duration-150${hasCitations ? ' cursor-pointer' : ''}`}
          onClick={hasCitations ? onCitationsOpen : undefined}
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
                  border: `1px solid ${isActive ? 'var(--border-accent)' : 'var(--border-default)'}`,
                  borderRadius: '16px 16px 16px 4px',
                  color: 'var(--text-primary)',
                  boxShadow: isActive ? '0 0 0 2px var(--accent-subtle)' : undefined,
                }
          }
        >
          {isUser ? (
            <>
              {message.content}
              {streaming && (
                <span className="ml-0.5 animate-pulse font-bold" style={{ color: 'var(--accent-primary)' }}>|</span>
              )}
            </>
          ) : (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold" style={{ color: 'var(--text-primary)' }}>{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children, className }) => {
                    const isBlock = className?.includes('language-')
                    return isBlock ? (
                      <code
                        className="block rounded-md px-3 py-2 my-2 text-xs font-mono overflow-x-auto"
                        style={{ background: 'var(--bg-base)', color: 'var(--accent-bright)', border: '1px solid var(--border-default)' }}
                      >
                        {children}
                      </code>
                    ) : (
                      <code
                        className="rounded px-1 py-0.5 text-xs font-mono"
                        style={{ background: 'var(--bg-base)', color: 'var(--accent-bright)' }}
                      >
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => <pre className="overflow-x-auto">{children}</pre>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-1">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote
                      className="border-l-2 pl-3 my-2 italic"
                      style={{ borderColor: 'var(--border-accent)', color: 'var(--text-secondary)' }}
                    >
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-bright)' }} className="underline underline-offset-2">
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="my-2" style={{ borderColor: 'var(--border-default)' }} />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2">
                      <table className="text-xs w-full border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="px-2 py-1 text-left font-semibold border" style={{ borderColor: 'var(--border-default)', background: 'var(--bg-base)' }}>{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-2 py-1 border" style={{ borderColor: 'var(--border-default)' }}>{children}</td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {streaming && (
                <span className="ml-0.5 animate-pulse font-bold" style={{ color: 'var(--accent-primary)' }}>|</span>
              )}
            </>
          )}
        </div>
        {showWarning && <GroundingWarning />}
        <div className="flex items-center gap-2 mt-1 px-1">
          {hasCitations && (
            <button
              onClick={onCitationsOpen}
              className="inline-flex items-center gap-1 text-xs transition-colors"
              style={{ color: isActive ? 'var(--accent-bright)' : 'var(--text-muted)' }}
            >
              <BookOpen className="h-3 w-3" />
              {message.citations!.length} source{message.citations!.length !== 1 ? 's' : ''}
            </button>
          )}
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatRelativeTime(message.created_at)}
          </p>
          {!isUser && !streaming && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs transition-colors ml-auto"
              style={{ color: copied ? 'var(--state-success)' : 'var(--text-muted)' }}
              title="Copy message"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
