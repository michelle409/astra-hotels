import type { Metadata } from "next"
import { DiningPageClient } from "@/components/DiningPageClient"

export const metadata: Metadata = {
  title: "Dining — Astra Hotels | Zaffran, TBC & Sunshine Cafe",
  description:
    "Explore Astra Hotels' dining collection across Bangalore. Zaffran's North West Frontier cuisine in Marathahalli, TBC gastropub in HSR Layout, and Sunshine Cafe in Koramangala. Book a table or take a 360° virtual tour.",
}

export default function DiningPage() {
  return <DiningPageClient />
}
