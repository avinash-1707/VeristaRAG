'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { X, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { createDocumentApi, getSignatureApi } from '@/lib/api'

const UploadDropzone = dynamic(() => import('./UploadDropzone'), { ssr: false })

interface UploadDialogProps {
  open: boolean
  onClose: () => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

interface FileUpload {
  file: File
  state: UploadState
  error?: string
  progress: number
}

function fileType(file: File): string {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.name.endsWith('.docx')) return 'docx'
  return 'txt'
}

export default function UploadDialog({ open, onClose }: UploadDialogProps) {
  const qc = useQueryClient()
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [uploading, setUploading] = useState(false)

  function setUploadState(index: number, patch: Partial<FileUpload>) {
    setUploads((prev) => prev.map((u, i) => (i === index ? { ...u, ...patch } : u)))
  }

  async function uploadFile(file: File, index: number): Promise<void> {
    setUploadState(index, { state: 'uploading', progress: 10 })

    const sigResult = await getSignatureApi(file.name)
    if ('error' in sigResult) {
      setUploadState(index, { state: 'error', error: sigResult.error })
      return
    }
    const sig = sigResult.data
    setUploadState(index, { progress: 30 })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('signature', sig.signature)
    formData.append('timestamp', String(sig.timestamp))
    formData.append('api_key', sig.api_key)
    formData.append('folder', sig.folder)

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`,
      { method: 'POST', body: formData },
    )

    if (!cloudRes.ok) {
      setUploadState(index, { state: 'error', error: 'Cloudinary upload failed' })
      return
    }

    const cloudData = (await cloudRes.json()) as { public_id: string }
    setUploadState(index, { progress: 70 })

    const docResult = await createDocumentApi({
      filename: file.name,
      storage_key: cloudData.public_id,
      file_type: fileType(file),
      file_size_bytes: file.size,
    })

    if ('error' in docResult) {
      setUploadState(index, { state: 'error', error: docResult.error })
      return
    }

    setUploadState(index, { state: 'done', progress: 100 })
  }

  async function handleFiles(files: File[]): Promise<void> {
    const newUploads: FileUpload[] = files.map((f) => ({
      file: f,
      state: 'idle',
      progress: 0,
    }))
    const startIndex = uploads.length
    setUploads((prev) => [...prev, ...newUploads])
    setUploading(true)

    await Promise.all(files.map((f, i) => uploadFile(f, startIndex + i)))

    setUploading(false)
    qc.invalidateQueries({ queryKey: ['documents'] })
  }

  function handleClose() {
    if (!uploading) {
      setUploads([])
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl border p-6"
        style={{
          background: 'var(--bg-surface-elevated)',
          borderColor: 'var(--border-strong)',
          boxShadow: '0 0 60px 12px var(--glow-soft)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-widest mb-2"
              style={{
                borderColor: 'var(--border-accent)',
                background: 'var(--accent-subtle)',
                color: 'var(--accent-bright)',
              }}
            >
              Upload
            </div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Add Documents
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <UploadDropzone onFiles={handleFiles} disabled={uploading} />

        {uploads.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploads.map((u, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--bg-card-inner)' }}
              >
                {u.state === 'done' && (
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--state-success)' }} />
                )}
                {u.state === 'error' && (
                  <AlertTriangle className="h-4 w-4 shrink-0" style={{ color: 'var(--state-error)' }} />
                )}
                {(u.state === 'uploading' || u.state === 'idle') && (
                  <Loader2
                    className="h-4 w-4 shrink-0 animate-spin"
                    style={{ color: u.state === 'uploading' ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {u.file.name}
                  </p>
                  {u.error && (
                    <p className="text-xs" style={{ color: 'var(--state-error)' }}>{u.error}</p>
                  )}
                  {u.state === 'uploading' && (
                    <div
                      className="mt-1 h-1 rounded-full"
                      style={{ background: 'var(--border-default)' }}
                    >
                      <div
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          width: `${u.progress}%`,
                          background: 'var(--accent-primary)',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
