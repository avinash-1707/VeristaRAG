'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import DocumentList from '@/components/documents/DocumentList'
import UploadDialog from '@/components/documents/UploadDialog'

export default function DocumentsPage() {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest mb-2"
            style={{
              borderColor: 'var(--border-accent)',
              background: 'var(--accent-subtle)',
              color: 'var(--accent-bright)',
            }}
          >
            Documents
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Your Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Upload and manage documents for RAG queries
          </p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150"
          style={{
            background: 'linear-gradient(to bottom, #d4580a, #b84208)',
            color: 'var(--text-on-accent)',
            boxShadow: '0 0 20px 4px #d4580a60, inset 0 1px 0 #ffffff20',
          }}
        >
          <PlusCircle className="h-4 w-4" />
          New Document
        </button>
      </div>

      <DocumentList />

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}
