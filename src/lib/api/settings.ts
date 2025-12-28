import { api } from "./client"
import type { User } from "@/contexts/auth-context"

export interface UpdateProfileRequest {
  name: string
  email: string
}

export interface UpdateProfileResponse {
  message: string
  user: User
}

export interface UpdatePasswordRequest {
  current_password: string
  password: string
  password_confirmation: string
}

export interface UpdatePasswordResponse {
  message: string
}

export interface DeleteAccountRequest {
  password: string
}

export interface DeleteAccountResponse {
  message: string
}

export const settingsApi = {
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await api.put<UpdateProfileResponse>("/user/profile", data)
    return response.data
  },

  async updatePassword(data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
    const response = await api.put<UpdatePasswordResponse>("/user/password", data)
    return response.data
  },

  async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    const response = await api.delete<DeleteAccountResponse>("/user", { data })
    return response.data
  },
}
