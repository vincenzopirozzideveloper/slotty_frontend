import Link from "next/link"
import { ArrowRight, Calendar, Clock, Users, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Intelligent booking system that adapts to your availability and preferences.",
  },
  {
    icon: Clock,
    title: "Time Zone Support",
    description: "Automatic time zone detection for seamless global scheduling.",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Manage your entire team's availability from a single dashboard.",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Real-time updates via email, SMS, and push notifications.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance with industry standards.",
  },
  {
    icon: Globe,
    title: "Custom Branding",
    description: "White-label solution with your own domain and branding.",
  },
]

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="container flex flex-col items-center justify-center gap-4 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
          <span className="rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            Now in Public Beta
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
            Scheduling made
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}beautifully simple
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            The modern booking platform for professionals. Streamline your appointments,
            reduce no-shows, and grow your business.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">View Demo</Link>
          </Button>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container py-8 md:py-12">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Trusted by 10,000+ professionals worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
            {["Company A", "Company B", "Company C", "Company D", "Company E"].map((company) => (
              <span key={company} className="text-xl font-semibold text-muted-foreground">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            Everything you need
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Powerful features to help you manage your time and grow your business.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-8">
          {features.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center rounded-lg border bg-card p-8 md:p-12">
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl">
            Ready to get started?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join thousands of professionals who trust Slotty for their scheduling needs.
          </p>
          <Button size="lg" asChild className="mt-4">
            <Link href="/register">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
