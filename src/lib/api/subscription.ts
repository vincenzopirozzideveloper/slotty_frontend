import { api } from "./client"

export interface SubscriptionBookings {
  used: number
  limit: number | null
  remaining: number | null
  unlimited: boolean
}

export interface SubscriptionFeatures {
  basic_calendar: boolean
  email_notifications: boolean
  custom_branding: boolean
  social_image_download: boolean
  priority_support: boolean
  api_access: boolean
  white_label: boolean
}

export interface SubscriptionInfo {
  status: string
  created_at: string
}

export interface Subscription {
  plan: "free" | "pro" | "max"
  plan_label: string
  is_paid: boolean
  is_on_grace_period: boolean
  ends_at: string | null
  bookings: SubscriptionBookings
  features: SubscriptionFeatures
  subscription: SubscriptionInfo | null
}

export interface Plan {
  id: "free" | "pro" | "max"
  name: string
  price_monthly: number
  price_yearly: number
  bookings_per_month: number | null
  unlimited_bookings: boolean
  features: Record<string, boolean>
}

export interface PlansResponse {
  plans: Plan[]
}

export interface CheckoutRequest {
  plan: "pro" | "max"
  cycle: "monthly" | "yearly"
}

export interface CheckoutResponse {
  checkout_url: string
}

export interface PortalResponse {
  portal_url: string
}

export const subscriptionApi = {
  async getSubscription(): Promise<Subscription> {
    const response = await api.get<Subscription>("/subscription")
    return response.data
  },

  async getPlans(): Promise<Plan[]> {
    const response = await api.get<PlansResponse>("/subscription/plans")
    return response.data.plans
  },

  async createCheckout(data: CheckoutRequest): Promise<string> {
    const response = await api.post<CheckoutResponse>("/subscription/checkout", data)
    return response.data.checkout_url
  },

  async getBillingPortal(): Promise<string> {
    const response = await api.get<PortalResponse>("/subscription/portal")
    return response.data.portal_url
  },
}
