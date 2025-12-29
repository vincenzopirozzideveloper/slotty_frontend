"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Globe, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTimezoneOffset, getTimezoneCity, BROWSER_TIMEZONE } from "@/lib/dayjs"

// Common timezones sorted by offset
const TIMEZONES = [
  "Pacific/Honolulu",      // -10:00
  "America/Anchorage",     // -9:00
  "America/Los_Angeles",   // -8:00
  "America/Denver",        // -7:00
  "America/Chicago",       // -6:00
  "America/New_York",      // -5:00
  "America/Sao_Paulo",     // -3:00
  "Atlantic/Azores",       // -1:00
  "UTC",                   // +0:00
  "Europe/London",         // +0:00
  "Europe/Paris",          // +1:00
  "Europe/Rome",           // +1:00
  "Europe/Berlin",         // +1:00
  "Europe/Madrid",         // +1:00
  "Europe/Amsterdam",      // +1:00
  "Europe/Brussels",       // +1:00
  "Europe/Zurich",         // +1:00
  "Europe/Vienna",         // +1:00
  "Europe/Warsaw",         // +1:00
  "Europe/Prague",         // +1:00
  "Europe/Stockholm",      // +1:00
  "Europe/Athens",         // +2:00
  "Europe/Helsinki",       // +2:00
  "Europe/Bucharest",      // +2:00
  "Europe/Istanbul",       // +3:00
  "Europe/Moscow",         // +3:00
  "Asia/Dubai",            // +4:00
  "Asia/Karachi",          // +5:00
  "Asia/Kolkata",          // +5:30
  "Asia/Dhaka",            // +6:00
  "Asia/Bangkok",          // +7:00
  "Asia/Singapore",        // +8:00
  "Asia/Hong_Kong",        // +8:00
  "Asia/Shanghai",         // +8:00
  "Asia/Tokyo",            // +9:00
  "Asia/Seoul",            // +9:00
  "Australia/Sydney",      // +10:00/+11:00
  "Pacific/Auckland",      // +12:00/+13:00
]

interface TimezoneSelectProps {
  value: string
  onChange: (timezone: string) => void
  className?: string
  showIcon?: boolean
}

export function TimezoneSelect({ value, onChange, className, showIcon = true }: TimezoneSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter timezones based on search
  const filteredTimezones = useMemo(() => {
    if (!search) return TIMEZONES
    const searchLower = search.toLowerCase()
    return TIMEZONES.filter((tz) => {
      const city = getTimezoneCity(tz).toLowerCase()
      const full = tz.toLowerCase()
      return city.includes(searchLower) || full.includes(searchLower)
    })
  }, [search])

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (tz: string) => {
    onChange(tz)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm hover:text-foreground transition-colors w-full"
      >
        {showIcon && <Globe className="h-4 w-4 text-muted-foreground" />}
        <span className="flex-1 text-left">{getTimezoneCity(value)}</span>
        <ChevronDown className={cn(
          "h-3 w-3 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-background border rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezone..."
              className="w-full px-3 py-2 text-sm bg-muted/50 rounded-lg border-0 outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Timezone list with scrollbar */}
          <div className="max-h-[280px] overflow-y-auto">
            {filteredTimezones.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                No timezones found
              </div>
            ) : (
              filteredTimezones.map((tz) => {
                const offset = getTimezoneOffset(tz)
                const isSelected = value === tz

                return (
                  <button
                    key={tz}
                    type="button"
                    onClick={() => handleSelect(tz)}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-sm flex items-center justify-between hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/30"
                    )}
                  >
                    <span className="text-foreground">
                      {tz} <span className="text-muted-foreground">GMT {offset}</span>
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-foreground flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
