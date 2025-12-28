import { api, getCsrfToken } from "./client"

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  plan: "free" | "pro" | "max"
  plan_label: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const authApi = {
  // Get CSRF cookie (required before login/register)
  async csrf() {
    await getCsrfToken()
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<void> {
    await getCsrfToken()
    await api.post("/login", credentials)
  },

  // Register user
  async register(data: RegisterData): Promise<void> {
    await getCsrfToken()
    await api.post("/register", data)
  },

  // Logout user
  async logout(): Promise<void> {
    await api.post("/logout")
  },

  // Get current user
  async getUser(): Promise<User> {
    const response = await api.get<User>("/user")
    return response.data
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    await getCsrfToken()
    await api.post("/forgot-password", { email })
  },

  // Reset password
  async resetPassword(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<void> {
    await getCsrfToken()
    await api.post("/reset-password", data)
  },
}
