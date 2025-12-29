import { api } from "./client"

export interface PublicToken {
  id: number
  name: string
  token: string
  public_url: string
  is_active: boolean
  is_expired: boolean
  expires_at: string | null
  created_at: string
}

export interface CreateTokenRequest {
  name?: string
  expires_at?: string
}

export const tokensApi = {
  async getTokens(): Promise<{ tokens: PublicToken[] }> {
    const response = await api.get("/tokens")
    return response.data
  },

  async createToken(data?: CreateTokenRequest): Promise<{ token: PublicToken; message: string }> {
    const response = await api.post("/tokens", data || {})
    return response.data
  },

  async regenerateToken(id: number): Promise<{ token: PublicToken; message: string }> {
    const response = await api.put(`/tokens/${id}/regenerate`)
    return response.data
  },

  async toggleToken(id: number): Promise<{ token: PublicToken; message: string }> {
    const response = await api.put(`/tokens/${id}/toggle`)
    return response.data
  },

  async deleteToken(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/tokens/${id}`)
    return response.data
  },
}
