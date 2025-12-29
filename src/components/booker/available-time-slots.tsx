"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import type { TimeSlot } from "@/lib/api/public-calendar"

interface AvailableTimeSlotsProps {
  date: string | null
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  isLoading?: boolean
  timeFormat: "12h" | "24h"
}

export function AvailableTimeSlots({
  date,
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  timeFormat,
}: AvailableTimeSlotsProps) {
  const formattedDate = useMemo(() => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString("default", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }, [date])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    if (timeFormat === "12h") {
      const period = hours >= 12 ? "pm" : "am"
      const displayHours = hours % 12 || 12
      return `${displayHours}:${String(minutes).padStart(2, "0")}${period}`
    }
    return time
  }

  const availableSlots = slots.filter((slot) => slot.status === "available")

  if (!date) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a date to see available times</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No available times for this date</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="pb-3 border-b mb-3">
        <h3 className="font-semibold">{formattedDate}</h3>
      </div>

      {/* Slots list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {availableSlots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id
          return (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className={cn(
                "w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                "flex items-center justify-center gap-2",
                "hover:border-primary hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSelected ? "bg-primary-foreground" : "bg-emerald-500"
                )}
              />
              {formatTime(slot.start_time)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface TimeFormatToggleProps {
  value: "12h" | "24h"
  onChange: (format: "12h" | "24h") => void
}

export function TimeFormatToggle({ value, onChange }: TimeFormatToggleProps) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden">
      <button
        onClick={() => onChange("12h")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors",
          value === "12h"
            ? "bg-primary text-primary-foreground"
            : "bg-background hover:bg-muted"
        )}
      >
        12h
      </button>
      <button
        onClick={() => onChange("24h")}
        className={cn(
          "px-3 py-1.5 text-sm font-medium transition-colors",
          value === "24h"
            ? "bg-primary text-primary-foreground"
            : "bg-background hover:bg-muted"
        )}
      >
        24h
      </button>
    </div>
  )
}
