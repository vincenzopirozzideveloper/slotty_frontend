"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { settingsApi } from "@/lib/api/settings"
import { User, Settings, AlertTriangle, Loader2, Globe } from "lucide-react"

const TIMEZONES = [
  { value: "Europe/Rome", label: "Rome (CET/CEST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
  { value: "Europe/Zurich", label: "Zurich (CET/CEST)" },
  { value: "Europe/Vienna", label: "Vienna (CET/CEST)" },
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Sao_Paulo", label: "Sao Paulo (BRT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "UTC", label: "UTC" },
]

export default function SettingsPage() {
  const t = useTranslations("settings")
  const { user, refreshUser, logout } = useAuth()
  const router = useRouter()

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name ?? "")
  const [profileEmail, setProfileEmail] = useState(user?.email ?? "")
  const [profileTimezone, setProfileTimezone] = useState(user?.timezone ?? "Europe/Rome")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [profileSuccess, setProfileSuccess] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setProfileError("")
    setProfileSuccess(false)

    try {
      await settingsApi.updateProfile({
        name: profileName,
        email: profileEmail,
        timezone: profileTimezone,
      })
      await refreshUser()
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setProfileError(error.response?.data?.message ?? t("profile.error"))
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordError("")
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError(t("password.mismatch"))
      setPasswordLoading(false)
      return
    }

    try {
      await settingsApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: { current_password?: string[] } } } }
      setPasswordError(
        error.response?.data?.errors?.current_password?.[0] ??
        error.response?.data?.message ??
        t("password.error")
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setDeleteLoading(true)
    setDeleteError("")

    try {
      await settingsApi.deleteAccount({ password: deletePassword })
      await logout()
      router.push("/")
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: { password?: string[] } } } }
      setDeleteError(
        error.response?.data?.errors?.password?.[0] ??
        error.response?.data?.message ??
        t("dangerZone.deleteAccount.error")
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            {t("tabs.profile")}
          </TabsTrigger>
          <TabsTrigger value="password" className="gap-2">
            <Settings className="h-4 w-4" />
            {t("tabs.password")}
          </TabsTrigger>
          <TabsTrigger value="danger" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t("tabs.dangerZone")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("profile.title")}</CardTitle>
              <CardDescription>{t("profile.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("profile.name")}</Label>
                  <Input
                    id="name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder={t("profile.namePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    placeholder={t("profile.emailPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {t("profile.timezone")}
                  </Label>
                  <Select value={profileTimezone} onValueChange={setProfileTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder={t("profile.timezonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {t("profile.timezoneHint")}
                  </p>
                </div>

                {profileError && (
                  <p className="text-sm text-destructive">{profileError}</p>
                )}
                {profileSuccess && (
                  <p className="text-sm text-green-600">{t("profile.success")}</p>
                )}

                <Button type="submit" disabled={profileLoading}>
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {profileLoading ? t("profile.saving") : t("profile.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>{t("password.title")}</CardTitle>
              <CardDescription>{t("password.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("password.currentPassword")}</Label>
                  <PasswordInput
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("password.newPassword")}</Label>
                  <PasswordInput
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("password.confirmPassword")}</Label>
                  <PasswordInput
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-sm text-green-600">{t("password.success")}</p>
                )}

                <Button type="submit" disabled={passwordLoading}>
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {passwordLoading ? t("password.updating") : t("password.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Danger Zone Tab */}
        <TabsContent value="danger">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">{t("dangerZone.title")}</CardTitle>
              <CardDescription>{t("dangerZone.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-destructive/50 p-4">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="font-medium">{t("dangerZone.deleteAccount.title")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("dangerZone.deleteAccount.description")}
                    </p>
                  </div>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-fit"
                    >
                      {t("dangerZone.deleteAccount.button")}
                    </Button>
                  ) : (
                    <form onSubmit={handleDeleteAccount} className="space-y-4 border-t pt-4">
                      <div className="rounded-lg bg-destructive/10 p-4">
                        <p className="text-sm font-medium text-destructive">
                          {t("dangerZone.deleteAccount.dialog.title")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("dangerZone.deleteAccount.dialog.description")}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deletePassword">
                          {t("dangerZone.deleteAccount.dialog.password")}
                        </Label>
                        <PasswordInput
                          id="deletePassword"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                        />
                      </div>

                      {deleteError && (
                        <p className="text-sm text-destructive">{deleteError}</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeletePassword("")
                            setDeleteError("")
                          }}
                        >
                          {t("dangerZone.deleteAccount.dialog.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={deleteLoading || !deletePassword}
                        >
                          {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {deleteLoading
                            ? t("dangerZone.deleteAccount.dialog.deleting")
                            : t("dangerZone.deleteAccount.dialog.confirm")}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
