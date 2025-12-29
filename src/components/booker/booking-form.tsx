"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import type { TimeSlot, BookingRequestData } from "@/lib/api/public-calendar"

interface BookingFormProps {
  selectedDate: string
  selectedEndDate?: string | null
  selectedSlot?: TimeSlot | null
  bookingMode: "full_day" | "time_slots"
  onSubmit: (data: BookingRequestData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function BookingForm({
  selectedDate,
  selectedEndDate,
  selectedSlot,
  bookingMode,
  onSubmit,
  onCancel,
  isSubmitting,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const bookingData: BookingRequestData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: formData.message || undefined,
      ...(bookingMode === "full_day"
        ? {
            requested_date: selectedDate,
            requested_date_end: selectedEndDate || undefined,
          }
        : {
            date: selectedDate,
            time_slot_id: selectedSlot?.id,
            start_time: selectedSlot?.start_time || "",
            end_time: selectedSlot?.end_time || "",
          }),
    }

    try {
      await onSubmit(bookingData)
      setSuccess(true)
    } catch (error) {
      // Error handled by parent
    }
  }

  const formatSelectedTime = () => {
    const date = new Date(selectedDate)
    const dateStr = date.toLocaleDateString("default", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    if (bookingMode === "time_slots" && selectedSlot) {
      return `${dateStr} at ${selectedSlot.start_time} - ${selectedSlot.end_time}`
    }

    // For full_day mode with date range
    if (bookingMode === "full_day" && selectedEndDate && selectedEndDate !== selectedDate) {
      const endDate = new Date(selectedEndDate)
      const endDateStr = endDate.toLocaleDateString("default", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      return `${dateStr} - ${endDateStr}`
    }

    return dateStr
  }

  if (success) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Booking Request Sent!</h2>
        <p className="text-muted-foreground mb-4">
          We&apos;ll get back to you soon to confirm your booking.
        </p>
        <p className="text-sm text-muted-foreground">{formatSelectedTime()}</p>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="font-semibold">Complete your booking</h2>
          <p className="text-sm text-muted-foreground">{formatSelectedTime()}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div className="space-y-2">
            <Label htmlFor="name">Your name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Additional notes (optional)</Label>
            <textarea
              id="message"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any special requests or notes..."
            />
          </div>
        </div>

        <div className="pt-4 border-t mt-auto">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
