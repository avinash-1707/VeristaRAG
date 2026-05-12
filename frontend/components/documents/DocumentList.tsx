'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen } from 'lucide-react'
import { deleteDocumentApi, getDocumentsApi } from '@/lib/api'
import type { Document } from '@/lib/types'
import DocumentCard from './DocumentCard'

export default function DocumentList() {
  const qc = useQueryClient()
  const { data: result, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocumentsApi,
    refetchInterval: (query) => {
      const docs: Document[] =
        query.state.data && 'data' in query.state.data ? query.state.data.data : []
      return docs.some((d) => d.status === 'processing' || d.status === 'uploaded')
        ? 3000
        : false
    },
  })

  const documents: Document[] =
    result && 'data' in result ? result.data : []

  async function handleDelete(id: string): Promise<void> {
    await deleteDocumentApi(id)
    qc.invalidateQueries({ queryKey: ['documents'] })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" style={{ background: 'var(--bg-surface-hover)' }} />
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <BookOpen className="h-10 w-10" style={{ color: 'var(--text-muted)' }} />
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            No documents yet
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Upload a PDF, DOCX, or TXT to get started
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={handleDelete} />
      ))}
    </div>
  )
}
