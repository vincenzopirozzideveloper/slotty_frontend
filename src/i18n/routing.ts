import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["en", "it"],
  defaultLocale: "it",
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]
