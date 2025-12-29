"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MonthAvailability, DayAvailability } from "@/lib/api/public-calendar"

interface BookerDatePickerProps {
  monthData: MonthAvailability | null
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onMonthChange: (year: number, month: number) => void
  isLoading?: boolean
  compact?: boolean
}

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

export function BookerDatePicker({
  monthData,
  selectedDate,
  onSelectDate,
  onMonthChange,
  isLoading,
  compact = false,
}: BookerDatePickerProps) {
  const today = new Date()
  const currentYear = monthData?.year || today.getFullYear()
  const currentMonth = monthData?.month || today.getMonth() + 1

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleString("default", {
    month: "long",
  })

  // Create calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const startDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days: (DayAvailability | null)[] = []

    // Add empty slots for days before the first day of month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayData = monthData?.days.find((d) => d.date === dateStr)
      days.push(
        dayData || {
          date: dateStr,
          status: "blocked" as const,
        }
      )
    }

    return days
  }, [monthData, currentYear, currentMonth])

  const handlePrevMonth = () => {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear
    onMonthChange(prevYear, prevMonth)
  }

  const handleNextMonth = () => {
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear
    onMonthChange(nextYear, nextMonth)
  }

  const isDateSelectable = (day: DayAvailability | null) => {
    if (!day) return false
    return day.status === "available"
  }

  const getDayClasses = (day: DayAvailability | null) => {
    if (!day) return "invisible"

    const isSelected = selectedDate === day.date
    const isToday = day.date === today.toISOString().split("T")[0]
    const isAvailable = day.status === "available"
    const isBooked = day.status === "booked"
    const isPast = day.status === "past"

    return cn(
      "aspect-square rounded-md font-medium transition-colors",
      "flex items-center justify-center relative",
      compact ? "text-xs" : "text-sm",
      isSelected && "bg-primary text-primary-foreground",
      !isSelected && isAvailable && "bg-muted hover:bg-primary/20 cursor-pointer",
      !isSelected && isBooked && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
      !isSelected && isPast && "text-muted-foreground/50",
      !isSelected && day.status === "blocked" && "text-muted-foreground/30",
      isToday && !isSelected && "ring-1 ring-primary ring-offset-1"
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-4")}>
        <h2 className={cn(compact ? "text-sm" : "text-base", "font-semibold")}>
          <span className="font-bold">{monthName}</span> {currentYear}
        </h2>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(compact ? "h-6 w-6" : "h-8 w-8")}
            onClick={handlePrevMonth}
            disabled={isLoading}
          >
            <ChevronLeft className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(compact ? "h-6 w-6" : "h-8 w-8")}
            onClick={handleNextMonth}
            disabled={isLoading}
          >
            <ChevronRight className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className={cn("grid grid-cols-7 mb-1", compact ? "gap-0.5" : "gap-1")}>
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className={cn(
              "flex items-center justify-center font-medium text-muted-foreground",
              compact ? "text-[10px] h-6" : "text-xs h-8"
            )}
          >
            {compact ? day.charAt(0) : day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={cn("grid grid-cols-7", compact ? "gap-0.5" : "gap-1")}>
        {calendarDays.map((day, index) => (
          <button
            key={index}
            disabled={!isDateSelectable(day)}
            onClick={() => day && isDateSelectable(day) && onSelectDate(day.date)}
            className={getDayClasses(day)}
          >
            {day && (
              <>
                {new Date(day.date).getDate()}
                {day.slots_count !== undefined && day.slots_count > 0 && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  )
}
