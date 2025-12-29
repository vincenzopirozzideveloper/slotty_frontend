"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  customersApi,
  type Customer,
  type CustomerBooking,
  type CustomersStats,
  type CustomersPagination,
} from "@/lib/api/customers"
import {
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  MessageSquare,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock3,
  CalendarDays,
} from "lucide-react"

export default function CustomersPage() {
  const t = useTranslations("customers")
  const tBookings = useTranslations("bookings")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<CustomersStats>({ total: 0 })
  const [pagination, setPagination] = useState<CustomersPagination>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Customer detail sheet
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([])
  const [detailLoading, setDetailLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchCustomers = useCallback(async (searchQuery?: string, page: number = 1) => {
    setLoading(true)
    try {
      const response = await customersApi.getCustomers(searchQuery, page)
      setCustomers(response.customers)
      setStats(response.stats)
      setPagination(response.pagination)
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers(debouncedSearch, 1)
  }, [debouncedSearch, fetchCustomers])

  const handlePageChange = (page: number) => {
    fetchCustomers(debouncedSearch, page)
  }

  const handleCustomerClick = async (customer: Customer) => {
    setSelectedCustomer(customer)
    setDetailLoading(true)
    try {
      const response = await customersApi.getCustomer(customer.email)
      setCustomerBookings(response.bookings)
    } catch (error) {
      console.error("Failed to fetch customer details:", error)
      setCustomerBookings([])
    } finally {
      setDetailLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDateRange = (start: string, end: string | null) => {
    if (!end) return formatDate(start)
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  const getStatusBadge = (status: CustomerBooking["status"]) => {
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
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.total")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customers List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("empty.title")}</p>
            <p className="text-sm text-muted-foreground">{t("empty.description")}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {customers.map((customer) => (
              <Card
                key={customer.email}
                className="cursor-pointer transition-colors hover:bg-muted/50"
                onClick={() => handleCustomerClick(customer)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {customer.total_bookings} {t("bookingsCount")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{customer.approved_bookings} {t("approved")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-amber-500" />
                      <span>{customer.pending_bookings} {t("pending")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{customer.rejected_bookings} {t("rejected")}</span>
                    </div>
                    <div className="ml-auto text-xs">
                      {t("lastBooking")}: {formatDate(customer.last_booking_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t("pagination.showing", {
                  from: (pagination.current_page - 1) * pagination.per_page + 1,
                  to: Math.min(pagination.current_page * pagination.per_page, pagination.total),
                  total: pagination.total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("pagination.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                >
                  {t("pagination.next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Customer Detail Sheet */}
      <Sheet open={selectedCustomer !== null} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCustomer.name}</SheetTitle>
                <SheetDescription className="space-y-1">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedCustomer.email}
                  </span>
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Customer Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedCustomer.approved_bookings}</div>
                      <p className="text-xs text-muted-foreground">{t("approved")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-amber-600">{selectedCustomer.pending_bookings}</div>
                      <p className="text-xs text-muted-foreground">{t("pending")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-red-600">{selectedCustomer.rejected_bookings}</div>
                      <p className="text-xs text-muted-foreground">{t("rejected")}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Booking History */}
                <div>
                  <h3 className="text-sm font-medium mb-3">{t("bookingHistory")}</h3>
                  {detailLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : customerBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t("noBookings")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {customerBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {formatDateRange(booking.requested_date, booking.requested_date_end)}
                                </span>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            {booking.requested_start_time && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <Clock className="h-4 w-4" />
                                {booking.requested_start_time} - {booking.requested_end_time}
                              </div>
                            )}
                            {booking.message && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{booking.message}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {t("requestedOn")} {formatDate(booking.created_at)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
