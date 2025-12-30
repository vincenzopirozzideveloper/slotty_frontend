"use client"

import { useEffect, useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { toPng } from "html-to-image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react"
import { calendarApi, type SocialCalendarDay, type CalendarSettings } from "@/lib/api/calendar"

type ColorScheme = "default" | "dark" | "gradient" | "minimal"

const colorSchemes: ColorScheme[] = ["default", "dark", "gradient", "minimal"]

function getMonthName(year: number, month: number, locale: string): string {
  return new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  })
}

function getAvailableMonths(): { value: string; label: string; year: number; month: number }[] {
  const months = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en", { month: "long", year: "numeric" }),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
    })
  }
  return months
}

export default function SocialPage() {
  const t = useTranslations("social")
  const previewRef = useRef<HTMLDivElement>(null)

  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [colorScheme, setColorScheme] = useState<ColorScheme>("default")
  const [showBrandName, setShowBrandName] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [calendarName, setCalendarName] = useState("")
  const [settings, setSettings] = useState<CalendarSettings | null>(null)
  const [days, setDays] = useState<SocialCalendarDay[]>([])
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState("")

  const availableMonths = getAvailableMonths()

  useEffect(() => {
    loadCalendarData()
  }, [selectedYear, selectedMonth])

  async function loadCalendarData() {
    setIsLoading(true)
    try {
      const data = await calendarApi.getSocialCalendar(selectedYear, selectedMonth)
      setCalendarName(data.calendar_name)
      setSettings(data.settings)
      setDays(data.days)
    } catch (error) {
      console.error("Failed to load calendar data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleMonthChange(value: string) {
    const [year, month] = value.split("-")
    setSelectedYear(parseInt(year))
    setSelectedMonth(parseInt(month))
  }

  function handlePreviousMonth() {
    const date = new Date(selectedYear, selectedMonth - 2, 1)
    setSelectedYear(date.getFullYear())
    setSelectedMonth(date.getMonth() + 1)
  }

  function handleNextMonth() {
    const date = new Date(selectedYear, selectedMonth, 1)
    setSelectedYear(date.getFullYear())
    setSelectedMonth(date.getMonth() + 1)
  }

  function isMobile(): boolean {
    if (typeof window === "undefined") return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  async function handleDownload() {
    if (!previewRef.current) return

    setIsDownloading(true)
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      })

      if (isMobile()) {
        setModalImageUrl(dataUrl)
        setShowMobileModal(true)
      } else {
        const link = document.createElement("a")
        link.download = `calendario-${selectedYear}-${String(selectedMonth).padStart(2, "0")}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (error) {
      console.error("Error generating image:", error)
      alert(t("error.generating"))
    } finally {
      setIsDownloading(false)
    }
  }

  // Style calculations
  const bgStyle = {
    default: "linear-gradient(to bottom, #3b82f6, #4f46e5)",
    dark: "linear-gradient(to bottom, #111827, #1f2937)",
    gradient: "linear-gradient(to bottom right, #8b5cf6, #ec4899, #f97316)",
    minimal: "#ffffff",
  }[colorScheme]

  const textColor = colorScheme === "minimal" ? "#111827" : "#ffffff"
  const textMuted = colorScheme === "minimal" ? "#6b7280" : "rgba(255,255,255,0.8)"
  const textFaint = colorScheme === "minimal" ? "#9ca3af" : "rgba(255,255,255,0.4)"
  const borderColor = colorScheme === "minimal" ? "#e5e7eb" : "rgba(255,255,255,0.3)"

  function getCellStyles(day: SocialCalendarDay) {
    const { status, is_past } = day

    if (is_past) {
      return {
        bg: { default: "rgba(255,255,255,0.12)", dark: "#1f2937", gradient: "rgba(255,255,255,0.15)", minimal: "#f3f4f6" }[colorScheme],
        color: { default: "rgba(255,255,255,0.5)", dark: "#6b7280", gradient: "rgba(255,255,255,0.5)", minimal: "#9ca3af" }[colorScheme],
      }
    }

    if (status === "available") {
      return {
        bg: { default: "rgba(34, 197, 94, 0.8)", dark: "#16a34a", gradient: "rgba(34, 197, 94, 0.85)", minimal: "#bbf7d0" }[colorScheme],
        color: { default: "#ffffff", dark: "#ffffff", gradient: "#ffffff", minimal: "#14532d" }[colorScheme],
      }
    }

    if (status === "fully_booked") {
      return {
        bg: { default: "rgba(251, 146, 60, 0.85)", dark: "#d97706", gradient: "rgba(251, 146, 60, 0.9)", minimal: "#fde68a" }[colorScheme],
        color: { default: "#ffffff", dark: "#ffffff", gradient: "#ffffff", minimal: "#78350f" }[colorScheme],
      }
    }

    // closed
    return {
      bg: { default: "rgba(255,255,255,0.2)", dark: "#374151", gradient: "rgba(255,255,255,0.25)", minimal: "#e5e7eb" }[colorScheme],
      color: { default: "rgba(255,255,255,0.7)", dark: "#9ca3af", gradient: "rgba(255,255,255,0.7)", minimal: "#6b7280" }[colorScheme],
    }
  }

  function getLegendColors() {
    return {
      available: { default: "rgba(34, 197, 94, 0.8)", dark: "#16a34a", gradient: "rgba(34, 197, 94, 0.85)", minimal: "#bbf7d0" }[colorScheme],
      booked: { default: "rgba(251, 146, 60, 0.85)", dark: "#d97706", gradient: "rgba(251, 146, 60, 0.9)", minimal: "#fde68a" }[colorScheme],
      closed: { default: "rgba(255,255,255,0.2)", dark: "#374151", gradient: "rgba(255,255,255,0.25)", minimal: "#e5e7eb" }[colorScheme],
    }
  }

  // Calculate first day padding
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
  const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay()
  const paddingDays = startDayOfWeek - 1

  const dayLetters = [
    t("days.mon"),
    t("days.tue"),
    t("days.wed"),
    t("days.thu"),
    t("days.fri"),
    t("days.sat"),
    t("days.sun"),
  ]

  const legendColors = getLegendColors()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Month Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("selectMonth")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="flex-1 text-center font-medium">
                  {getMonthName(selectedYear, selectedMonth, "en")}
                </span>
                <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Select
                value={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}`}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Style Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("styleOptions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("colorScheme")}</Label>
                <Select value={colorScheme} onValueChange={(v) => setColorScheme(v as ColorScheme)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((scheme) => (
                      <SelectItem key={scheme} value={scheme}>
                        {t(`schemes.${scheme}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-brand">{t("showBrand")}</Label>
                <Switch
                  id="show-brand"
                  checked={showBrandName}
                  onCheckedChange={setShowBrandName}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-legend">{t("showLegend")}</Label>
                <Switch
                  id="show-legend"
                  checked={showLegend}
                  onCheckedChange={setShowLegend}
                />
              </div>
            </CardContent>
          </Card>

          {/* Download Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleDownload}
            disabled={isDownloading || isLoading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("generating")}
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                {t("download")}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">{t("formatInfo")}</p>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("preview")}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {isLoading ? (
                <div className="w-[360px] h-[640px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div
                  ref={previewRef}
                  style={{
                    width: 360,
                    height: 640,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: bgStyle,
                    border: colorScheme === "minimal" ? "1px solid #e5e7eb" : "none",
                  }}
                >
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: 24, boxSizing: "border-box" }}>
                    {/* Header with Brand */}
                    {showBrandName && (
                      <div style={{ textAlign: "center", marginBottom: 20 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: textColor, margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                          {settings?.brand_name || calendarName}
                        </h1>
                        {settings?.tagline && (
                          <p style={{ fontSize: 13, marginTop: 4, color: textMuted, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                            {settings.tagline}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Month Title */}
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, color: textColor, margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                        {getMonthName(selectedYear, selectedMonth, "en")}
                      </h2>
                    </div>

                    {/* Calendar Grid */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      {/* Day Headers */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 6 }}>
                        {dayLetters.map((day, i) => (
                          <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, padding: "4px 0", color: textMuted, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, flex: 1, alignContent: "start" }}>
                        {/* Padding days */}
                        {Array.from({ length: paddingDays }).map((_, i) => (
                          <div key={`pad-${i}`} style={{ width: "100%", aspectRatio: "1" }} />
                        ))}

                        {/* Actual days */}
                        {days.map((day) => {
                          const cellStyles = getCellStyles(day)
                          return (
                            <div
                              key={day.day}
                              style={{
                                width: "100%",
                                aspectRatio: "1",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: 6,
                                background: cellStyles.bg,
                                fontFamily: "system-ui, -apple-system, sans-serif",
                              }}
                            >
                              <span style={{ fontSize: 14, fontWeight: 700, color: cellStyles.color, lineHeight: 1 }}>
                                {day.day}
                              </span>
                              {!day.is_past && day.available_count > 0 && (
                                <span style={{ fontSize: 10, fontWeight: 600, color: cellStyles.color, marginTop: 2, lineHeight: 1 }}>
                                  {day.available_count}
                                </span>
                              )}
                              {!day.is_past && day.status === "fully_booked" && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: cellStyles.color, marginTop: 2, lineHeight: 1 }}>
                                  FULL
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Legend */}
                    {showLegend && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${borderColor}` }}>
                        <div style={{ display: "flex", justifyContent: "center", gap: 14, fontSize: 11, fontFamily: "system-ui, -apple-system, sans-serif" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: legendColors.available }} />
                            <span style={{ color: textMuted, fontWeight: 500 }}>{t("legend.available")}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: legendColors.booked }} />
                            <span style={{ color: textMuted, fontWeight: 500 }}>{t("legend.booked")}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: legendColors.closed }} />
                            <span style={{ color: textMuted, fontWeight: 500 }}>{t("legend.closed")}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: 12, textAlign: "center" }}>
                      <p style={{ fontSize: 12, color: textFaint, fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
                        {t("bookNow")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Modal */}
      {showMobileModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            padding: 20,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowMobileModal(false)}
        >
          <p style={{ color: "white", marginBottom: 15, fontSize: 14, textAlign: "center" }}>
            {t("mobileModal.instruction")}
          </p>
          <img
            src={modalImageUrl}
            alt="Calendar"
            style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          />
          <Button
            variant="secondary"
            onClick={() => setShowMobileModal(false)}
            style={{ marginTop: 20 }}
          >
            {t("mobileModal.close")}
          </Button>
        </div>
      )}
    </div>
  )
}
