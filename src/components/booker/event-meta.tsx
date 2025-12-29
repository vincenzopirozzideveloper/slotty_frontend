"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TimezoneSelect } from "@/components/timezone-select"
import {
  CheckSquare,
  Clock,
  MapPin,
  Globe,
} from "lucide-react"
import type { CalendarInfo } from "@/lib/api/public-calendar"
import { getTimezoneCity } from "@/lib/dayjs"

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
  const owner = calendar.owner
  const settings = calendar.settings
  const initials = owner?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?"

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

        {/* Timezone selector */}
        {onTimezoneChange ? (
          <TimezoneSelect
            value={timezone}
            onChange={onTimezoneChange}
          />
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{getTimezoneCity(timezone)}</span>
          </div>
        )}
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
