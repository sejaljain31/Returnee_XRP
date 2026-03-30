import client from './client'
import type { AuthResponse, User } from '../types'

export const authApi = {
  signup: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/signup', { email, password })
    return response.data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await client.post<AuthResponse>('/auth/login', { email, password })
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await client.get<User>('/auth/me')
    return response.data
  },
}
