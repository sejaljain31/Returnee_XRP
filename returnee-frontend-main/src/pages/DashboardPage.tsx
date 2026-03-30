import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { returnsApi } from '../api/returns'
import ReturnCreateForm from '../components/ReturnCreateForm'
import ReturnStatusBadge from '../components/ReturnStatusBadge'
import type { Return } from '../types'

export default function DashboardPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['returns'],
    queryFn: returnsApi.list,
  })

  const handleCreated = () => {
    setShowCreateForm(false)
    queryClient.invalidateQueries({ queryKey: ['returns'] })
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
      <div className="flex justify-between items-center mb-4">
        <h1>My Returns</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : '+ New Return'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card mb-4">
          <h2 style={{ marginBottom: '1rem' }}>Create New Return</h2>
          <ReturnCreateForm onSuccess={handleCreated} />
        </div>
      )}

      {returns.length === 0 ? (
        <div className="card text-center">
          <p style={{ color: 'var(--gray-500)' }}>
            No returns yet. Create your first return to get started.
          </p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Carriers</th>
                <th>Type</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {returns.map((ret: Return) => (
                <tr key={ret.id}>
                  <td>
                    <code>{ret.id.slice(0, 8)}</code>
                  </td>
                  <td>
                    {Array.from(new Set(ret.packages.map((p) => p.carrier))).join(', ')}
                  </td>
                  <td>Pickup</td>
                  <td>
                    {ret.deadline_date
                      ? `${new Date(ret.deadline_date).toLocaleDateString("en-US", { timeZone: "UTC" })}${
                          ret.packages.length > 1
                            ? ` (+${ret.packages.length - 1} more)`
                            : ''
                        }`
                      : '-'}
                  </td>
                  <td>
                    <ReturnStatusBadge status={ret.status} />
                  </td>
                  <td>
                    {new Date(ret.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/returns/${ret.id}`} className="btn btn-secondary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
