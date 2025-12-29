import { api } from "./client"

export interface DashboardStats {
  total_bookings: number
  pending_bookings: number
  approved_bookings: number
  rejected_bookings: number
  total_customers: number
}

export interface RecentBooking {
  id: number
  name: string
  email: string
  status: "pending" | "approved" | "rejected"
  requested_date: string
  requested_date_end: string | null
  created_at: string
}

export interface UpcomingBooking {
  id: number
  name: string
  email: string
  requested_date: string
  requested_date_end: string | null
  requested_start_time: string | null
  requested_end_time: string | null
}

export interface DashboardResponse {
  stats: DashboardStats
  recent_bookings: RecentBooking[]
  upcoming_bookings: UpcomingBooking[]
}

export const dashboardApi = {
  async getDashboard(): Promise<DashboardResponse> {
    const response = await api.get<DashboardResponse>("/dashboard")
    return response.data
  },
}
