import { api } from "./client"

export type BookingMode = "full_day" | "time_slots"

export interface TimeBlock {
  start: string
  end: string
}

export interface DaySchedule {
  day_of_week: number
  day_name: string
  is_available: boolean
  time_blocks: TimeBlock[]
}

export interface SetupStatus {
  setup_completed: boolean
  has_calendar: boolean
  booking_mode: BookingMode | null
}

export interface SetupDefaults {
  weekly_schedule: Record<number, DaySchedule>
  slot_duration: number
  slot_buffer: number
  advance_booking_days: number
  min_notice_hours: number
}

export interface SetupData {
  booking_mode: BookingMode
  weekly_schedule: DaySchedule[]
  slot_duration: number
  slot_buffer: number
  advance_booking_days: number
  min_notice_hours: number
  brand_name: string
  tagline?: string
  hero_text?: string
}

export const setupApi = {
  async getStatus(): Promise<SetupStatus> {
    const response = await api.get<SetupStatus>("/setup/status")
    return response.data
  },

  async getDefaults(): Promise<SetupDefaults> {
    const response = await api.get<SetupDefaults>("/setup/defaults")
    return response.data
  },

  async complete(data: SetupData): Promise<{ message: string; setup_completed: boolean }> {
    const response = await api.post<{ message: string; setup_completed: boolean }>("/setup/complete", data)
    return response.data
  },
}
