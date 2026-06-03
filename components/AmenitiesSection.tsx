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
  Wine: <Wine size={36} aria-hidden="true" />,
  BanIcon: <Ban size={36} aria-hidden="true" />,
  ArrowUp: <ArrowUp size={36} aria-hidden="true" />,
  Clock: <Clock size={36} aria-hidden="true" />,
  Tag: <Tag size={36} aria-hidden="true" />,
  Wifi: <Wifi size={36} aria-hidden="true" />,
  Car: <Car size={36} aria-hidden="true" />,
  ConciergeBell: <ConciergeBell size={36} aria-hidden="true" />,
  Users: <Users size={36} aria-hidden="true" />,
  Shield: <Shield size={36} aria-hidden="true" />,
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
      el.style.transform = "scale(0)"
      el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`
    })

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((el) => {
            el.style.opacity = "1"
            el.style.transform = "scale(1)"
          })
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    if (gridRef.current) observer.observe(gridRef.current)
    return () => observer.disconnect()
  }, [])

  const isDark = variant === "dark"

  return (
    <section
      aria-labelledby="amenities-heading"
      className="py-24 px-6"
      style={{ backgroundColor: isDark ? "#1a0a24" : "white" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
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
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              color: isDark ? "white" : "#2d1b3d",
            }}
          >
            {heading}
          </h2>
        </div>

        <ul
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 list-none"
          role="list"
          aria-label="Hotel amenities"
        >
          {AMENITIES.map((a) => (
            <li
              key={a.label}
              data-amenity
              className="flex flex-col items-center text-center group"
            >
              <span
                className="transition-all duration-300 group-hover:scale-125 group-hover:[filter:drop-shadow(0_0_8px_rgba(201,168,76,0.8))]"
                style={{ color: "#c9a84c" }}
              >
                {ICON_MAP[a.icon]}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: isDark ? "rgba(255,255,255,0.8)" : "#5a4a6a",
                  marginTop: "12px",
                  lineHeight: 1.4,
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
