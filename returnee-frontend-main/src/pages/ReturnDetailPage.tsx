import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { returnsApi } from '../api/returns'
import ReturnStatusBadge from '../components/ReturnStatusBadge'
import ReturnStatusTimeline from '../components/ReturnStatusTimeline'
import PaymentButton from '../components/PaymentButton'
import LabelUpload from '../components/LabelUpload'
import ReturnCreateForm from '../components/ReturnCreateForm'
import { useState } from 'react'

export default function ReturnDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const paymentStatus = searchParams.get('payment')

  const { data: returnData, isLoading, error } = useQuery({
    queryKey: ['return', id],
    queryFn: () => returnsApi.get(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return <div className="text-center mt-4">Loading return details...</div>
  }

  if (error || !returnData) {
    return <div className="alert alert-error">Failed to load return</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>
        Return #{returnData.id.slice(0, 8)}
      </h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
        Created on {new Date(returnData.created_at).toLocaleDateString()}
      </p>

      {paymentStatus === 'success' && (
        <div className="alert alert-success mb-4">
          Payment successful! Your return is now being processed.
        </div>
      )}

      {paymentStatus === 'cancelled' && (
        <div className="alert alert-error mb-4">
          Payment was cancelled. Please try again when you're ready.
        </div>
      )}

      <div className="card mb-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Status</label>
            <div className="mt-1">
              <ReturnStatusBadge status={returnData.status} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Carriers</label>
            <p style={{ fontWeight: 500 }}>
              {Array.from(new Set(returnData.packages.map((p) => p.carrier))).join(', ')}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Type</label>
            <p style={{ fontWeight: 500 }}>Pickup</p>
          </div>
          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Deadlines</label>
            <p style={{ fontWeight: 500 }}>
              {returnData.packages.length
                ? returnData.packages
                    .map((p) => new Date(p.deadline_date).toLocaleDateString("en-US", { timeZone: "UTC" }))
                    .join(', ')
                : 'No deadline'}
            </p>
          </div>
        </div>
      </div>

      {returnData.status === 'CREATED' && (
        <div className="card mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ marginBottom: 0 }}>Package details</h2>
            {!isEditing ? (
              <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditing(false)
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {isEditing ? (
            <ReturnCreateForm
              returnId={returnData.id}
              initialPackages={returnData.packages}
              onSuccess={() => {
                setIsEditing(false)
                queryClient.invalidateQueries({ queryKey: ['return', id] })
              }}
            />
          ) : (
            <div style={{ color: 'var(--gray-500)' }}>
              {returnData.packages.map((p, idx) => (
                <div key={idx} style={{ marginBottom: '1.5rem', padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: '4px' }}>
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--gray-700)' }}>Package {idx + 1}:</strong> {p.carrier} —{' '}
                    {new Date(p.deadline_date).toLocaleDateString("en-US", { timeZone: "UTC" })}
                  </p>
                  
                  <div className="mt-2" style={{ marginTop: '0.5rem' }}>
                    {p.label_url && returnData.status !== 'CREATED' && (
                      <div style={{ marginBottom: '1rem' }}>
                        <a
                          href={p.label_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          View Label
                        </a>
                      </div>
                    )}
                    
                    {returnData.status === 'CREATED' && (
                      <div>
                        <LabelUpload
                          returnId={returnData.id}
                          packageIndex={idx}
                          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['return', id] })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card mb-4">
        <h2 style={{ marginBottom: '1rem' }}>Status Timeline</h2>
        <ReturnStatusTimeline currentStatus={returnData.status} />
      </div>

      {returnData.status === 'CREATED' && returnData.packages.every(p => p.label_url) && (
        <div className="card mb-4">
          <h2 style={{ marginBottom: '1rem' }}>Payment</h2>
          <p style={{ marginBottom: '1rem', color: 'var(--gray-500)' }}>
            Complete payment to schedule your return pickup/dropoff.
          </p>
          <PaymentButton returnId={returnData.id} />
        </div>
      )}
    </div>
  )
}
