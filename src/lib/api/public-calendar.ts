import { publicApi } from "./client"

export interface CalendarInfo {
  name: string
  description: string | null
  booking_mode: "full_day" | "time_slots"
  owner?: {
    name: string
    avatar: string | null
    title: string | null
    location: string | null
  }
  settings?: {
    requires_confirmation: boolean
    slot_duration_minutes: number | null
    timezone: string | null
  }
}

export interface DayAvailability {
  date: string
  status: "available" | "booked" | "blocked" | "past"
  slots_count?: number
}

export interface MonthAvailability {
  year: number
  month: number
  days: DayAvailability[]
}

export interface TimeSlot {
  id: number
  start_time: string
  end_time: string
  status: "available" | "booked"
  formatted: string
}

export interface DaySlots {
  date: string
  slots: TimeSlot[]
}

export interface BookingRequestData {
  requested_date: string
  requested_date_end?: string
  date?: string
  start_time?: string
  end_time?: string
  time_slot_id?: number
  name: string
  email: string
  phone?: string
  message?: string
}

export const publicCalendarApi = {
  async getCalendar(token: string): Promise<{ calendar: CalendarInfo; current_month: MonthAvailability }> {
    const response = await publicApi.get(`/calendar/${token}`)
    return response.data
  },

  async getMonth(token: string, year: number, month: number): Promise<{ booking_mode: string; month: MonthAvailability }> {
    const response = await publicApi.get(`/calendar/${token}/month/${year}/${month}`)
    return response.data
  },

  async getDay(token: string, date: string): Promise<DaySlots> {
    const response = await publicApi.get(`/calendar/${token}/day/${date}`)
    return response.data
  },

  async submitBookingRequest(token: string, data: BookingRequestData): Promise<{ message: string; request_id: number }> {
    const response = await publicApi.post(`/calendar/${token}/booking-request`, data)
    return response.data
  },
}
