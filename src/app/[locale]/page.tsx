"use client"

import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider"
import LandingPage from "./(marketing)/page"

export default function HomePage() {
  return (
    <SmoothScrollProvider>
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <LandingPage />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  )
}
