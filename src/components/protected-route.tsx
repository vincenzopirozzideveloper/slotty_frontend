"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Allow access to this route even if setup is not completed (for setup page itself) */
  allowSetup?: boolean
}

export function ProtectedRoute({ children, allowSetup = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // If authenticated and setup not completed, redirect to setup
    // (unless this route allows setup access)
    if (!isLoading && isAuthenticated && user && !user.setup_completed && !allowSetup) {
      router.push("/setup")
    }
  }, [isAuthenticated, isLoading, user, router, allowSetup])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Block access to non-setup pages if setup not completed
  if (user && !user.setup_completed && !allowSetup) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to setup...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
