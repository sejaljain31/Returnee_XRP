import client from './client'
import type {
  Return,
  ReturnListResponse,
  CreateReturnRequest,
  UpdateReturnDetailsRequest,
  CheckoutResponse,
} from '../types'

export const returnsApi = {
  list: async (): Promise<ReturnListResponse> => {
    const response = await client.get<ReturnListResponse>('/returns')
    return response.data
  },

  get: async (id: string): Promise<Return> => {
    const response = await client.get<Return>(`/returns/${id}`)
    return response.data
  },

  create: async (data: CreateReturnRequest): Promise<Return> => {
    const response = await client.post<Return>('/returns', data)
    return response.data
  },

  updateDetails: async (id: string, data: UpdateReturnDetailsRequest): Promise<Return> => {
    const response = await client.patch<Return>(`/returns/${id}`, data)
    return response.data
  },

  uploadLabel: async (id: string, packageIndex: number, file: File): Promise<Return> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await client.post<Return>(`/returns/${id}/packages/${packageIndex}/label`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  createCheckout: async (id: string): Promise<CheckoutResponse> => {
    const response = await client.post<CheckoutResponse>(`/returns/${id}/checkout`)
    return response.data
  },
}
