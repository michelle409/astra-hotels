import type { Metadata } from "next"
import "./globals.css"
import { RouteAnnouncer } from "@/components/RouteAnnouncer"

export const metadata: Metadata = {
  title: {
    default: "Astra Hotels & Suites — Premium Stays Across Bangalore",
    template: "%s — Astra Hotels & Suites",
  },
  description:
    "8 premium hotel properties across Bangalore — Electronic City, HSR Layout, Koramangala, Marathahalli, Whitefield and more. Book your stay today.",
  keywords: ["hotel", "bangalore", "accommodation", "business hotel", "astra hotels"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Skip link — WCAG 2.4.1. First focusable element. */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <RouteAnnouncer />
        {children}
      </body>
    </html>
  )
}
