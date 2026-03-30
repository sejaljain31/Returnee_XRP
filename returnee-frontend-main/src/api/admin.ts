import client from './client'
import type { Return, ReturnListResponse, ReturnStatus, Proof, ProofType } from '../types'

export const adminApi = {
  listReturns: async (params?: { status?: ReturnStatus; deadline_before?: string }): Promise<ReturnListResponse> => {
    const response = await client.get<ReturnListResponse>('/admin/returns', { params })
    return response.data
  },

  getReturn: async (id: string): Promise<Return> => {
    const response = await client.get<Return>(`/admin/returns/${id}`)
    return response.data
  },

  updateStatus: async (id: string, status: ReturnStatus): Promise<Return> => {
    const response = await client.patch<Return>(`/admin/returns/${id}/status`, { status })
    return response.data
  },

  uploadProof: async (id: string, file: File, proofType: ProofType): Promise<Proof> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await client.post<Proof>(
      `/admin/returns/${id}/proof?proof_type=${proofType}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },
}
