"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function Navbar() {
  const t = useTranslations("nav")

  const navLinks = [
    { href: "#features", label: t("features") },
    { href: "#how-it-works", label: t("howItWorks") },
    { href: "#pricing", label: t("pricing") },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center">
            <Image
              src="/images/logo-horizontal-v3.png"
              alt="Slotty"
              width={200}
              height={112}
              className="h-16 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo-horizontal-v3.png"
                alt="Slotty"
                width={200}
                height={112}
                className="h-14 w-auto"
              />
            </Link>
            <nav className="mt-8 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-foreground/60 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-6 flex items-center md:hidden">
          <Image
            src="/images/logo-horizontal-v3.png"
            alt="Slotty"
            width={200}
            height={112}
            className="h-14 w-auto"
          />
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <LanguageSwitcher />
            <ModeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("getStarted")}</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
