import axios from "axios"

const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Important for Sanctum cookie auth
})

// CSRF token handling for Sanctum
api.interceptors.request.use(async (config) => {
  // For mutating requests, ensure we have CSRF token
  if (["post", "put", "patch", "delete"].includes(config.method || "")) {
    await getCsrfToken()
  }
  return config
})

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected routes, not public pages
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname
        const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/cal/"]
        const isPublicPath = publicPaths.some(p => pathname === p || pathname.endsWith(p) || pathname.includes("/cal/"))
        const isLocaleRoot = /^\/(en|it)\/?$/.test(pathname)

        if (!isPublicPath && !isLocaleRoot && !pathname.includes("/login")) {
          window.location.href = "/login"
        }
      }
    }
    return Promise.reject(error)
  }
)

// Get CSRF cookie from Sanctum
async function getCsrfToken() {
  try {
    await axios.get("/sanctum/csrf-cookie", { withCredentials: true })
  } catch (error) {
    console.error("Failed to get CSRF token:", error)
  }
}

// Public API client (no auth required)
const publicApi = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

export { api, publicApi, getCsrfToken }
