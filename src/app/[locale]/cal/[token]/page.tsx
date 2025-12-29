"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { EventMeta } from "@/components/booker/event-meta"
import { BookerDatePicker } from "@/components/booker/booker-date-picker"
import { AvailableTimeSlots, TimeFormatToggle } from "@/components/booker/available-time-slots"
import { BookerHeader, type BookerLayout } from "@/components/booker/booker-header"
import { WeeklyCalendar } from "@/components/booker/weekly-calendar"
import { ColumnCalendar } from "@/components/booker/column-calendar"
import { BookingForm } from "@/components/booker/booking-form"
import { BookingModal } from "@/components/booker/booking-modal"
import {
  publicCalendarApi,
  type CalendarInfo,
  type MonthAvailability,
  type TimeSlot,
  type BookingRequestData,
} from "@/lib/api/public-calendar"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type BookerState = "selecting_date" | "selecting_time" | "booking"

export default function PublicBookingPage() {
  const params = useParams()
  const token = params.token as string

  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calendar, setCalendar] = useState<CalendarInfo | null>(null)
  const [monthData, setMonthData] = useState<MonthAvailability | null>(null)
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([])
  const [weekSlots, setWeekSlots] = useState<Record<string, TimeSlot[]>>({})
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Selection state
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bookerState, setBookerState] = useState<BookerState>("selecting_date")

  // UI state
  const [layout, setLayout] = useState<BookerLayout>("month")
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingModalOpen, setBookingModalOpen] = useState(false)

  // Timezone - defaults to browser timezone
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [timezone, setTimezone] = useState(browserTimezone)

  // Fetch initial calendar data
  useEffect(() => {
    async function fetchCalendar() {
      try {
        setLoading(true)
        const data = await publicCalendarApi.getCalendar(token)
        setCalendar(data.calendar)
        setMonthData(data.current_month)
      } catch (err) {
        setError("Calendar not found or expired")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCalendar()
  }, [token])

  // Fetch day slots when date is selected (for time_slots mode in month view)
  useEffect(() => {
    async function fetchDaySlots() {
      if (!selectedDate || calendar?.booking_mode !== "time_slots" || layout !== "month") return

      try {
        setSlotsLoading(true)
        const data = await publicCalendarApi.getDay(token, selectedDate)
        setDaySlots(data.slots)
      } catch (err) {
        console.error("Failed to fetch day slots:", err)
        setDaySlots([])
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchDaySlots()
  }, [selectedDate, calendar?.booking_mode, token, layout])

  // Fetch week slots for week/column view
  useEffect(() => {
    async function fetchWeekSlots() {
      if (layout === "month" || !calendar) return

      const startDate = selectedDate ? new Date(selectedDate) : new Date()
      const dates: string[] = []

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        dates.push(date.toISOString().split("T")[0])
      }

      try {
        setSlotsLoading(true)
        const results = await Promise.all(
          dates.map(async (date) => {
            try {
              const data = await publicCalendarApi.getDay(token, date)
              return { date, slots: data.slots }
            } catch {
              return { date, slots: [] }
            }
          })
        )

        const slotsMap: Record<string, TimeSlot[]> = {}
        results.forEach(({ date, slots }) => {
          slotsMap[date] = slots
        })
        setWeekSlots(slotsMap)
      } catch (err) {
        console.error("Failed to fetch week slots:", err)
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchWeekSlots()
  }, [layout, selectedDate, calendar, token])

  // Update booker state based on selection (only for month view)
  useEffect(() => {
    // In week/column view, we use modal instead of inline booking form
    if (layout !== "month") {
      setBookerState("selecting_date")
      return
    }

    if (selectedSlot || (calendar?.booking_mode === "full_day" && selectedDate)) {
      setBookerState("booking")
    } else if (selectedDate) {
      setBookerState("selecting_time")
    } else {
      setBookerState("selecting_date")
    }
  }, [selectedDate, selectedSlot, calendar?.booking_mode, layout])

  const handleMonthChange = useCallback(
    async (year: number, month: number) => {
      try {
        const data = await publicCalendarApi.getMonth(token, year, month)
        setMonthData(data.month)
      } catch (err) {
        console.error("Failed to fetch month:", err)
      }
    },
    [token]
  )

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)

    // For full_day mode, go directly to booking
    if (calendar?.booking_mode === "full_day") {
      setBookerState("booking")
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setBookerState("booking")
  }

  const handleBookingSubmit = async (data: BookingRequestData) => {
    try {
      setIsSubmitting(true)
      await publicCalendarApi.submitBookingRequest(token, data)
      toast.success("Booking request submitted!")
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to submit booking")
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelBooking = () => {
    setSelectedSlot(null)
    if (calendar?.booking_mode === "full_day") {
      setSelectedDate(null)
    }
    setBookerState(selectedDate ? "selecting_time" : "selecting_date")
  }

  // Calculate date range for header
  const getDateRange = () => {
    const start = selectedDate ? new Date(selectedDate) : new Date()
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return { start, end }
  }

  const handleNavigate = (direction: "prev" | "next") => {
    const days = layout === "week" ? 7 : 3
    const current = selectedDate ? new Date(selectedDate) : new Date()
    current.setDate(current.getDate() + (direction === "next" ? days : -days))
    setSelectedDate(current.toISOString().split("T")[0])
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0])
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error || !calendar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Calendar Not Found</h1>
          <p className="text-muted-foreground">{error || "This calendar link is invalid or has expired."}</p>
        </div>
      </div>
    )
  }

  const isTimeSlotsMode = calendar.booking_mode === "time_slots"

  // Mobile layout (single column)
  const renderMobileLayout = () => (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Meta info */}
        <EventMeta
          calendar={calendar}
          selectedTimeslot={selectedSlot ? `${selectedDate}T${selectedSlot.start_time}` : null}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />

        {/* Calendar */}
        <div className="border-t pt-6">
          <BookerDatePicker
            monthData={monthData}
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Time slots (when date selected and time_slots mode) */}
        {isTimeSlotsMode && selectedDate && bookerState !== "booking" && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">
                {new Date(selectedDate).toLocaleDateString("default", {
                  weekday: "short",
                  day: "numeric",
                })}
              </span>
              <TimeFormatToggle value={timeFormat} onChange={setTimeFormat} />
            </div>
            <AvailableTimeSlots
              date={selectedDate}
              slots={daySlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
              isLoading={slotsLoading}
              timeFormat={timeFormat}
            />
          </div>
        )}

        {/* Booking form (when slot selected) */}
        {bookerState === "booking" && (
          <div className="border-t pt-6">
            <BookingForm
              selectedDate={selectedDate!}
              selectedSlot={selectedSlot}
              bookingMode={calendar.booking_mode}
              onSubmit={handleBookingSubmit}
              onCancel={handleCancelBooking}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Powered by Slotty
          </a>
        </div>
      </div>
    </div>
  )

  // Desktop layout (grid)
  const renderDesktopLayout = () => (
    <div className={cn(
      "min-h-screen bg-muted/30",
      layout === "month" && "flex items-center justify-center p-4",
      layout !== "month" && "p-0"
    )}>
      <div
        className={cn(
          "bg-background overflow-hidden",
          layout === "month" && "rounded-lg border shadow-lg grid max-w-5xl w-full grid-cols-[320px_1fr_280px]",
          layout !== "month" && "h-screen w-full grid grid-cols-[320px_1fr]"
        )}
        style={{ minHeight: layout === "month" ? "500px" : "100vh" }}
      >
        {/* Left Sidebar - Event Meta */}
        <div className={cn("border-r", layout !== "month" && "h-full overflow-y-auto")}>
          <EventMeta
            calendar={calendar}
            selectedTimeslot={selectedSlot ? `${selectedDate}T${selectedSlot.start_time}` : null}
            timezone={timezone}
            onTimezoneChange={setTimezone}
          />

          {/* DatePicker in sidebar for week/column view */}
          {layout !== "month" && (
            <div className="px-3 py-3 border-t">
              <BookerDatePicker
                monthData={monthData}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                onMonthChange={handleMonthChange}
                compact
              />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className={cn("flex flex-col min-h-0", layout !== "month" && "h-full")}>
          {/* Header */}
          {layout !== "month" && (
            <BookerHeader
              layout={layout}
              onLayoutChange={setLayout}
              dateRange={getDateRange()}
              onNavigate={handleNavigate}
              onToday={handleToday}
              timeFormat={timeFormat}
              onTimeFormatChange={setTimeFormat}
            />
          )}

          {/* Content */}
          <div className={cn("flex-1 overflow-hidden", layout !== "month" && "h-full")}>
            {bookerState === "booking" ? (
              <BookingForm
                selectedDate={selectedDate!}
                selectedSlot={selectedSlot}
                bookingMode={calendar.booking_mode}
                onSubmit={handleBookingSubmit}
                onCancel={handleCancelBooking}
                isSubmitting={isSubmitting}
              />
            ) : layout === "month" ? (
              <div className="p-5 h-full">
                <BookerDatePicker
                  monthData={monthData}
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                  onMonthChange={handleMonthChange}
                />
              </div>
            ) : layout === "week" ? (
              <WeeklyCalendar
                startDate={selectedDate ? new Date(selectedDate) : new Date()}
                days={7}
                slots={weekSlots}
                onSlotClick={(date, time) => {
                  setSelectedDate(date)
                  // Find slot that contains this time
                  const daySlotsList = weekSlots[date] || []
                  const slot = daySlotsList.find(
                    (s) => s.status === "available" && s.start_time <= time && s.end_time > time
                  )
                  if (slot) {
                    // Create a virtual slot for the clicked hour (no id - it's virtual)
                    const clickedSlot: TimeSlot = {
                      start_time: time,
                      end_time: `${String(parseInt(time.split(":")[0]) + 1).padStart(2, "0")}:00`,
                      status: "available",
                    }
                    setSelectedSlot(clickedSlot)
                    setBookingModalOpen(true)
                  }
                }}
                selectedSlot={
                  selectedSlot
                    ? { date: selectedDate!, time: selectedSlot.start_time }
                    : null
                }
                timeFormat={timeFormat}
              />
            ) : layout === "column" ? (
              <ColumnCalendar
                startDate={selectedDate ? new Date(selectedDate) : new Date()}
                days={7}
                slots={weekSlots}
                onSlotClick={(date, slot) => {
                  setSelectedDate(date)
                  setSelectedSlot(slot)
                  setBookingModalOpen(true)
                }}
                selectedSlot={
                  selectedSlot
                    ? { date: selectedDate!, time: selectedSlot.start_time }
                    : null
                }
                timeFormat={timeFormat}
                isLoading={slotsLoading}
              />
            ) : null}
          </div>
        </div>

        {/* Right Sidebar - Time Slots (only in month view) */}
        {layout === "month" && isTimeSlotsMode && bookerState !== "booking" && (
          <div className="border-l p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString("default", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "Select a date"}
              </span>
              <TimeFormatToggle value={timeFormat} onChange={setTimeFormat} />
            </div>
            <AvailableTimeSlots
              date={selectedDate}
              slots={daySlots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSlotSelect}
              isLoading={slotsLoading}
              timeFormat={timeFormat}
            />
          </div>
        )}

        {/* Layout toggle for month view */}
        {layout === "month" && (
          <div className="absolute top-4 right-4">
            <BookerHeader
              layout={layout}
              onLayoutChange={setLayout}
              dateRange={getDateRange()}
              onNavigate={handleNavigate}
              onToday={handleToday}
              timeFormat={timeFormat}
              onTimeFormatChange={setTimeFormat}
            />
          </div>
        )}
      </div>

      {/* Booking Modal for week/column view */}
      <BookingModal
        open={bookingModalOpen}
        onOpenChange={(open) => {
          setBookingModalOpen(open)
          if (!open) {
            setSelectedSlot(null)
          }
        }}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        bookingMode={calendar.booking_mode}
        onSubmit={handleBookingSubmit}
        isSubmitting={isSubmitting}
        calendarName={calendar.name}
      />

      {/* Footer - only in month view */}
      {layout === "month" && (
        <div className="fixed bottom-4 left-0 right-0 text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Slotty
          </a>
        </div>
      )}
    </div>
  )

  // Return statement with responsive layout switching
  return (
    <>
      {/* Mobile layout - visible on small screens */}
      <div className="block md:hidden">
        {renderMobileLayout()}
      </div>
      {/* Desktop layout - visible on medium screens and up */}
      <div className="hidden md:block h-screen">
        {renderDesktopLayout()}
      </div>
    </>
  )
}
