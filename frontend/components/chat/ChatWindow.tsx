'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { BookOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Citation, Message, StreamEvent } from '@/lib/types'
import MessageBubble from './MessageBubble'
import CitationPanel from './CitationPanel'
import ChatInput from './ChatInput'

interface ChatWindowProps {
  sessionId: string
  sessionTitle: string
  documentIds: string[]
  initialMessages: Message[]
}

interface StreamingState {
  content: string
  done: boolean
}

export default function ChatWindow({
  sessionId,
  sessionTitle,
  documentIds,
  initialMessages,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [streaming, setStreaming] = useState<StreamingState | null>(null)
  const [activeCitations, setActiveCitations] = useState<Citation[]>([])
  const [activeGrounding, setActiveGrounding] = useState<number>(0)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleMessageClick = useCallback((msg: Message) => {
    if (!msg.citations?.length) return
    if (activeMessageId === msg.id) {
      setActiveCitations([])
      setActiveGrounding(0)
      setActiveMessageId(null)
      return
    }
    setActiveCitations(msg.citations)
    setActiveGrounding(msg.grounding_score ?? 0)
    setActiveMessageId(msg.id)
  }, [activeMessageId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleSubmit = useCallback(
    async (question: string): Promise<void> => {
      const userMsg: Message = {
        id: `tmp-${Date.now()}`,
        role: 'user',
        content: question,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setStreaming({ content: '', done: false })
      setActiveCitations([])
      setActiveGrounding(0)
      setLoading(true)

      const res = await fetch('/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question,
          document_ids: documentIds,
        }),
      })

      if (!res.ok || !res.body) {
        setStreaming(null)
        setLoading(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (!payload) continue

          let event: StreamEvent
          try {
            event = JSON.parse(payload) as StreamEvent
          } catch {
            continue
          }

          if (event.token) {
            setStreaming((prev) => ({
              content: (prev?.content ?? '') + event.token,
              done: false,
            }))
          }

          if (event.done) {
            const assistantMsg: Message = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: event.answer ?? '',
              created_at: new Date().toISOString(),
              citations: event.citations,
              grounding_score: event.grounding_score,
              top_similarity_score: event.top_similarity_score,
            }
            setMessages((prev) => [...prev, assistantMsg])
            setStreaming(null)
            setActiveCitations(event.citations ?? [])
            setActiveGrounding(event.grounding_score ?? 0)
            setActiveMessageId(assistantMsg.id)
          }
        }
      }

      setLoading(false)
    },
    [sessionId, documentIds],
  )

  const showCitations = activeCitations.length > 0

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
        >
          <h2 className="text-sm font-semibold flex-1 truncate" style={{ color: 'var(--text-primary)' }}>
            {sessionTitle}
          </h2>
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-muted)',
            }}
          >
            {documentIds.length} doc{documentIds.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4">
          {messages.length === 0 && !streaming && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <BookOpen className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Ask a question
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Questions are answered from the selected documents only
                </p>
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isActive={activeMessageId === msg.id}
              onCitationsOpen={() => handleMessageClick(msg)}
            />
          ))}
          {streaming && !streaming.done && (
            <div className="flex justify-start mb-4">
              <div
                className="px-4 py-3 text-sm leading-relaxed max-w-[75%]"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '16px 16px 16px 4px',
                  color: 'var(--text-primary)',
                }}
              >
                {streaming.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p> }}>
                    {streaming.content}
                  </ReactMarkdown>
                ) : (
                  <span className="animate-pulse" style={{ color: 'var(--text-muted)' }}>
                    Thinking…
                  </span>
                )}
                <span className="ml-0.5 animate-pulse font-bold" style={{ color: 'var(--accent-primary)' }}>
                  |
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <ChatInput onSubmit={handleSubmit} disabled={loading} />
      </div>

      {/* Citation panel */}
      {showCitations && (
        <CitationPanel citations={activeCitations} groundingScore={activeGrounding} />
      )}
    </div>
  )
}
