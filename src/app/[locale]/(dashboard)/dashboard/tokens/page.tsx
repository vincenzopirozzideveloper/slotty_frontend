"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { tokensApi, type PublicToken } from "@/lib/api/tokens"
import {
  Plus,
  Copy,
  RefreshCw,
  Trash2,
  MoreVertical,
  ExternalLink,
  Loader2,
  Link2,
  Key,
} from "lucide-react"
import { toast } from "sonner"

export default function TokensPage() {
  const t = useTranslations("tokens")
  const [tokens, setTokens] = useState<PublicToken[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState("")
  const [creating, setCreating] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const fetchTokens = useCallback(async () => {
    try {
      const data = await tokensApi.getTokens()
      setTokens(data.tokens)
    } catch (error) {
      console.error("Failed to fetch tokens:", error)
      toast.error(t("error.fetch"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const handleCreate = async () => {
    setCreating(true)
    try {
      const data = await tokensApi.createToken({
        name: newTokenName || undefined,
      })
      setTokens((prev) => [data.token, ...prev])
      setCreateDialogOpen(false)
      setNewTokenName("")
      toast.success(t("success.created"))
    } catch (error) {
      console.error("Failed to create token:", error)
      toast.error(t("error.create"))
    } finally {
      setCreating(false)
    }
  }

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t("success.copied"))
    } catch (error) {
      toast.error(t("error.copy"))
    }
  }

  const handleRegenerate = async (id: number) => {
    setActionLoading(id)
    try {
      const data = await tokensApi.regenerateToken(id)
      setTokens((prev) =>
        prev.map((token) => (token.id === id ? data.token : token))
      )
      toast.success(t("success.regenerated"))
    } catch (error) {
      console.error("Failed to regenerate token:", error)
      toast.error(t("error.regenerate"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggle = async (id: number) => {
    setActionLoading(id)
    try {
      const data = await tokensApi.toggleToken(id)
      setTokens((prev) =>
        prev.map((token) => (token.id === id ? data.token : token))
      )
      toast.success(data.token.is_active ? t("success.activated") : t("success.deactivated"))
    } catch (error) {
      console.error("Failed to toggle token:", error)
      toast.error(t("error.toggle"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: number) => {
    setActionLoading(id)
    try {
      await tokensApi.deleteToken(id)
      setTokens((prev) => prev.filter((token) => token.id !== id))
      toast.success(t("success.deleted"))
    } catch (error) {
      console.error("Failed to delete token:", error)
      toast.error(t("error.delete"))
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("createDialog.title")}</DialogTitle>
              <DialogDescription>{t("createDialog.description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("createDialog.name")}</Label>
                <Input
                  id="name"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder={t("createDialog.namePlaceholder")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {t("createDialog.cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("createDialog.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tokens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("empty.title")}</p>
            <p className="text-sm text-muted-foreground mb-4">
              {t("empty.description")}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("create")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <Card key={token.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{token.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {t("createdAt", {
                          date: new Date(token.created_at).toLocaleDateString(),
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {token.is_expired ? (
                      <Badge variant="destructive">{t("status.expired")}</Badge>
                    ) : token.is_active ? (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                        {t("status.active")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{t("status.inactive")}</Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={actionLoading === token.id}
                        >
                          {actionLoading === token.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyUrl(token.public_url)}>
                          <Copy className="mr-2 h-4 w-4" />
                          {t("actions.copy")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(token.public_url, "_blank")}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {t("actions.open")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRegenerate(token.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          {t("actions.regenerate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(token.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("actions.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono truncate">
                    {token.public_url}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyUrl(token.public_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={token.is_active}
                      onCheckedChange={() => handleToggle(token.id)}
                      disabled={actionLoading === token.id || token.is_expired}
                    />
                    <Label className="text-sm">
                      {token.is_active ? t("toggle.active") : t("toggle.inactive")}
                    </Label>
                  </div>
                  {token.expires_at && (
                    <span className="text-xs text-muted-foreground">
                      {t("expiresAt", {
                        date: new Date(token.expires_at).toLocaleDateString(),
                      })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
