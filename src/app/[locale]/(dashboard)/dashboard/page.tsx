"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  dashboardApi,
  type DashboardStats,
  type RecentBooking,
  type UpcomingBooking,
} from "@/lib/api/dashboard"
import {
  CalendarDays,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  ArrowRight,
  Calendar,
} from "lucide-react"

export default function DashboardPage() {
  const t = useTranslations("dashboardPage")
  const tBookings = useTranslations("bookings")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<UpcomingBooking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const response = await dashboardApi.getDashboard()
      setStats(response.stats)
      setRecentBookings(response.recent_bookings)
      setUpcomingBookings(response.upcoming_bookings)
    } catch (error) {
      console.error("Failed to fetch dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return t("time.minutesAgo", { count: diffMins })
    if (diffHours < 24) return t("time.hoursAgo", { count: diffHours })
    return t("time.daysAgo", { count: diffDays })
  }

  const getStatusBadge = (status: RecentBooking["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock3 className="h-3 w-3" />
            {tBookings("status.pending")}
          </Badge>
        )
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
            <CheckCircle className="h-3 w-3" />
            {tBookings("status.approved")}
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {tBookings("status.rejected")}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("welcome")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalBookings")}</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total_bookings ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.pendingBookings")}</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{stats?.pending_bookings ?? 0}</div>
            )}
            {!loading && stats && stats.pending_bookings > 0 && (
              <p className="text-xs text-amber-600 mt-1">{t("stats.actionRequired")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.approvedBookings")}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{stats?.approved_bookings ?? 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalCustomers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total_customers ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Bookings */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("recentBookings.title")}</CardTitle>
              <CardDescription>{t("recentBookings.description")}</CardDescription>
            </div>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" size="sm" className="gap-1">
                {t("viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">{t("recentBookings.empty")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {booking.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{booking.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.requested_date)}
                        {booking.requested_date_end && ` - ${formatDate(booking.requested_date_end)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(booking.status)}
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {formatRelativeTime(booking.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bookings */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("upcomingBookings.title")}</CardTitle>
              <CardDescription>{t("upcomingBookings.description")}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">{t("upcomingBookings.empty")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="text-xs text-muted-foreground w-20">
                      {formatDate(booking.requested_date)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{booking.name}</p>
                      {booking.requested_start_time && (
                        <p className="text-xs text-muted-foreground">
                          {booking.requested_start_time}
                          {booking.requested_end_time && ` - ${booking.requested_end_time}`}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
