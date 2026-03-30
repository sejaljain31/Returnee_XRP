export type ReturnStatus = 
  | 'CREATED' 
  | 'PAID' 
  | 'SCHEDULED' 
  | 'PICKED_UP' 
  | 'DROPPED_OFF' 
  | 'COMPLETED'

export type DropoffType = 'PICKUP' | 'DROPOFF'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type ProofType = 'RECEIPT' | 'PHOTO'

export interface User {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface Return {
  id: string
  user_id: string
  carrier: string
  dropoff_type: DropoffType
  deadline_date: string | null
  status: ReturnStatus
  packages: ReturnPackage[]
  created_at: string
  updated_at: string
}

export interface ReturnListResponse {
  items: Return[]
  total: number
}

export interface ReturnPackage {
  carrier: string
  deadline_date: string
  label_url?: string | null
}

export interface Payment {
  id: string
  return_id: string
  amount_cents: number
  currency: string
  status: PaymentStatus
  stripe_checkout_session_id: string | null
  created_at: string
}

export interface Proof {
  id: string
  return_id: string
  proof_type: ProofType
  file_url: string
  created_at: string
}

export interface CheckoutResponse {
  checkout_url: string
  session_id: string
}

export interface AuthResponse {
  user: User
  token: {
    access_token: string
    token_type: string
  }
}

export interface CreateReturnRequest {
  packages: CreateReturnPackageRequest[]
}

export interface CreateReturnPackageRequest {
  carrier: string
  deadline_date: string
}

export interface UpdateReturnDetailsRequest {
  packages: CreateReturnPackageRequest[]
}
