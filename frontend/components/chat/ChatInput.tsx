'use client'

import { Send } from 'lucide-react'
import { useRef, useState } from 'react'

interface ChatInputProps {
  onSubmit: (question: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const q = value.trim()
    if (!q || disabled) return
    setValue('')
    onSubmit(q)
  }

  return (
    <div
      className="px-4 py-4 border-t"
      style={{ borderColor: 'var(--border-default)', background: 'var(--bg-surface)' }}
    >
      <div className="flex items-end gap-3">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a question about your documents…"
          disabled={disabled}
          className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] disabled:opacity-50"
          style={{
            background: 'var(--bg-card-inner)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-primary)',
            maxHeight: '120px',
          }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 120) + 'px'
          }}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="p-3 rounded-lg transition-all duration-150 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(to bottom, #d4580a, #b84208)',
            boxShadow: value.trim() ? '0 0 16px 2px #d4580a60' : 'none',
          }}
          aria-label="Send"
        >
          <Send className="h-4 w-4" style={{ color: '#fff' }} />
        </button>
      </div>
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
