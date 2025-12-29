import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

export { dayjs }

// Detect browser timezone
export const BROWSER_TIMEZONE = dayjs.tz.guess() || "Europe/Rome"

// Format time with timezone conversion
export function formatTime(
  date: string | Date,
  timeFormat: 12 | 24 = 24,
  timeZone?: string
): string {
  const format = timeFormat === 12 ? "h:mm A" : "HH:mm"
  return timeZone
    ? dayjs(date).tz(timeZone).format(format)
    : dayjs(date).format(format)
}

// Get timezone offset string (e.g., "+1:00", "-5:00")
export function getTimezoneOffset(tz: string): string {
  try {
    const offsetMinutes = dayjs().tz(tz).utcOffset()
    const hours = Math.floor(Math.abs(offsetMinutes) / 60)
    const minutes = Math.abs(offsetMinutes) % 60
    const sign = offsetMinutes >= 0 ? "+" : "-"
    return `${sign}${hours}:${minutes.toString().padStart(2, "0")}`
  } catch {
    return "+0:00"
  }
}

// Format timezone label like Cal.com: "Europe/Rome +1:00"
export function formatTimezoneLabel(tz: string): string {
  const offset = getTimezoneOffset(tz)
  return `${tz} GMT ${offset}`
}

// Get short city name from timezone
export function getTimezoneCity(tz: string): string {
  return tz.split("/").pop()?.replace(/_/g, " ") || tz
}

// Convert UTC time to specific timezone
export function convertToTimezone(utcTime: string, targetTz: string): dayjs.Dayjs {
  return dayjs.utc(utcTime).tz(targetTz)
}

// Check if timezone is valid
export function isValidTimezone(tz: string): boolean {
  try {
    dayjs().tz(tz)
    return true
  } catch {
    return false
  }
}
