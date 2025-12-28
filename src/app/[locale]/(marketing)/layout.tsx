"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SmoothScrollProvider>
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  )
}
