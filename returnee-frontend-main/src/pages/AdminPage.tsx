import { useState, ChangeEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin'
import ReturnStatusBadge from '../components/ReturnStatusBadge'
import type { ReturnStatus, ProofType, Return } from '../types'

const ALL_STATUSES: ReturnStatus[] = [
  'CREATED',
  'PAID',
  'SCHEDULED',
  'PICKED_UP',
  'DROPPED_OFF',
  'COMPLETED',
]

// Valid next statuses for admin (based on state machine)
const NEXT_STATUSES: Record<ReturnStatus, ReturnStatus[]> = {
  CREATED: ['PAID', 'SCHEDULED'],
  PAID: ['SCHEDULED', 'PICKED_UP'],
  SCHEDULED: ['PICKED_UP', 'DROPPED_OFF'],
  PICKED_UP: ['DROPPED_OFF', 'COMPLETED'],
  DROPPED_OFF: ['COMPLETED'],
  COMPLETED: [],
}

export default function AdminPage() {
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('')
  const [deadlineFilter, setDeadlineFilter] = useState('')
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofType, setProofType] = useState<ProofType>('PHOTO')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-returns', statusFilter, deadlineFilter],
    queryFn: () =>
      adminApi.listReturns({
        status: statusFilter || undefined,
        deadline_before: deadlineFilter || undefined,
      }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReturnStatus }) =>
      adminApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] })
      setSelectedReturn(null)
    },
  })

  const uploadProofMutation = useMutation({
    mutationFn: ({ id, file, type }: { id: string; file: File; type: ProofType }) =>
      adminApi.uploadProof(id, file, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] })
      setProofFile(null)
      setSelectedReturn(null)
    },
  })

  const handleStatusChange = (returnId: string, newStatus: ReturnStatus) => {
    if (confirm(`Update status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ id: returnId, status: newStatus })
    }
  }

  const handleProofUpload = () => {
    if (selectedReturn && proofFile) {
      uploadProofMutation.mutate({
        id: selectedReturn.id,
        file: proofFile,
        type: proofType,
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
    }
  }

  if (isLoading) {
    return <div className="text-center mt-4">Loading returns...</div>
  }

  if (error) {
    return <div className="alert alert-error">Failed to load returns</div>
  }

  const returns = data?.items || []

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h1>

      <div className="card mb-4">
        <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReturnStatus | '')}
            >
              <option value="">All</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: '150px' }}>
            <label htmlFor="deadlineFilter">Deadline Before</label>
            <input
              id="deadlineFilter"
              type="date"
              value={deadlineFilter}
              onChange={(e) => setDeadlineFilter(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setStatusFilter('')
                setDeadlineFilter('')
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Returns ({returns.length})</h3>
        
        {returns.length === 0 ? (
          <p style={{ color: 'var(--gray-500)' }}>No returns found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Carriers</th>
                <th>Type</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret: Return) => (
                <tr key={ret.id}>
                  <td>
                    <code>{ret.id.slice(0, 8)}</code>
                  </td>
                  <td>
                    <code>{ret.user_id.slice(0, 8)}</code>
                  </td>
                  <td>{Array.from(new Set(ret.packages.map((p) => p.carrier))).join(', ')}</td>
                  <td>Pickup</td>
                  <td>
                    {ret.deadline_date ? (
                      <span
                        style={{
                          color:
                            new Date(ret.deadline_date) < new Date()
                              ? 'var(--error)'
                              : 'inherit',
                        }}
                      >
                        {new Date(ret.deadline_date).toLocaleDateString("en-US", { timeZone: "UTC" })}
                        {ret.packages.length > 1 ? ` (+${ret.packages.length - 1} more)` : ''}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <ReturnStatusBadge status={ret.status} />
                  </td>
                  <td>{new Date(ret.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {NEXT_STATUSES[ret.status].map((nextStatus) => (
                        <button
                          key={nextStatus}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleStatusChange(ret.id, nextStatus)}
                          disabled={updateStatusMutation.isPending}
                        >
                          → {nextStatus}
                        </button>
                      ))}
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        onClick={() => setSelectedReturn(ret)}
                      >
                        + Proof
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Proof Upload Modal */}
      {selectedReturn && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedReturn(null)}
        >
          <div
            className="card"
            style={{ minWidth: '400px', maxWidth: '90vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem' }}>
              Upload Proof for #{selectedReturn.id.slice(0, 8)}
            </h3>

            <div className="form-group">
              <label htmlFor="proofType">Proof Type</label>
              <select
                id="proofType"
                value={proofType}
                onChange={(e) => setProofType(e.target.value as ProofType)}
              >
                <option value="PHOTO">Photo</option>
                <option value="RECEIPT">Receipt</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="proofFile">File</label>
              <input
                id="proofFile"
                type="file"
                accept=".pdf,image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
              />
            </div>

            {proofFile && (
              <p style={{ marginBottom: '1rem', color: 'var(--gray-500)' }}>
                Selected: {proofFile.name}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleProofUpload}
                disabled={!proofFile || uploadProofMutation.isPending}
              >
                {uploadProofMutation.isPending ? 'Uploading...' : 'Upload'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedReturn(null)
                  setProofFile(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
