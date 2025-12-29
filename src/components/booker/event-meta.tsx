"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckSquare,
  Clock,
  MapPin,
  Globe,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react"
import type { CalendarInfo } from "@/lib/api/public-calendar"
import { cn } from "@/lib/utils"

const COMMON_TIMEZONES = [
  "Europe/Rome",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "America/Sao_Paulo",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
]

function getTimezoneOffset(tz: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find((p) => p.type === "timeZoneName")
    if (offsetPart) {
      // Convert "GMT+1" to "GMT +1:00" format
      const match = offsetPart.value.match(/GMT([+-]?)(\d+)?/)
      if (match) {
        const sign = match[1] || "+"
        const hours = match[2] || "0"
        return `GMT ${sign}${hours}:00`
      }
    }
    return "GMT +0:00"
  } catch {
    return "GMT +0:00"
  }
}

function formatTimezoneLabel(tz: string): string {
  const offset = getTimezoneOffset(tz)
  return `${tz} ${offset}`
}

interface EventMetaProps {
  calendar: CalendarInfo
  selectedTimeslot?: string | null
  timezone: string
  onTimezoneChange?: (tz: string) => void
}

export function EventMeta({
  calendar,
  selectedTimeslot,
  timezone,
  onTimezoneChange,
}: EventMetaProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const owner = calendar.owner
  const settings = calendar.settings
  const initials = owner?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?"

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative z-10 p-6" data-testid="event-meta">
      {/* Profile */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={owner?.avatar || undefined} alt={owner?.name || "Calendar"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-muted-foreground">{owner?.name || "Calendar"}</p>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold mb-1">{calendar.name}</h1>

      {/* Description */}
      {calendar.description && (
        <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
          {calendar.description}
        </p>
      )}

      {/* Meta Info */}
      <div className="space-y-3">
        {settings?.requires_confirmation && (
          <div className="flex items-center gap-2 text-sm">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <span>Requires confirmation</span>
          </div>
        )}

        {settings?.slot_duration_minutes && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{settings.slot_duration_minutes} min</span>
          </div>
        )}

        {owner?.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{owner.location}</span>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => onTimezoneChange && setIsOpen(!isOpen)}
            className={cn(
              "flex items-center gap-2 text-sm",
              onTimezoneChange && "cursor-pointer hover:text-foreground"
            )}
          >
            <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span>{timezone.split("/").pop()?.replace("_", " ")}</span>
            {onTimezoneChange && (
              isOpen ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )
            )}
          </button>

          {/* Cal.com style dropdown */}
          {isOpen && onTimezoneChange && (
            <div className="absolute left-0 top-full mt-1 w-64 bg-background border rounded-lg shadow-lg py-1 z-50">
              {COMMON_TIMEZONES.map((tz) => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => {
                    onTimezoneChange(tz)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-muted/50",
                    timezone === tz && "bg-muted/30"
                  )}
                >
                  <span>{formatTimezoneLabel(tz)}</span>
                  {timezone === tz && (
                    <Check className="h-4 w-4 text-foreground" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Timeslot */}
      {selectedTimeslot && (
        <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium">Selected Time</p>
          <p className="text-sm text-muted-foreground">
            {new Date(selectedTimeslot).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  )
}
