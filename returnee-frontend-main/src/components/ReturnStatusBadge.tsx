import type { ReturnStatus } from '../types'

interface Props {
  status: ReturnStatus
}

export default function ReturnStatusBadge({ status }: Props) {
  const className = `badge badge-${status.toLowerCase()}`
  
  const labels: Record<ReturnStatus, string> = {
    CREATED: 'Created',
    PAID: 'Paid',
    SCHEDULED: 'Scheduled',
    PICKED_UP: 'Picked Up',
    DROPPED_OFF: 'Dropped Off',
    COMPLETED: 'Completed',
  }
  
  return <span className={className}>{labels[status]}</span>
}
