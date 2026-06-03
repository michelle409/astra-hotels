"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

export function RouteAnnouncer() {
  const pathname = usePathname()
  const announcerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h1 = document.querySelector("main h1") as HTMLElement | null
    if (h1) {
      if (!h1.hasAttribute("tabindex")) {
        h1.setAttribute("tabindex", "-1")
      }
      h1.focus()
    }

    if (announcerRef.current) {
      announcerRef.current.textContent = ""
      const title = document.title || "Page loaded"
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = title
        }
      }, 100)
    }
  }, [pathname])

  return (
    <div
      ref={announcerRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  )
}
