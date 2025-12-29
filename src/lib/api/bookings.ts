import { api } from "./client"

export interface Booking {
  id: number
  name: string
  email: string
  phone: string | null
  message: string | null
  status: "pending" | "approved" | "rejected"
  requested_date: string
  requested_date_end: string | null
  requested_start_time: string | null
  requested_end_time: string | null
  is_range: boolean
  is_time_slot: boolean
  admin_notes: string | null
  responded_at: string | null
  created_at: string
}

export interface BookingsStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface BookingsPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface BookingsResponse {
  bookings: Booking[]
  pagination: BookingsPagination
  stats: BookingsStats
}

export interface BookingActionRequest {
  admin_notes?: string
}

export const bookingsApi = {
  async getBookings(status?: string, page: number = 1): Promise<BookingsResponse> {
    const params = new URLSearchParams()
    if (status) params.append("status", status)
    if (page > 1) params.append("page", page.toString())

    const response = await api.get<BookingsResponse>(`/bookings?${params.toString()}`)
    return response.data
  },

  async getBooking(id: number): Promise<Booking> {
    const response = await api.get<{ booking: Booking }>(`/bookings/${id}`)
    return response.data.booking
  },

  async approveBooking(id: number, data?: BookingActionRequest): Promise<Booking> {
    const response = await api.put<{ booking: Booking }>(`/bookings/${id}/approve`, data || {})
    return response.data.booking
  },

  async rejectBooking(id: number, data?: BookingActionRequest): Promise<Booking> {
    const response = await api.put<{ booking: Booking }>(`/bookings/${id}/reject`, data || {})
    return response.data.booking
  },

  async deleteBooking(id: number): Promise<void> {
    await api.delete(`/bookings/${id}`)
  },
}
