import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Slotty - Availability Calendar for Freelancers",
  description: "Stop chasing clients. Let them book you. Share your availability calendar, receive booking requests, approve with one click.",
  openGraph: {
    title: "Slotty - Availability Calendar for Freelancers",
    description: "Stop chasing clients. Let them book you. Share your availability calendar, receive booking requests, approve with one click.",
    url: "https://shadnui.int.vincenzopirozzi.com",
    siteName: "Slotty",
    images: [
      {
        url: `https://shadnui.int.vincenzopirozzi.com/images/og-image.png?v=${Date.now()}`,
        width: 1200,
        height: 1200,
      }
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Slotty - Availability Calendar for Freelancers",
    description: "Stop chasing clients. Let them book you. Share your availability calendar, receive booking requests, approve with one click.",
    images: [`https://shadnui.int.vincenzopirozzi.com/images/og-image.png?v=${Date.now()}`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
