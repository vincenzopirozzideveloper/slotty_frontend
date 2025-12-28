import { useTranslations } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, TrendingUp } from "lucide-react"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <DashboardContent />
}

function DashboardContent() {
  const t = useTranslations("dashboard")

  const stats = [
    {
      title: "Total Bookings",
      value: "1,234",
      description: "+12% from last month",
      icon: Calendar,
    },
    {
      title: "Active Customers",
      value: "456",
      description: "+8% from last month",
      icon: Users,
    },
    {
      title: "Hours Booked",
      value: "892",
      description: "+23% from last month",
      icon: Clock,
    },
    {
      title: "Revenue",
      value: "$12,345",
      description: "+15% from last month",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("welcome")}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Your latest appointments and reservations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Customer {i}</p>
                    <p className="text-xs text-muted-foreground">Booking #{1000 + i}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Your appointments for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"].map((time) => (
                <div key={time} className="flex items-center gap-4">
                  <div className="text-sm font-medium w-20">{time}</div>
                  <div className="flex-1 h-10 rounded-lg bg-muted flex items-center px-3">
                    <span className="text-sm">Available</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
