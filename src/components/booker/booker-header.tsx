"use client"

import { ChevronLeft, ChevronRight, Calendar, Grid3X3, Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TimeFormatToggle } from "./available-time-slots"

export type BookerLayout = "month" | "week" | "column"

interface BookerHeaderProps {
  layout: BookerLayout
  onLayoutChange: (layout: BookerLayout) => void
  dateRange: {
    start: Date
    end: Date
  }
  onNavigate: (direction: "prev" | "next") => void
  onToday: () => void
  timeFormat: "12h" | "24h"
  onTimeFormatChange: (format: "12h" | "24h") => void
  showLayoutToggle?: boolean
}

export function BookerHeader({
  layout,
  onLayoutChange,
  dateRange,
  onNavigate,
  onToday,
  timeFormat,
  onTimeFormatChange,
  showLayoutToggle = true,
}: BookerHeaderProps) {
  const formatDateRange = () => {
    const start = dateRange.start
    const end = dateRange.end
    const startMonth = start.toLocaleString("default", { month: "short" })
    const endMonth = end.toLocaleString("default", { month: "short" })
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    if (startMonth === endMonth && startYear === endYear) {
      return (
        <>
          {startMonth} {start.getDate()} - {end.getDate()},{" "}
          <span className="text-muted-foreground">{startYear}</span>
        </>
      )
    }

    if (startYear === endYear) {
      return (
        <>
          {startMonth} {start.getDate()} - {endMonth} {end.getDate()},{" "}
          <span className="text-muted-foreground">{startYear}</span>
        </>
      )
    }

    return (
      <>
        {startMonth} {start.getDate()}, {startYear} - {endMonth} {end.getDate()},{" "}
        {endYear}
      </>
    )
  }

  // Only show in week/column view
  if (layout === "month") {
    return (
      <div className="flex items-center justify-end gap-2 p-2">
        {showLayoutToggle && (
          <LayoutToggle layout={layout} onLayoutChange={onLayoutChange} />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between border-b px-5 py-4">
      <div className="flex items-center gap-4">
        <h3 className="text-base font-semibold min-w-[180px]">
          {formatDateRange()}
        </h3>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onNavigate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="ml-2"
            onClick={onToday}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <TimeFormatToggle value={timeFormat} onChange={onTimeFormatChange} />
        {showLayoutToggle && (
          <LayoutToggle layout={layout} onLayoutChange={onLayoutChange} />
        )}
      </div>
    </div>
  )
}

interface LayoutToggleProps {
  layout: BookerLayout
  onLayoutChange: (layout: BookerLayout) => void
}

function LayoutToggle({ layout, onLayoutChange }: LayoutToggleProps) {
  const layouts: { value: BookerLayout; icon: React.ReactNode; label: string }[] = [
    { value: "month", icon: <Calendar className="h-4 w-4" />, label: "Month view" },
    { value: "week", icon: <Grid3X3 className="h-4 w-4" />, label: "Week view" },
    { value: "column", icon: <Columns3 className="h-4 w-4" />, label: "Column view" },
  ]

  return (
    <div className="flex items-center border rounded-lg overflow-hidden">
      {layouts.map((item) => (
        <button
          key={item.value}
          onClick={() => onLayoutChange(item.value)}
          title={item.label}
          className={cn(
            "p-2 transition-colors",
            layout === item.value
              ? "bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          )}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
