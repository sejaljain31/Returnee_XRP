import type { ReturnStatus } from '../types'

interface Props {
  currentStatus: ReturnStatus
}

const STATUSES: { key: ReturnStatus; label: string }[] = [
  { key: 'CREATED', label: 'Created' },
  { key: 'PAID', label: 'Paid' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'DROPPED_OFF', label: 'Dropped Off' },
  { key: 'COMPLETED', label: 'Completed' },
]

export default function ReturnStatusTimeline({ currentStatus }: Props) {
  const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
      {STATUSES.map((status, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <div key={status.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '80px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCompleted ? 'var(--success)' : 'var(--gray-200)',
                  color: isCompleted ? 'white' : 'var(--gray-500)',
                  fontWeight: 500,
                  border: isCurrent ? '3px solid var(--primary)' : 'none',
                }}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: isCompleted ? 'var(--gray-900)' : 'var(--gray-500)',
                  fontWeight: isCurrent ? 600 : 400,
                  textAlign: 'center',
                }}
              >
                {status.label}
              </span>
            </div>
            {index < STATUSES.length - 1 && (
              <div
                style={{
                  width: '40px',
                  height: '2px',
                  background: index < currentIndex ? 'var(--success)' : 'var(--gray-200)',
                  marginBottom: '1.5rem',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
