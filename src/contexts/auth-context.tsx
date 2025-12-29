"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { authApi, User, LoginCredentials, RegisterData } from "@/lib/api/auth"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getUser()
      setUser(userData)
    } catch {
      setUser(null)
    }
  }, [])

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authApi.getUser()
        setUser(userData)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    await authApi.login(credentials)
    const userData = await authApi.getUser()
    setUser(userData)
    // Redirect to setup if not completed
    if (!userData.setup_completed) {
      router.push("/setup")
    } else {
      router.push("/dashboard")
    }
  }

  const register = async (data: RegisterData) => {
    await authApi.register(data)
    const userData = await authApi.getUser()
    setUser(userData)
    // New users always go to setup
    router.push("/setup")
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
