"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { calendarApi, type DaySchedule, type TimeBlock, type DateOverride } from "@/lib/api/calendar"
import {
  Plus,
  Trash2,
  Copy,
  Loader2,
  CalendarDays,
  Clock,
  X,
} from "lucide-react"
import { toast } from "sonner"

const DAYS_OF_WEEK = [
  { key: "monday", index: 1 },
  { key: "tuesday", index: 2 },
  { key: "wednesday", index: 3 },
  { key: "thursday", index: 4 },
  { key: "friday", index: 5 },
  { key: "saturday", index: 6 },
  { key: "sunday", index: 0 },
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = (i % 2) * 30
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
})

interface ScheduleDay {
  dayOfWeek: number
  isAvailable: boolean
  timeBlocks: TimeBlock[]
}

export default function CalendarPage() {
  const t = useTranslations("calendar")
  const tDays = useTranslations("calendar.days")
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [overrides, setOverrides] = useState<DateOverride[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Override dialog state
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [overrideAvailable, setOverrideAvailable] = useState(true)
  const [overrideTimeBlocks, setOverrideTimeBlocks] = useState<TimeBlock[]>([{ start: "09:00", end: "17:00" }])
  const [savingOverride, setSavingOverride] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [scheduleData, overridesData] = await Promise.all([
        calendarApi.getSchedule(),
        calendarApi.getOverrides(),
      ])

      // Transform API data to local format
      const transformedSchedule = DAYS_OF_WEEK.map(day => {
        const apiDay = scheduleData.find(s => s.day_of_week === day.index)
        return {
          dayOfWeek: day.index,
          isAvailable: apiDay?.is_available ?? false,
          timeBlocks: apiDay?.time_blocks ?? [],
        }
      })

      setSchedule(transformedSchedule)
      setOverrides(overridesData)
    } catch (error) {
      console.error("Failed to fetch calendar data:", error)
      toast.error("Failed to load calendar data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleDay = (dayIndex: number) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek === dayIndex) {
        const newAvailable = !day.isAvailable
        return {
          ...day,
          isAvailable: newAvailable,
          timeBlocks: newAvailable && day.timeBlocks.length === 0
            ? [{ start: "09:00", end: "17:00" }]
            : day.timeBlocks,
        }
      }
      return day
    }))
    setHasChanges(true)
  }

  const handleAddTimeBlock = (dayIndex: number) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek === dayIndex) {
        const lastBlock = day.timeBlocks[day.timeBlocks.length - 1]
        const newStart = lastBlock ? lastBlock.end : "09:00"
        const newEnd = incrementTime(newStart, 60)
        return {
          ...day,
          timeBlocks: [...day.timeBlocks, { start: newStart, end: newEnd }],
        }
      }
      return day
    }))
    setHasChanges(true)
  }

  const handleRemoveTimeBlock = (dayIndex: number, blockIndex: number) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek === dayIndex) {
        const newBlocks = day.timeBlocks.filter((_, i) => i !== blockIndex)
        return {
          ...day,
          timeBlocks: newBlocks,
          isAvailable: newBlocks.length > 0,
        }
      }
      return day
    }))
    setHasChanges(true)
  }

  const handleTimeChange = (dayIndex: number, blockIndex: number, field: "start" | "end", value: string) => {
    setSchedule(prev => prev.map(day => {
      if (day.dayOfWeek === dayIndex) {
        const newBlocks = [...day.timeBlocks]
        newBlocks[blockIndex] = { ...newBlocks[blockIndex], [field]: value }
        return { ...day, timeBlocks: newBlocks }
      }
      return day
    }))
    setHasChanges(true)
  }

  const handleCopyToOtherDays = (sourceDayIndex: number, targetDays: number[]) => {
    const sourceDay = schedule.find(d => d.dayOfWeek === sourceDayIndex)
    if (!sourceDay) return

    setSchedule(prev => prev.map(day => {
      if (targetDays.includes(day.dayOfWeek)) {
        return {
          ...day,
          isAvailable: sourceDay.isAvailable,
          timeBlocks: [...sourceDay.timeBlocks],
        }
      }
      return day
    }))
    setHasChanges(true)
    toast.success("Schedule copied")
  }

  const handleSaveSchedule = async () => {
    setSaving(true)
    try {
      await calendarApi.updateSchedule({
        schedule: schedule.map(day => ({
          day_of_week: day.dayOfWeek,
          is_available: day.isAvailable,
          time_blocks: day.timeBlocks,
        })),
      })
      setHasChanges(false)
      toast.success(t("schedule.saved"))
    } catch (error) {
      console.error("Failed to save schedule:", error)
      toast.error("Failed to save schedule")
    } finally {
      setSaving(false)
    }
  }

  const handleCreateOverride = async () => {
    if (!selectedDate) return

    setSavingOverride(true)
    try {
      const dateStr = formatDateForApi(selectedDate)
      const newOverride = await calendarApi.createOverride({
        date: dateStr,
        is_available: overrideAvailable,
        time_blocks: overrideAvailable ? overrideTimeBlocks : [],
      })
      setOverrides(prev => [...prev, newOverride])
      setOverrideDialogOpen(false)
      resetOverrideForm()
      toast.success("Override created")
    } catch (error) {
      console.error("Failed to create override:", error)
      toast.error("Failed to create override")
    } finally {
      setSavingOverride(false)
    }
  }

  const handleDeleteOverride = async (id: number) => {
    try {
      await calendarApi.deleteOverride(id)
      setOverrides(prev => prev.filter(o => o.id !== id))
      toast.success("Override deleted")
    } catch (error) {
      console.error("Failed to delete override:", error)
      toast.error("Failed to delete override")
    }
  }

  const resetOverrideForm = () => {
    setSelectedDate(undefined)
    setOverrideAvailable(true)
    setOverrideTimeBlocks([{ start: "09:00", end: "17:00" }])
  }

  const getDayName = (dayKey: string) => {
    return tDays(dayKey as keyof typeof tDays)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("schedule.title")}</CardTitle>
              <CardDescription>{t("schedule.description")}</CardDescription>
            </div>
            <Button
              onClick={handleSaveSchedule}
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("schedule.saving")}
                </>
              ) : (
                t("schedule.save")
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => {
              const scheduleDay = schedule.find(s => s.dayOfWeek === day.index)
              if (!scheduleDay) return null

              return (
                <div
                  key={day.key}
                  className="flex flex-col gap-4 py-4 border-b last:border-b-0 sm:flex-row sm:items-start"
                >
                  {/* Day Toggle */}
                  <div className="flex items-center gap-3 sm:w-36">
                    <Switch
                      checked={scheduleDay.isAvailable}
                      onCheckedChange={() => handleToggleDay(day.index)}
                    />
                    <Label className="text-sm font-medium capitalize">
                      {getDayName(day.key)}
                    </Label>
                  </div>

                  {/* Time Blocks */}
                  <div className="flex-1">
                    {scheduleDay.isAvailable ? (
                      <div className="space-y-2">
                        {scheduleDay.timeBlocks.map((block, blockIndex) => (
                          <div key={blockIndex} className="flex items-center gap-2">
                            <Select
                              value={block.start}
                              onValueChange={(value) => handleTimeChange(day.index, blockIndex, "start", value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-muted-foreground">-</span>
                            <Select
                              value={block.end}
                              onValueChange={(value) => handleTimeChange(day.index, blockIndex, "end", value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map(time => (
                                  <SelectItem key={time} value={time}>{time}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {blockIndex === 0 ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAddTimeBlock(day.index)}
                                className="h-8 w-8"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveTimeBlock(day.index, blockIndex)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}

                            {blockIndex === 0 && (
                              <CopyDropdown
                                sourceDayIndex={day.index}
                                allDays={DAYS_OF_WEEK}
                                getDayName={getDayName}
                                onCopy={(targetDays) => handleCopyToOtherDays(day.index, targetDays)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {t("schedule.unavailable")}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("overrides.title")}</CardTitle>
              <CardDescription>{t("overrides.description")}</CardDescription>
            </div>
            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("overrides.add")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("overrides.add")}</DialogTitle>
                  <DialogDescription>
                    {t("overrides.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border mx-auto"
                  />

                  <div className="flex items-center gap-3">
                    <Switch
                      checked={overrideAvailable}
                      onCheckedChange={setOverrideAvailable}
                    />
                    <Label>
                      {overrideAvailable ? "Available" : t("overrides.unavailableAllDay")}
                    </Label>
                  </div>

                  {overrideAvailable && (
                    <div className="space-y-2">
                      {overrideTimeBlocks.map((block, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Select
                            value={block.start}
                            onValueChange={(value) => {
                              const newBlocks = [...overrideTimeBlocks]
                              newBlocks[index] = { ...newBlocks[index], start: value }
                              setOverrideTimeBlocks(newBlocks)
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-muted-foreground">-</span>
                          <Select
                            value={block.end}
                            onValueChange={(value) => {
                              const newBlocks = [...overrideTimeBlocks]
                              newBlocks[index] = { ...newBlocks[index], end: value }
                              setOverrideTimeBlocks(newBlocks)
                            }}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setOverrideTimeBlocks(prev => prev.filter((_, i) => i !== index))
                              }}
                              className="h-8 w-8 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const lastBlock = overrideTimeBlocks[overrideTimeBlocks.length - 1]
                          setOverrideTimeBlocks(prev => [
                            ...prev,
                            { start: lastBlock.end, end: incrementTime(lastBlock.end, 60) }
                          ])
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t("schedule.addTimeBlock")}
                      </Button>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOverrideDialogOpen(false)
                      resetOverrideForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateOverride}
                    disabled={!selectedDate || savingOverride}
                  >
                    {savingOverride ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {overrides.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("overrides.noOverrides")}</p>
            </div>
          ) : (
            <div className="divide-y">
              {overrides
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((override) => (
                  <div key={override.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">
                        {new Date(override.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {override.is_available ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {override.time_blocks.map((block, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {block.start} - {block.end}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {t("overrides.unavailableAllDay")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOverride(override.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Copy Dropdown Component
function CopyDropdown({
  sourceDayIndex,
  allDays,
  getDayName,
  onCopy,
}: {
  sourceDayIndex: number
  allDays: { key: string; index: number }[]
  getDayName: (key: string) => string
  onCopy: (targetDays: number[]) => void
}) {
  const t = useTranslations("calendar.schedule")
  const [selectedDays, setSelectedDays] = useState<number[]>([])

  const handleCopy = () => {
    if (selectedDays.length > 0) {
      onCopy(selectedDays)
      setSelectedDays([])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Copy className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          {t("copyToOtherDays")}
        </div>
        <DropdownMenuSeparator />
        {allDays
          .filter(day => day.index !== sourceDayIndex)
          .map(day => (
            <DropdownMenuCheckboxItem
              key={day.key}
              checked={selectedDays.includes(day.index)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedDays(prev => [...prev, day.index])
                } else {
                  setSelectedDays(prev => prev.filter(d => d !== day.index))
                }
              }}
              onSelect={(e) => e.preventDefault()}
            >
              {getDayName(day.key)}
            </DropdownMenuCheckboxItem>
          ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCopy}
          disabled={selectedDays.length === 0}
          className="justify-center"
        >
          Apply
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Utility functions
function incrementTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number)
  const totalMins = hours * 60 + mins + minutes
  const newHours = Math.min(23, Math.floor(totalMins / 60))
  const newMins = totalMins % 60
  return `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`
}

function formatDateForApi(date: Date): string {
  return date.toISOString().split("T")[0]
}
