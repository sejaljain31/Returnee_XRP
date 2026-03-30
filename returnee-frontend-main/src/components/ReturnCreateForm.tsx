import { useMemo, useState, FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { returnsApi } from '../api/returns'
import type { CreateReturnPackageRequest, CreateReturnRequest } from '../types'

interface Props {
  onSuccess: () => void
  returnId?: string
  initialPackages?: CreateReturnPackageRequest[]
}

export default function ReturnCreateForm({
  onSuccess,
  returnId,
  initialPackages,
}: Props) {
  const [error, setError] = useState('')

  const carriers = useMemo(() => ['UPS', 'FedEx', 'USPS', 'DHL', 'Amazon', 'Other'], [])
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const [packages, setPackages] = useState<CreateReturnPackageRequest[]>(
    initialPackages?.length
      ? initialPackages
      : [
          {
            carrier: carriers[0],
            deadline_date: '',
          },
        ]
  )

  const createMutation = useMutation({
    mutationFn: (data: CreateReturnRequest) => {
      if (returnId) return returnsApi.updateDetails(returnId, data)
      return returnsApi.create(data)
    },
    onSuccess: () => {
      onSuccess()
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Failed to save return')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
  
    // Client-side enforcement (server also enforces).
    if (packages.length < 1 || packages.length > 5) {
      setError('You can include between 1 and 5 packages.')
      return
    }

    if (packages.some((p) => !p.deadline_date)) {
      setError('Return deadline is required for every package.')
      return
    }

    createMutation.mutate({ packages })
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <p style={{ color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
          Flat fee: <strong>$5</strong> for up to 5 packages.
        </p>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          Deadlines are required per item. You can edit before payment.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.125rem' }}>Packages</h2>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setPackages((prev) => {
              if (prev.length >= 5) return prev
              return [
                ...prev,
                {
                  carrier: carriers[0],
                  deadline_date: '',
                },
              ]
            })
          }
          disabled={packages.length >= 5}
        >
          + Add package
        </button>
      </div>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {packages.map((pkg, idx) => (
          <div key={idx} className="card" style={{ padding: '1rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Package {idx + 1}</h3>
              {packages.length > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={() => setPackages((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label htmlFor={`carrier-${idx}`}>Carrier</label>
              <select
                id={`carrier-${idx}`}
                value={pkg.carrier}
                onChange={(e) => {
                  const next = [...packages]
                  next[idx] = { ...next[idx], carrier: e.target.value }
                  setPackages(next)
                }}
                required
              >
                {carriers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor={`deadline-${idx}`}>Return deadline (required)</label>
              <input
                id={`deadline-${idx}`}
                type="date"
                value={pkg.deadline_date}
                onChange={(e) => {
                  const next = [...packages]
                  next[idx] = { ...next[idx], deadline_date: e.target.value }
                  setPackages(next)
                }}
                min={today}
                required
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={createMutation.isPending}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {createMutation.isPending
          ? returnId
            ? 'Saving changes...'
            : 'Creating...'
          : returnId
            ? 'Save changes'
            : 'Create return'}
      </button>
    </form>
  )
}
