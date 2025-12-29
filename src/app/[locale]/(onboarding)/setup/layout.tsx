"use client"

import { ProtectedRoute } from "@/components/protected-route"
import Image from "next/image"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowSetup>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Minimal header with logo only */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container flex h-14 items-center justify-center px-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Slotty"
                width={28}
                height={28}
                className="dark:invert"
              />
              <span className="font-semibold text-lg">Slotty</span>
            </div>
          </div>
        </header>

        {/* Main content - centered */}
        <main className="pt-14 min-h-screen flex items-start justify-center">
          <div className="w-full max-w-4xl px-4 py-12">
            {children}
          </div>
        </main>

        {/* Subtle footer */}
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Slotty - Professional Booking System
          </p>
        </footer>
      </div>
    </ProtectedRoute>
  )
}
