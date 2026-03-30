import { useState, ChangeEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { returnsApi } from '../api/returns'

interface Props {
  returnId: string
  packageIndex: number
  onSuccess: () => void
}

export default function LabelUpload({ returnId, packageIndex, onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const uploadMutation = useMutation({
    mutationFn: (file: File) => returnsApi.uploadLabel(returnId, packageIndex, file),
    onSuccess: () => {
      setFile(null)
      onSuccess()
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Failed to upload label')
    },
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or image file (JPEG, PNG, GIF)')
        return
      }
      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setError('')
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file)
    }
  }

  return (
    <div>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      
      <div className="form-group">
        <input
          type="file"
          accept=".pdf,image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
        />
      </div>
      
      {file && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ color: 'var(--gray-500)' }}>Selected: </span>
          {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}
      
      <button
        onClick={handleUpload}
        className="btn btn-primary"
        disabled={!file || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? 'Uploading...' : 'Upload Label'}
      </button>
    </div>
  )
}
