"use client"

import Link from "next/link"
import { useRef } from "react"
import { useTranslations } from "next-intl"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, Calendar, Check, Clock, X, Bell, Palette, Ban, CalendarCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FadeIn, TextReveal, Parallax, MagneticButton, ScaleIn, InfiniteMarquee } from "@/components/animations"

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const t = useTranslations()
  const heroRef = useRef<HTMLDivElement>(null)

  const features = [
    { icon: Calendar, key: "calendar" },
    { icon: CalendarCheck, key: "booking" },
    { icon: Clock, key: "multiday" },
    { icon: Palette, key: "branding" },
    { icon: Bell, key: "notifications" },
    { icon: Ban, key: "doubleBooking" },
  ]

  // Hero parallax animation
  useGSAP(() => {
    if (!heroRef.current) return

    const shapes = heroRef.current.querySelectorAll(".hero-shape")
    shapes.forEach((shape, i) => {
      gsap.to(shape, {
        y: (i + 1) * -50,
        rotation: (i % 2 === 0 ? 1 : -1) * 15,
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      })
    })
  }, { scope: heroRef })

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative container flex flex-col items-center justify-center gap-6 pb-8 pt-6 md:py-20 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="hero-shape absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="hero-shape absolute top-40 right-[15%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="hero-shape absolute bottom-20 left-[30%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="flex max-w-[980px] flex-col items-center gap-6 text-center">
          <FadeIn delay={0.2}>
            <span className="rounded-full border bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
              {t("hero.badge")}
            </span>
          </FadeIn>

          <div className="space-y-2">
            <TextReveal
              as="h1"
              className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]"
              delay={0.3}
            >
              {t("hero.headline1")}
            </TextReveal>
            <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
              <FadeIn delay={0.5} direction="up">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  {t("hero.headline2")}
                </span>
              </FadeIn>
            </h1>
          </div>

          <FadeIn delay={0.6} direction="up">
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              {t("hero.subheadline")}
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.8} direction="up" className="flex flex-col gap-4 sm:flex-row">
          <MagneticButton>
            <Button size="lg" asChild className="group">
              <Link href="/register">
                {t("hero.ctaPrimary")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </MagneticButton>
          <MagneticButton>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">{t("hero.ctaSecondary")}</Link>
            </Button>
          </MagneticButton>
        </FadeIn>

        <FadeIn delay={1} direction="up">
          <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("hero.socialProof")}
          </p>
        </FadeIn>
      </section>

      {/* Infinite Marquee */}
      <section className="py-6 overflow-hidden border-y bg-muted/20">
        <InfiniteMarquee speed={40} direction="left" pauseOnHover>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-2xl md:text-3xl font-semibold text-muted-foreground/50 select-none">
              <span>Booking Made Simple</span>
              <span className="text-primary/30">*</span>
              <span>Calendario Facile</span>
              <span className="text-primary/30">*</span>
              <span>No Double Booking</span>
              <span className="text-primary/30">*</span>
              <span>One Click Approve</span>
              <span className="text-primary/30">*</span>
            </div>
          ))}
        </InfiniteMarquee>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-8 md:py-12 lg:py-24">
        <FadeIn className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
          <span className="rounded-full border bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            {t("features.headline1")}{" "}
            <span className="text-primary">{t("features.headline2")}</span>
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {t("features.subheadline")}
          </p>
        </FadeIn>

        <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-3">
          {features.map((feature, i) => (
            <FadeIn key={feature.key} delay={i * 0.1} direction="up">
              <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-primary/50 group">
                <CardHeader>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{t(`features.${feature.key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {t(`features.${feature.key}.desc`)}
                  </CardDescription>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container py-8 md:py-12 lg:py-24">
        <FadeIn className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-16">
          <span className="rounded-full border bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
            {t("how.badge")}
          </span>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            {t("how.headline1")}{" "}
            <span className="text-primary">{t("how.headline2")}</span>
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {t("how.subheadline")}
          </p>
        </FadeIn>

        <div className="mx-auto max-w-5xl">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block" />

            <div className="grid gap-8 md:grid-cols-3">
              {[1, 2, 3].map((step, i) => (
                <FadeIn key={step} delay={i * 0.2} direction="up">
                  <div className="flex flex-col items-center text-center relative">
                    <ScaleIn delay={i * 0.2 + 0.3}>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-2xl font-bold mb-6 shadow-lg shadow-primary/25 relative z-10">
                        {step}
                      </div>
                    </ScaleIn>
                    <h3 className="text-xl font-semibold mb-3">{t(`how.step${step}.title`)}</h3>
                    <p className="text-muted-foreground leading-relaxed">{t(`how.step${step}.desc`)}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <FadeIn className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
          <span className="rounded-full border bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
            {t("comparison.badge")}
          </span>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            {t("comparison.headline1")}{" "}
            <span className="text-primary">{t("comparison.headline2")}</span>
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {t("comparison.subheadline")}
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          <FadeIn direction="left" delay={0.2}>
            <Card className="border-destructive/30 bg-gradient-to-br from-destructive/10 to-destructive/5 h-full transition-transform duration-300 hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
                    <X className="h-5 w-5 text-destructive" />
                  </div>
                  {t("comparison.without.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(t.raw("comparison.without.items") as string[]).map((item: string, i: number) => (
                  <FadeIn key={i} delay={0.3 + i * 0.1} direction="right">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <X className="h-4 w-4 text-destructive flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  </FadeIn>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn direction="right" delay={0.2}>
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 h-full transition-transform duration-300 hover:scale-[1.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  {t("comparison.with.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(t.raw("comparison.with.items") as string[]).map((item: string, i: number) => (
                  <FadeIn key={i} delay={0.3 + i * 0.1} direction="left">
                    <div className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  </FadeIn>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container py-8 md:py-12 lg:py-24">
        <FadeIn className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-12">
          <span className="rounded-full border bg-primary/10 text-primary px-4 py-1.5 text-sm font-medium">
            {t("pricing.badge")}
          </span>
          <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
            {t("pricing.headline1")}{" "}
            <span className="text-primary">{t("pricing.headline2")}</span>
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            {t("pricing.subheadline")}
          </p>
        </FadeIn>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {/* Free Plan */}
          <FadeIn delay={0.1} direction="up">
            <Card className="relative h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              <CardHeader className="relative">
                <CardTitle>{t("pricing.free.name")}</CardTitle>
                <CardDescription>{t("pricing.free.desc")}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">{t("pricing.perMonth")}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {(t.raw("pricing.free.features") as string[]).map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
                <MagneticButton className="w-full mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">{t("pricing.free.cta")}</Link>
                  </Button>
                </MagneticButton>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Pro Plan */}
          <FadeIn delay={0.2} direction="up">
            <Card className="border-primary relative h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium z-10">
                {t("pricing.mostPopular")}
              </div>
              <CardHeader className="relative pt-8">
                <CardTitle>{t("pricing.pro.name")}</CardTitle>
                <CardDescription>{t("pricing.pro.desc")}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-muted-foreground">{t("pricing.perMonth")}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {(t.raw("pricing.pro.features") as string[]).map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
                <MagneticButton className="w-full mt-4">
                  <Button className="w-full" asChild>
                    <Link href="/register">{t("pricing.pro.cta")}</Link>
                  </Button>
                </MagneticButton>
              </CardContent>
            </Card>
          </FadeIn>

          {/* Max Plan */}
          <FadeIn delay={0.3} direction="up">
            <Card className="relative h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
              <CardHeader className="relative">
                <CardTitle>{t("pricing.max.name")}</CardTitle>
                <CardDescription>{t("pricing.max.desc")}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">{t("pricing.perMonth")}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                {(t.raw("pricing.max.features") as string[]).map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
                <MagneticButton className="w-full mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/register">{t("pricing.max.cta")}</Link>
                  </Button>
                </MagneticButton>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <FadeIn>
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-6 text-center rounded-2xl border bg-gradient-to-br from-card to-card/50 p-8 md:p-16 relative overflow-hidden">
            {/* Background decoration */}
            <Parallax speed={0.3} className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            </Parallax>

            <TextReveal
              as="h2"
              className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-4xl"
            >
              {`${t("cta.headline1")} ${t("cta.headline2")}`}
            </TextReveal>

            <FadeIn delay={0.3} direction="up">
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                {t("cta.subheadline")}
              </p>
            </FadeIn>

            <FadeIn delay={0.5} direction="up" className="flex flex-col gap-4 sm:flex-row mt-4">
              <MagneticButton>
                <Button size="lg" asChild className="group">
                  <Link href="/register">
                    {t("cta.primary")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">{t("cta.secondary")}</Link>
                </Button>
              </MagneticButton>
            </FadeIn>

            <FadeIn delay={0.7} direction="up" className="flex flex-wrap justify-center gap-6 mt-4 text-sm text-muted-foreground">
              {(t.raw("cta.trust") as string[]).map((item: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </FadeIn>
          </div>
        </FadeIn>
      </section>
    </>
  )
}
