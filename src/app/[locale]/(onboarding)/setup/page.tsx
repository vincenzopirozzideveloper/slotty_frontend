"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/contexts/auth-context"
import {
  setupApi,
  type BookingMode,
  type DaySchedule,
} from "@/lib/api/setup"
import {
  CalendarDays,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Trash2,
  AlertTriangle,
  Sparkles,
} from "lucide-react"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function SetupWizardPage() {
  const t = useTranslations("setup")
  const router = useRouter()
  const { user, refreshUser } = useAuth()

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form data
  const [bookingMode, setBookingMode] = useState<BookingMode | null>(null)
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([])
  const [slotDuration, setSlotDuration] = useState(60)
  const [slotBuffer, setSlotBuffer] = useState(0)
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30)
  const [minNoticeHours, setMinNoticeHours] = useState(24)
  const [brandName, setBrandName] = useState("")
  const [tagline, setTagline] = useState("")
  const [heroText, setHeroText] = useState("")

  // Calculate total steps based on booking mode
  const totalSteps = bookingMode === "full_day" ? 3 : 5

  // Load defaults on mount
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        // Check if already completed
        if (user?.setup_completed) {
          router.push("/dashboard")
          return
        }

        const defaults = await setupApi.getDefaults()
        const scheduleArray = Object.values(defaults.weekly_schedule).map((day, index) => ({
          ...day,
          day_of_week: index,
          day_name: DAY_NAMES[index],
        }))
        setWeeklySchedule(scheduleArray)
        setSlotDuration(defaults.slot_duration)
        setSlotBuffer(defaults.slot_buffer)
        setAdvanceBookingDays(defaults.advance_booking_days)
        setMinNoticeHours(defaults.min_notice_hours)
        setBrandName(user?.name || "")
      } catch (error) {
        console.error("Failed to load defaults:", error)
      } finally {
        setLoading(false)
      }
    }
    loadDefaults()
  }, [user, router])

  // Step validation
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return bookingMode !== null
      case 2:
        if (bookingMode === "full_day") return true
        return weeklySchedule.some((day) => day.is_available)
      case 3:
        if (bookingMode === "full_day") return brandName.trim().length > 0
        return slotDuration >= 15 && slotDuration <= 480
      case 4:
        return brandName.trim().length > 0
      case 5:
        return true
      default:
        return false
    }
  }, [currentStep, bookingMode, weeklySchedule, brandName, slotDuration])

  // Navigation
  const nextStep = () => {
    if (!canProceed()) return
    if (currentStep === 1 && bookingMode === "full_day") {
      setCurrentStep(4) // Skip to branding for full day
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const previousStep = () => {
    if (currentStep === 4 && bookingMode === "full_day") {
      setCurrentStep(1) // Back to mode selection
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1))
    }
  }

  // Schedule management
  const toggleDayAvailability = (dayIndex: number) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex ? { ...day, is_available: !day.is_available } : day
      )
    )
  }

  const addTimeBlock = (dayIndex: number) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex
          ? { ...day, time_blocks: [...day.time_blocks, { start: "09:00", end: "17:00" }] }
          : day
      )
    )
  }

  const removeTimeBlock = (dayIndex: number, blockIndex: number) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex
          ? { ...day, time_blocks: day.time_blocks.filter((_, i) => i !== blockIndex) }
          : day
      )
    )
  }

  const updateTimeBlock = (dayIndex: number, blockIndex: number, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.day_of_week === dayIndex
          ? {
              ...day,
              time_blocks: day.time_blocks.map((block, i) =>
                i === blockIndex ? { ...block, [field]: value } : block
              ),
            }
          : day
      )
    )
  }

  // Submit wizard
  const handleFinish = async () => {
    if (!bookingMode) return

    setSubmitting(true)
    try {
      await setupApi.complete({
        booking_mode: bookingMode,
        weekly_schedule: weeklySchedule,
        slot_duration: slotDuration,
        slot_buffer: slotBuffer,
        advance_booking_days: advanceBookingDays,
        min_notice_hours: minNoticeHours,
        brand_name: brandName,
        tagline: tagline || undefined,
        hero_text: heroText || undefined,
      })
      await refreshUser()
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to complete setup:", error)
    } finally {
      setSubmitting(false)
    }
  }

  // Get display step number (adjusted for full_day mode skipping)
  const getDisplayStep = () => {
    if (bookingMode === "full_day" && currentStep >= 4) {
      return currentStep - 2
    }
    return currentStep
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your setup...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Progress */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {t("stepOf", { current: getDisplayStep(), total: totalSteps })}
          </span>
          <Badge variant="outline" className="font-normal">
            {getDisplayStep()}/{totalSteps}
          </Badge>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(getDisplayStep() / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto">
        {/* Step 1: Booking Mode */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t("mode.title")}</h2>
              <p className="text-muted-foreground">{t("mode.description")}</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3 max-w-xl mx-auto">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">{t("mode.warning.title")}</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{t("mode.warning.description")}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Full Day Option */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  bookingMode === "full_day"
                    ? "ring-2 ring-primary border-primary shadow-md"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setBookingMode("full_day")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${bookingMode === "full_day" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t("mode.fullDay.title")}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{t("mode.fullDay.badge")}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{t("mode.fullDay.description")}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {t("mode.fullDay.feature1")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {t("mode.fullDay.feature2")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {t("mode.fullDay.feature3")}
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4 italic">{t("mode.fullDay.ideal")}</p>
                </CardContent>
              </Card>

              {/* Time Slots Option */}
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${
                  bookingMode === "time_slots"
                    ? "ring-2 ring-primary border-primary shadow-md"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setBookingMode("time_slots")}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${bookingMode === "time_slots" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{t("mode.timeSlots.title")}</CardTitle>
                      <Badge variant="secondary" className="mt-1">{t("mode.timeSlots.badge")}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{t("mode.timeSlots.description")}</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {t("mode.timeSlots.feature1")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {t("mode.timeSlots.feature2")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      {t("mode.timeSlots.feature3")}
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4 italic">{t("mode.timeSlots.ideal")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Weekly Schedule (Time Slots only) */}
        {currentStep === 2 && bookingMode === "time_slots" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t("schedule.title")}</h2>
              <p className="text-muted-foreground">{t("schedule.description")}</p>
            </div>

            <div className="space-y-3">
              {weeklySchedule.map((day) => (
                <Card key={day.day_of_week} className={!day.is_available ? "opacity-60" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={day.is_available}
                          onCheckedChange={() => toggleDayAvailability(day.day_of_week)}
                        />
                        <Label className="font-medium">{t(`days.${day.day_name.toLowerCase()}`)}</Label>
                      </div>
                      {day.is_available && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeBlock(day.day_of_week)}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          {t("schedule.addBlock")}
                        </Button>
                      )}
                    </div>

                    {day.is_available && (
                      <div className="space-y-2 pl-12">
                        {day.time_blocks.length === 0 ? (
                          <p className="text-sm text-muted-foreground">{t("schedule.noBlocks")}</p>
                        ) : (
                          day.time_blocks.map((block, blockIndex) => (
                            <div key={blockIndex} className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={block.start}
                                onChange={(e) => updateTimeBlock(day.day_of_week, blockIndex, "start", e.target.value)}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">-</span>
                              <Input
                                type="time"
                                value={block.end}
                                onChange={(e) => updateTimeBlock(day.day_of_week, blockIndex, "end", e.target.value)}
                                className="w-32"
                              />
                              {day.time_blocks.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTimeBlock(day.day_of_week, blockIndex)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {!day.is_available && (
                      <p className="text-sm text-muted-foreground pl-12">{t("schedule.unavailable")}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Slot Settings (Time Slots only) */}
        {currentStep === 3 && bookingMode === "time_slots" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t("slots.title")}</h2>
              <p className="text-muted-foreground">{t("slots.description")}</p>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("slots.duration.title")}</CardTitle>
                  <CardDescription>{t("slots.duration.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Slider
                      value={[slotDuration]}
                      onValueChange={([value]) => setSlotDuration(value)}
                      min={15}
                      max={240}
                      step={15}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">15 min</span>
                      <span className="font-medium text-primary">{slotDuration} {t("slots.minutes")}</span>
                      <span className="text-muted-foreground">4 {t("slots.hours")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("slots.buffer.title")}</CardTitle>
                  <CardDescription>{t("slots.buffer.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Slider
                      value={[slotBuffer]}
                      onValueChange={([value]) => setSlotBuffer(value)}
                      min={0}
                      max={60}
                      step={5}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">0 min</span>
                      <span className="font-medium text-primary">{slotBuffer} {t("slots.minutes")}</span>
                      <span className="text-muted-foreground">60 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("slots.advance.title")}</CardTitle>
                  <CardDescription>{t("slots.advance.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Slider
                      value={[advanceBookingDays]}
                      onValueChange={([value]) => setAdvanceBookingDays(value)}
                      min={7}
                      max={90}
                      step={7}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">7 {t("slots.days")}</span>
                      <span className="font-medium text-primary">{advanceBookingDays} {t("slots.days")}</span>
                      <span className="text-muted-foreground">90 {t("slots.days")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("slots.notice.title")}</CardTitle>
                  <CardDescription>{t("slots.notice.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Slider
                      value={[minNoticeHours]}
                      onValueChange={([value]) => setMinNoticeHours(value)}
                      min={0}
                      max={72}
                      step={1}
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">0h</span>
                      <span className="font-medium text-primary">{minNoticeHours} {t("slots.hoursLabel")}</span>
                      <span className="text-muted-foreground">72h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 4: Branding (for both modes) */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t("branding.title")}</h2>
              <p className="text-muted-foreground">{t("branding.description")}</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="brandName">{t("branding.name.label")} *</Label>
                  <Input
                    id="brandName"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder={t("branding.name.placeholder")}
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">{t("branding.name.hint")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">{t("branding.tagline.label")}</Label>
                  <Input
                    id="tagline"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder={t("branding.tagline.placeholder")}
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">{t("branding.tagline.hint")}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroText">{t("branding.heroText.label")}</Label>
                  <Textarea
                    id="heroText"
                    value={heroText}
                    onChange={(e) => setHeroText(e.target.value)}
                    placeholder={t("branding.heroText.placeholder")}
                    rows={3}
                    className="max-w-lg"
                  />
                  <p className="text-xs text-muted-foreground">{t("branding.heroText.hint")}</p>
                </div>
              </CardContent>
            </Card>

            {/* Ready to launch card for Full Day mode */}
            {bookingMode === "full_day" && brandName.trim() && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t("review.ready")}</p>
                      <p className="text-sm text-muted-foreground">{t("review.readyDescription")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 5: Review (Time Slots only) */}
        {currentStep === 5 && bookingMode === "time_slots" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">{t("review.title")}</h2>
              <p className="text-muted-foreground">{t("review.description")}</p>
            </div>

            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    {t("review.mode")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{t("mode.timeSlots.title")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("review.branding")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex">
                    <span className="text-sm text-muted-foreground w-24">{t("branding.name.label")}:</span>
                    <span className="font-medium">{brandName}</span>
                  </div>
                  {tagline && (
                    <div className="flex">
                      <span className="text-sm text-muted-foreground w-24">{t("branding.tagline.label")}:</span>
                      <span>{tagline}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("review.schedule")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {weeklySchedule.map((day) => (
                      <div key={day.day_of_week} className="flex justify-between py-1">
                        <span className={day.is_available ? "" : "text-muted-foreground"}>
                          {t(`days.${day.day_name.toLowerCase()}`)}
                        </span>
                        <span className={day.is_available ? "font-medium" : "text-muted-foreground"}>
                          {day.is_available
                            ? day.time_blocks.map((b) => `${b.start}-${b.end}`).join(", ")
                            : t("schedule.unavailable")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("review.settings")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <span className="text-muted-foreground">{t("slots.duration.title")}:</span>
                    <span className="font-medium">{slotDuration} min</span>
                    <span className="text-muted-foreground">{t("slots.buffer.title")}:</span>
                    <span className="font-medium">{slotBuffer} min</span>
                    <span className="text-muted-foreground">{t("slots.advance.title")}:</span>
                    <span className="font-medium">{advanceBookingDays} {t("slots.days")}</span>
                    <span className="text-muted-foreground">{t("slots.notice.title")}:</span>
                    <span className="font-medium">{minNoticeHours}h</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-3xl mx-auto flex justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("navigation.back")}
        </Button>

        {((currentStep === totalSteps) || (currentStep === 4 && bookingMode === "full_day")) ? (
          <Button
            onClick={handleFinish}
            disabled={!canProceed() || submitting}
            className="gap-2 min-w-[140px]"
            size="lg"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t("navigation.launch")}
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="gap-2"
          >
            {t("navigation.next")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
