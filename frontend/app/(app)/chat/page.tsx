'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PlusCircle } from 'lucide-react'
import { createSessionApi, getDocumentsApi } from '@/lib/api'
import type { Document } from '@/lib/types'

function DocSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="w-full rounded-xl animate-pulse"
          style={{
            height: '60px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
          }}
        />
      ))}
    </div>
  )
}

export default function NewChatPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: docsResult, isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocumentsApi,
  })

  const readyDocs: Document[] =
    docsResult && 'data' in docsResult
      ? docsResult.data.filter((d) => d.status === 'ready')
      : []

  function toggleDoc(id: string) {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
  }

  async function handleCreate(): Promise<void> {
    if (!selectedDocs.length) {
      setError('Select at least one document')
      return
    }
    setCreating(true)
    setError(null)
    const result = await createSessionApi({
      title: title.trim() || 'New Chat',
      document_ids: selectedDocs,
    })
    setCreating(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    await queryClient.invalidateQueries({ queryKey: ['sessions'] })
    router.push(`/chat/${result.data.id}`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest mb-2"
            style={{
              borderColor: 'var(--border-accent)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-bright)',
            }}
          >
            New Chat
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Start a conversation
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Select documents to query, then ask anything
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Chat title (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Q3 Revenue Analysis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
              style={{
                background: 'var(--bg-card-inner)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--text-secondary)' }}>
              Select documents
            </label>
            {docsLoading ? (
              <DocSkeleton />
            ) : readyDocs.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                No ready documents. Upload and process documents first.
              </p>
            ) : (
              <div className="space-y-2">
                {readyDocs.map((doc) => {
                  const selected = selectedDocs.includes(doc.id)
                  return (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150"
                      style={{
                        background: selected ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                        borderColor: selected ? 'var(--border-accent)' : 'var(--border-default)',
                      }}
                    >
                      <div
                        className="h-4 w-4 rounded border shrink-0 flex items-center justify-center"
                        style={{
                          background: selected ? 'var(--accent-primary)' : 'transparent',
                          borderColor: selected ? 'var(--accent-primary)' : 'var(--border-strong)',
                        }}
                      >
                        {selected && (
                          <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 10 10">
                            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {doc.filename}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {doc.chunk_count} chunks
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--state-error)' }}>{error}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !selectedDocs.length}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(to bottom, #d4580a, #b84208)',
              color: 'var(--text-on-accent)',
              boxShadow: '0 0 20px 4px #d4580a60, inset 0 1px 0 #ffffff20',
            }}
          >
            <PlusCircle className="h-4 w-4" />
            {creating ? 'Creating…' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  )
}
