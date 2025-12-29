import { api } from "./client"

export interface Customer {
  email: string
  name: string
  phone: string | null
  total_bookings: number
  approved_bookings: number
  pending_bookings: number
  rejected_bookings: number
  first_booking_at: string
  last_booking_at: string
}

export interface CustomerBooking {
  id: number
  status: "pending" | "approved" | "rejected"
  requested_date: string
  requested_date_end: string | null
  requested_start_time: string | null
  requested_end_time: string | null
  message: string | null
  created_at: string
}

export interface CustomersStats {
  total: number
}

export interface CustomersPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface CustomersResponse {
  customers: Customer[]
  pagination: CustomersPagination
  stats: CustomersStats
}

export interface CustomerDetailResponse {
  customer: Customer
  bookings: CustomerBooking[]
}

export const customersApi = {
  async getCustomers(search?: string, page: number = 1): Promise<CustomersResponse> {
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (page > 1) params.append("page", page.toString())

    const response = await api.get<CustomersResponse>(`/customers?${params.toString()}`)
    return response.data
  },

  async getCustomer(email: string): Promise<CustomerDetailResponse> {
    const response = await api.get<CustomerDetailResponse>(`/customers/${encodeURIComponent(email)}`)
    return response.data
  },
}
