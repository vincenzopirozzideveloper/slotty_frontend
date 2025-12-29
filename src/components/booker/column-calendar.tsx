"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { TimeSlot } from "@/lib/api/public-calendar"
import { Loader2 } from "lucide-react"

interface ColumnCalendarProps {
  startDate: Date
  days?: number
  slots: Record<string, TimeSlot[]>
  onSlotClick: (date: string, slot: TimeSlot) => void
  selectedSlot?: { date: string; time: string } | null
  timeFormat: "12h" | "24h"
  isLoading?: boolean
}

export function ColumnCalendar({
  startDate,
  days = 7,
  slots,
  onSlotClick,
  selectedSlot,
  timeFormat,
  isLoading = false,
}: ColumnCalendarProps) {
  // Generate dates for the columns
  const dates = useMemo(() => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      return date
    })
  }, [startDate, days])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours, 10)

    if (timeFormat === "12h") {
      const period = hour >= 12 ? "pm" : "am"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes}${period}`
    }
    return time
  }

  const formatDayHeader = (date: Date) => {
    const dayName = date.toLocaleDateString("default", { weekday: "short" })
    const dayNum = date.getDate()
    const month = date.toLocaleDateString("default", { month: "short" })
    const isToday = new Date().toDateString() === date.toDateString()

    return { dayName, dayNum, month, isToday }
  }

  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isSlotSelected = (date: Date, slot: TimeSlot) => {
    if (!selectedSlot) return false
    const dateKey = getDateKey(date)
    return selectedSlot.date === dateKey && selectedSlot.time === slot.start_time
  }

  return (
    <div className="h-full flex flex-col">
      {/* Column headers */}
      <div className="flex border-b">
        {dates.map((date) => {
          const { dayName, dayNum, month, isToday } = formatDayHeader(date)
          return (
            <div
              key={date.toISOString()}
              className="flex-1 text-center py-4 border-r last:border-r-0"
            >
              <div className="text-sm text-muted-foreground uppercase">{dayName}</div>
              <div
                className={cn(
                  "text-2xl font-semibold mt-1",
                  isToday &&
                    "bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center mx-auto"
                )}
              >
                {dayNum}
              </div>
              <div className="text-xs text-muted-foreground uppercase mt-1">{month}</div>
            </div>
          )
        })}
      </div>

      {/* Slots columns */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-full">
          {dates.map((date) => {
            const dateKey = getDateKey(date)
            const daySlots = slots[dateKey] || []
            const availableSlots = daySlots.filter((s) => s.status === "available")

            return (
              <div
                key={date.toISOString()}
                className="flex-1 border-r last:border-r-0 p-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No available slots
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableSlots.map((slot) => {
                      const selected = isSlotSelected(date, slot)
                      return (
                        <button
                          key={slot.id || slot.start_time}
                          onClick={() => onSlotClick(dateKey, slot)}
                          className={cn(
                            "w-full py-2.5 px-3 text-sm font-medium rounded-md border transition-colors",
                            "hover:border-primary hover:bg-primary/5",
                            selected
                              ? "border-primary bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                              : "border-input bg-background"
                          )}
                        >
                          {formatTime(slot.start_time)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
