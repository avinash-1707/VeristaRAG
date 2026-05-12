'use client'

import { FolderUp } from 'lucide-react'
import { useCallback, useState } from 'react'

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  disabled?: boolean
}

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const ACCEPTED_EXT = '.pdf,.docx,.txt'

export default function UploadDropzone({ onFiles, disabled }: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (disabled) return
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        ACCEPTED_TYPES.includes(f.type),
      )
      if (files.length) onFiles(files)
    },
    [disabled, onFiles],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(files)
    e.target.value = ''
  }

  return (
    <label
      className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200"
      style={{
        borderColor: dragging ? 'var(--accent-primary)' : 'var(--border-strong)',
        background: dragging ? 'var(--accent-subtle)' : 'var(--bg-card-inner)',
        boxShadow: dragging ? '0 0 40px 8px var(--glow-soft)' : '',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <FolderUp
        className="h-10 w-10"
        style={{ color: dragging ? 'var(--accent-primary)' : 'var(--text-muted)' }}
      />
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Drop files here or click to browse
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          PDF, DOCX, or TXT — up to 20 MB
        </p>
      </div>
      <input
        type="file"
        className="sr-only"
        accept={ACCEPTED_EXT}
        multiple
        onChange={handleChange}
      />
    </label>
  )
}
