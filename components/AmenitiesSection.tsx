"use client"

import { useEffect, useRef } from "react"
import {
  Wine, Ban, ArrowUp, Clock, Tag, Wifi, Car, ConciergeBell, Users, Shield,
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
          items.forEach((el) => { el.style.opacity = "1"; el.style.transform = "translateY(0) scale(1)" })
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
      className="section-padding"
      style={{
        backgroundColor: isDark ? "#1a0a24" : "white",
        paddingLeft: "48px",
        paddingRight: "48px",
      }}
    >
      <div className="site-container">
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p
            className="label-caps"
            style={{ color: isDark ? "#c084c8" : "#561d70", marginBottom: "16px" }}
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
          role="list"
          aria-label="Hotel amenities"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "24px",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {AMENITIES.map((a) => (
            <li
              key={a.label}
              data-amenity
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                minHeight: "160px",
                padding: "40px 24px",
                borderRadius: "16px",
                border: isDark ? "1px solid rgba(201,168,76,0.2)" : "1px solid #e8d5f0",
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#faf7fc",
                cursor: "default",
                transition: "border-color 0.25s, background 0.25s, transform 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#c9a84c"
                e.currentTarget.style.backgroundColor = isDark ? "rgba(201,168,76,0.06)" : "#f0e4f8"
                e.currentTarget.style.transform = "translateY(-4px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? "rgba(201,168,76,0.2)" : "#e8d5f0"
                e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#faf7fc"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              <span
                style={{
                  color: "#c9a84c",
                  marginBottom: "20px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                }}
              >
                {ICON_MAP[a.icon]}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "13px",
                  color: isDark ? "rgba(255,255,255,0.8)" : "#5a4a6a",
                  lineHeight: 1.5,
                  maxWidth: "120px",
                  textAlign: "center",
                }}
              >
                {a.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          #amenities-heading + ul,
          [aria-label="Hotel amenities"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 639px) {
          [aria-label="Hotel amenities"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  )
}
