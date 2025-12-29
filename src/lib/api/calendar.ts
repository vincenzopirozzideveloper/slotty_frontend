import { api } from "./client"

export interface TimeBlock {
  start: string
  end: string
}

export interface DaySchedule {
  day_of_week: number
  day_name: string
  is_available: boolean
  time_blocks: TimeBlock[]
  total_minutes: number
}

export interface CalendarInfo {
  id: number
  name: string
  slug: string
  is_active: boolean
  setup_completed: boolean
  booking_mode: "full_day" | "time_slots" | null
  slot_duration_minutes: number | null
  timezone: string | null
  public_url: string | null
}

export interface DateOverride {
  id: number
  date: string
  is_available: boolean
  time_blocks: TimeBlock[]
  reason: string | null
}

export interface UpdateScheduleRequest {
  schedule: {
    day_of_week: number
    is_available: boolean
    time_blocks: TimeBlock[]
  }[]
}

export interface CreateOverrideRequest {
  date: string
  is_available: boolean
  time_blocks: TimeBlock[]
  reason?: string
}

export const calendarApi = {
  async getCalendar(): Promise<CalendarInfo | null> {
    const response = await api.get<{ calendar: CalendarInfo | null }>("/calendar")
    return response.data.calendar
  },

  async getSchedule(): Promise<DaySchedule[]> {
    const response = await api.get<{ schedule: DaySchedule[] }>("/calendar/schedule")
    return response.data.schedule
  },

  async updateSchedule(data: UpdateScheduleRequest): Promise<DaySchedule[]> {
    const response = await api.put<{ schedule: DaySchedule[] }>("/calendar/schedule", data)
    return response.data.schedule
  },

  async getOverrides(): Promise<DateOverride[]> {
    const response = await api.get<{ overrides: DateOverride[] }>("/calendar/overrides")
    return response.data.overrides
  },

  async createOverride(data: CreateOverrideRequest): Promise<DateOverride> {
    const response = await api.post<{ override: DateOverride }>("/calendar/overrides", data)
    return response.data.override
  },

  async deleteOverride(id: number): Promise<void> {
    await api.delete(`/calendar/overrides/${id}`)
  },
}
