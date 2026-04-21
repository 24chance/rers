'use client'

import { useRef, useState, useCallback } from 'react'
import { UploadCloud, X, FileText, AlertCircle, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { applicationsApi } from '@/lib/api/applications.api'
import { DocumentType } from '@/types'
import type { ApplicationDocument } from '@/types'
import { toast } from '@/components/ui/toast'

const documentTypeOptions = Object.values(DocumentType).map((t) => ({
  value: t,
  label: t.replace(/_/g, ' '),
}))

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

interface PendingFile {
  file: File
  documentType: DocumentType
  uploading: boolean
  error?: string
}

export interface DocumentUploaderProps {
  applicationId: string
  existingDocuments?: ApplicationDocument[]
  onUploaded?: (doc: ApplicationDocument) => void
  onDeleted?: (docId: string) => void
  readOnly?: boolean
}

export function DocumentUploader({
  applicationId,
  existingDocuments = [],
  onUploaded,
  onDeleted,
  readOnly = false,
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])

  const addFiles = useCallback((files: FileList | File[]) => {
    const newPending: PendingFile[] = Array.from(files).map((file) => ({
      file,
      documentType: DocumentType.OTHER,
      uploading: false,
    }))
    setPendingFiles((prev) => [...prev, ...newPending])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  const removePending = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const setDocumentType = (index: number, type: DocumentType) => {
    setPendingFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, documentType: type } : f)),
    )
  }

  const uploadFile = async (index: number) => {
    const pending = pendingFiles[index]
    if (!pending) return

    setPendingFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, uploading: true, error: undefined } : f)),
    )

    try {
      const doc = await applicationsApi.uploadDocument(
        applicationId,
        pending.file,
        pending.documentType,
      )
      onUploaded?.(doc)
      setPendingFiles((prev) => prev.filter((_, i) => i !== index))
      toast.success(`Uploaded: ${pending.file.name}`)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Upload failed'
      setPendingFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, uploading: false, error: msg } : f)),
      )
      toast.error(`Failed to upload ${pending.file.name}: ${msg}`)
    }
  }

  const uploadAll = async () => {
    for (let i = 0; i < pendingFiles.length; i++) {
      await uploadFile(i)
    }
  }

  const handleDeleteExisting = async (docId: string) => {
    try {
      await applicationsApi.deleteDocument(applicationId, docId)
      onDeleted?.(docId)
      toast.success('Document removed.')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to delete document.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      {!readOnly && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors',
            isDragging
              ? 'border-rnec-teal bg-rnec-teal/5'
              : 'border-slate-300 hover:border-rnec-teal hover:bg-slate-50',
          )}
        >
          <UploadCloud className="h-8 w-8 text-slate-400 mb-3" />
          <p className="text-sm font-medium text-slate-700">
            Drag files here or <span className="text-rnec-teal">click to browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF, DOCX, images (max 20 MB each)</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
          />
        </div>
      )}

      {/* Pending files (not yet uploaded) */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Ready to upload ({pendingFiles.length})</p>
            <Button variant="primary" size="sm" onClick={uploadAll}>
              Upload All
            </Button>
          </div>
          {pendingFiles.map((pending, index) => (
            <div
              key={`${pending.file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <FileText className="h-5 w-5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{pending.file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(pending.file.size)}</p>
                {pending.error && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    {pending.error}
                  </p>
                )}
              </div>
              <Select
                options={documentTypeOptions}
                value={pending.documentType}
                onChange={(e) => setDocumentType(index, e.target.value as DocumentType)}
                className="w-40 text-xs"
                disabled={pending.uploading}
              />
              <Button
                variant="primary"
                size="sm"
                loading={pending.uploading}
                onClick={() => uploadFile(index)}
              >
                Upload
              </Button>
              <button
                type="button"
                onClick={() => removePending(index)}
                disabled={pending.uploading}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Existing uploaded documents */}
      {existingDocuments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Uploaded Documents ({existingDocuments.length})</p>
          {existingDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
            >
              <FileText className="h-5 w-5 text-rnec-teal shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{formatBytes(doc.size)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-rnec-teal">
                    {doc.documentType.replace(/_/g, ' ')}
                  </span>
                  {doc.version > 1 && (
                    <span className="text-xs text-slate-400">v{doc.version}</span>
                  )}
                </div>
              </div>
              {doc.path && (
                <a
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-rnec-teal transition-colors"
                  aria-label="Preview document"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleDeleteExisting(doc.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Delete document"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {existingDocuments.length === 0 && pendingFiles.length === 0 && readOnly && (
        <p className="text-sm text-slate-400 text-center py-4">No documents uploaded.</p>
      )}
    </div>
  )
}
