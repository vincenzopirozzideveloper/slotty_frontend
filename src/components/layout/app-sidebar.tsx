"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import {
  Calendar,
  Home,
  Settings,
  Users,
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  LogOut,
  ChevronUp,
  Zap,
  Sparkles,
  Link2,
  Camera,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

const mainNavItems = [
  { key: "dashboard", url: "/dashboard", icon: LayoutDashboard },
  { key: "bookings", url: "/dashboard/bookings", icon: CalendarDays },
  { key: "calendar", url: "/dashboard/calendar", icon: Calendar },
  { key: "tokens", url: "/dashboard/tokens", icon: Link2 },
  { key: "customers", url: "/dashboard/customers", icon: Users },
  { key: "social", url: "/dashboard/social", icon: Camera },
]

const settingsNavItems = [
  { key: "settings", url: "/dashboard/settings", icon: Settings },
  { key: "billing", url: "/dashboard/billing", icon: CreditCard },
]

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AppSidebar() {
  const t = useTranslations("sidebar")
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const isFreePlan = !user?.plan || user.plan === "free"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Slotty</span>
                  <span className="truncate text-xs text-muted-foreground">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("platform")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={t(`nav.${item.key}`)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("settingsGroup")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={t(`nav.${item.key}`)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2">
        {/* Upgrade CTA - only shown for free users */}
        {isFreePlan && (
          <div className="group-data-[collapsible=icon]:hidden px-2">
            <Link href="/dashboard/billing">
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/90 to-primary p-4 text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                      <Zap className="h-4 w-4" />
                    </div>
                    <span className="font-semibold">{t("upgrade.title")}</span>
                  </div>
                  <p className="text-xs text-primary-foreground/80 mb-3">
                    {t("upgrade.description")}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Sparkles className="h-3 w-3" />
                    <span>{t("upgrade.price")}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Collapsed state upgrade button */}
        {isFreePlan && (
          <div className="hidden group-data-[collapsible=icon]:block px-2">
            <Link href="/dashboard/billing">
              <Button
                size="icon"
                className="w-full bg-gradient-to-r from-primary/90 to-primary hover:shadow-lg hover:shadow-primary/25"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src="/avatars/user.jpg" alt={user?.name ?? "User"} />
                    <AvatarFallback className="rounded-lg">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name ?? "User"}</span>
                    <span className="truncate text-xs">{user?.email ?? ""}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("menu.accountSettings")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t("menu.billing")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("menu.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
