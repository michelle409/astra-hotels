"use client"

import { useEffect, useRef } from "react"
import {
  Wine,
  Ban,
  ArrowUp,
  Clock,
  Tag,
  Wifi,
  Car,
  ConciergeBell,
  Users,
  Shield,
} from "lucide-react"
import { AMENITIES } from "@/lib/data"

const ICON_MAP: Record<string, React.ReactNode> = {
  Wine: <Wine size={32} aria-hidden="true" />,
  BanIcon: <Ban size={32} aria-hidden="true" />,
  ArrowUp: <ArrowUp size={32} aria-hidden="true" />,
  Clock: <Clock size={32} aria-hidden="true" />,
  Tag: <Tag size={32} aria-hidden="true" />,
  Wifi: <Wifi size={32} aria-hidden="true" />,
  Car: <Car size={32} aria-hidden="true" />,
  ConciergeBell: <ConciergeBell size={32} aria-hidden="true" />,
  Users: <Users size={32} aria-hidden="true" />,
  Shield: <Shield size={32} aria-hidden="true" />,
}

type Props = {
  variant?: "dark" | "light"
  heading?: string
}

export function AmenitiesSection({ variant = "dark", heading = "Everything You Need, Nothing You Don't" }: Props) {
  const gridRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const items = gridRef.current?.querySelectorAll<HTMLLIElement>("[data-amenity]")
    if (!items) return

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) {
      items.forEach((el) => { el.style.opacity = "1"; el.style.transform = "none" })
      return
    }

    items.forEach((el, i) => {
      el.style.opacity = "0"
      el.style.transform = "translateY(24px) scale(0.96)"
      el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((el) => {
            el.style.opacity = "1"
            el.style.transform = "translateY(0) scale(1)"
          })
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  const isDark = variant === "dark"

  return (
    <section
      aria-labelledby="amenities-heading"
      className="py-28 px-6"
      style={{ backgroundColor: isDark ? "#1a0a24" : "white" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p
            className="label-caps mb-4"
            style={{ color: isDark ? "#c084c8" : "#561d70" }}
            aria-hidden="true"
          >
            HOTEL AMENITIES
          </p>
          <h2
            id="amenities-heading"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: isDark ? "white" : "#2d1b3d",
            }}
          >
            {heading}
          </h2>
        </div>

        <ul
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 list-none"
          role="list"
          aria-label="Hotel amenities"
        >
          {AMENITIES.map((a) => (
            <li
              key={a.label}
              data-amenity
              className="group flex flex-col items-center text-center rounded-xl p-6 transition-all duration-300 cursor-default"
              style={{
                border: isDark ? "1px solid rgba(192,132,200,0.2)" : "1px solid #e8d5f0",
                backgroundColor: isDark ? "rgba(86,29,112,0.15)" : "#faf7fc",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "rgba(86,29,112,0.35)" : "#f0e4f8"
                e.currentTarget.style.borderColor = isDark ? "rgba(192,132,200,0.5)" : "#c084c8"
                e.currentTarget.style.transform = "translateY(-4px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? "rgba(86,29,112,0.15)" : "#faf7fc"
                e.currentTarget.style.borderColor = isDark ? "rgba(192,132,200,0.2)" : "#e8d5f0"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <span
                className="transition-all duration-300 group-hover:scale-110 group-hover:[filter:drop-shadow(0_0_10px_rgba(201,168,76,0.9))]"
                style={{ color: "#c9a84c", marginBottom: "14px" }}
              >
                {ICON_MAP[a.icon]}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "12px",
                  color: isDark ? "rgba(255,255,255,0.85)" : "#5a4a6a",
                  lineHeight: 1.4,
                  letterSpacing: "0.02em",
                }}
              >
                {a.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
