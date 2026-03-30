import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { returnsApi } from '../api/returns'

interface Props {
  returnId: string
}

export default function PaymentButton({ returnId }: Props) {
  const [error, setError] = useState('')

  const checkoutMutation = useMutation({
    mutationFn: () => returnsApi.createCheckout(returnId),
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.checkout_url
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { detail?: string } } }
      setError(error.response?.data?.detail || 'Failed to create checkout session')
    },
  })

  const handleClick = () => {
    setError('')
    checkoutMutation.mutate()
  }

  return (
    <div>
      {error && <div className="alert alert-error mb-2">{error}</div>}
      <button
        onClick={handleClick}
        className="btn btn-primary"
        disabled={checkoutMutation.isPending}
        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
      >
        {checkoutMutation.isPending ? 'Redirecting...' : 'Pay $5'}
      </button>
      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
        Secure payment via Stripe. Supports cards, Apple Pay, and Google Pay.
      </p>
    </div>
  )
}
