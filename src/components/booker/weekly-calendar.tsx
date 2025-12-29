"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TimeSlot } from "@/lib/api/public-calendar"

interface WeeklyCalendarProps {
  startDate: Date
  days: number
  slots: Record<string, TimeSlot[]>
  onSlotClick: (date: string, time: string) => void
  selectedSlot?: { date: string; time: string } | null
  timeFormat: "12h" | "24h"
  startHour?: number
  endHour?: number
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function WeeklyCalendar({
  startDate,
  days,
  slots,
  onSlotClick,
  selectedSlot,
  timeFormat,
  startHour = 0,
  endHour = 23,
}: WeeklyCalendarProps) {
  // Generate dates for the week
  const dates = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [startDate, days])

  // Filter hours to display
  const displayHours = HOURS.filter((h) => h >= startHour && h <= endHour)

  const formatHour = (hour: number) => {
    if (timeFormat === "12h") {
      const period = hour >= 12 ? "pm" : "am"
      const displayHour = hour % 12 || 12
      return `${displayHour}:00${period}`
    }
    return `${String(hour).padStart(2, "0")}:00`
  }

  const formatDayHeader = (date: Date) => {
    const dayName = date.toLocaleDateString("default", { weekday: "short" }).toUpperCase()
    const dayNum = date.getDate()
    const month = date.toLocaleDateString("default", { month: "short" }).toUpperCase()
    const isToday = new Date().toDateString() === date.toDateString()

    return { dayName, dayNum, month, isToday }
  }

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isSlotAvailable = (date: Date, hour: number) => {
    const dateKey = getDateKey(date)
    const daySlots = slots[dateKey] || []
    const timeStr = `${String(hour).padStart(2, "0")}:00`

    return daySlots.some(
      (slot) =>
        slot.status === "available" &&
        slot.start_time <= timeStr &&
        slot.end_time > timeStr
    )
  }

  const isSlotSelected = (date: Date, hour: number) => {
    if (!selectedSlot) return false
    const dateKey = getDateKey(date)
    const timeStr = `${String(hour).padStart(2, "0")}:00`
    return selectedSlot.date === dateKey && selectedSlot.time === timeStr
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with days */}
      <div className="flex border-b sticky top-0 bg-background z-10">
        {/* Time column header */}
        <div className="w-16 shrink-0" />

        {/* Day columns */}
        {dates.map((date) => {
          const { dayName, dayNum, month, isToday } = formatDayHeader(date)
          return (
            <div
              key={date.toISOString()}
              className="flex-1 text-center py-3 border-l"
            >
              <div className="text-xs text-muted-foreground">{dayName}</div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isToday &&
                    "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}
              >
                {dayNum}
              </div>
              {date.getDate() === 1 && (
                <div className="text-xs text-muted-foreground">{month}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Time labels column */}
          <div className="w-16 shrink-0">
            {displayHours.map((hour) => (
              <div
                key={hour}
                className="h-12 flex items-start justify-end pr-2 text-xs text-muted-foreground -translate-y-2"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns with slots */}
          {dates.map((date) => (
            <div key={date.toISOString()} className="flex-1 border-l">
              {displayHours.map((hour) => {
                const available = isSlotAvailable(date, hour)
                const selected = isSlotSelected(date, hour)
                const dateKey = getDateKey(date)

                return (
                  <div
                    key={hour}
                    onClick={() => {
                      if (available) {
                        onSlotClick(dateKey, `${String(hour).padStart(2, "0")}:00`)
                      }
                    }}
                    className={cn(
                      "h-12 border-b relative",
                      available
                        ? "bg-emerald-50 dark:bg-emerald-950/20 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                        : "bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.03)_4px,rgba(0,0,0,0.03)_8px)]",
                      selected && "ring-2 ring-primary ring-inset bg-primary/20"
                    )}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
