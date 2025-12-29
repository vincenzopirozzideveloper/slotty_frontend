"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Check,
  X,
  Loader2,
  CreditCard,
  Zap,
  Crown,
  Sparkles,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from "lucide-react"
import { subscriptionApi, type Subscription, type Plan } from "@/lib/api/subscription"
import { useAuth } from "@/contexts/auth-context"

const planIcons = {
  free: Calendar,
  pro: Zap,
  max: Crown,
}

const planColors = {
  free: "bg-muted",
  pro: "bg-primary/10 border-primary",
  max: "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500",
}

export default function BillingPage() {
  const t = useTranslations("billing")
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const success = searchParams.get("success")
  const cancelled = searchParams.get("cancelled")

  useEffect(() => {
    async function loadData() {
      try {
        const [sub, planList] = await Promise.all([
          subscriptionApi.getSubscription(),
          subscriptionApi.getPlans(),
        ])
        setSubscription(sub)
        setPlans(planList)
      } catch (error) {
        console.error("Failed to load subscription data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleUpgrade = async (planId: "pro" | "max") => {
    setCheckoutLoading(planId)
    try {
      const checkoutUrl = await subscriptionApi.createCheckout({
        plan: planId,
        cycle: billingCycle,
      })
      window.location.href = checkoutUrl
    } catch (error) {
      console.error("Failed to create checkout:", error)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setCheckoutLoading("portal")
    try {
      const portalUrl = await subscriptionApi.getBillingPortal()
      window.location.href = portalUrl
    } catch (error) {
      console.error("Failed to get billing portal:", error)
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const currentPlan = subscription?.plan || "free"
  const bookingsUsed = subscription?.bookings.used || 0
  const bookingsLimit = subscription?.bookings.limit || 25
  const bookingsProgress = subscription?.bookings.unlimited
    ? 0
    : (bookingsUsed / bookingsLimit) * 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">{t("success.title")}</AlertTitle>
          <AlertDescription className="text-green-600">
            {t("success.description")}
          </AlertDescription>
        </Alert>
      )}

      {cancelled && (
        <Alert>
          <AlertTitle>{t("cancelled.title")}</AlertTitle>
          <AlertDescription>{t("cancelled.description")}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {t("currentPlan")}
                <Badge variant={currentPlan === "free" ? "secondary" : "default"}>
                  {subscription?.plan_label}
                </Badge>
              </CardTitle>
              <CardDescription>
                {subscription?.is_on_grace_period
                  ? t("gracePeriod", { date: new Date(subscription.ends_at!).toLocaleDateString() })
                  : t("currentPlanDescription")}
              </CardDescription>
            </div>
            {subscription?.is_paid && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={checkoutLoading === "portal"}
              >
                {checkoutLoading === "portal" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {t("manageBilling")}
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>{t("bookingsThisMonth")}</span>
                <span className="font-medium">
                  {subscription?.bookings.unlimited
                    ? t("unlimited")
                    : `${bookingsUsed} / ${bookingsLimit}`}
                </span>
              </div>
              {!subscription?.bookings.unlimited && (
                <Progress value={bookingsProgress} className="h-2" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t("availablePlans")}</h2>
          <Tabs
            value={billingCycle}
            onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
          >
            <TabsList>
              <TabsTrigger value="monthly">{t("monthly")}</TabsTrigger>
              <TabsTrigger value="yearly" className="relative">
                {t("yearly")}
                <Badge
                  variant="secondary"
                  className="absolute -top-2 -right-2 text-[10px] px-1 py-0"
                >
                  -17%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = planIcons[plan.id]
            const isCurrentPlan = currentPlan === plan.id
            const price = billingCycle === "yearly" ? plan.price_yearly : plan.price_monthly
            const monthlyPrice =
              billingCycle === "yearly" ? (plan.price_yearly / 12).toFixed(2) : plan.price_monthly

            return (
              <Card
                key={plan.id}
                className={`relative ${planColors[plan.id]} ${
                  isCurrentPlan ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.id === "pro" && (
                  <Badge className="absolute -top-2 right-4">{t("mostPopular")}</Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        {plan.unlimited_bookings
                          ? t("unlimitedBookings")
                          : t("bookingsPerMonth", { count: plan.bookings_per_month ?? 0 })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {plan.id === "free" ? (
                      <div className="text-3xl font-bold">{t("free")}</div>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold">{monthlyPrice}</span>
                        <span className="text-muted-foreground">/mo</span>
                        {billingCycle === "yearly" && (
                          <p className="text-sm text-muted-foreground">
                            {t("billedYearly", { price: price.toFixed(2) })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <ul className="space-y-2 text-sm">
                    {Object.entries(plan.features).map(([feature, enabled]) => (
                      <li key={feature} className="flex items-center gap-2">
                        {enabled ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={enabled ? "" : "text-muted-foreground"}>
                          {t(`features.${feature}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      {t("currentPlanButton")}
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button className="w-full" variant="outline" disabled>
                      {t("includedFree")}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id as "pro" | "max")}
                      disabled={checkoutLoading !== null}
                    >
                      {checkoutLoading === plan.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      {t("upgradeTo", { plan: plan.name })}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
