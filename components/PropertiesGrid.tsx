"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PROPERTIES } from "@/lib/data"
import { cn } from "@/lib/utils"

// Group properties by area; HSR shows as one expandable card
type LocationGroup = {
  area: string
  areaId: string
  tagline: string
  image: string
  branches: { id: string; location: string; address: string }[]
}

const LOCATION_GROUPS: LocationGroup[] = [
  {
    area: "Electronic City",
    areaId: "electronic-city",
    tagline: "Gateway to Bangalore's Silicon Valley",
    image: "/media/rooms/ec-lobby.jpg",
    branches: [{ id: "electronic-city", location: "Electronic City", address: "Electronic City Phase 1" }],
  },
  {
    area: "HSR Layout",
    areaId: "hsr-layout",
    tagline: "Premium comfort in the heart of HSR",
    image: "/media/rooms/premium-king.jpg",
    branches: [
      { id: "hsr-sector-1", location: "HSR Layout — Sector 1", address: "HSR Sector 1" },
      { id: "hsr-sector-7", location: "HSR Layout — Sector 7", address: "HSR Sector 7" },
    ],
  },
  {
    area: "Kadubeesanahalli",
    areaId: "kadubeesanahalli",
    tagline: "Business comfort near Outer Ring Road",
    image: "/media/rooms/superior-club.jpg",
    branches: [{ id: "kadubeesanahalli", location: "Kadubeesanahalli", address: "Outer Ring Road" }],
  },
  {
    area: "Koramangala",
    areaId: "koramangala",
    tagline: "At the pulse of Bangalore's social hub",
    image: "/media/rooms/family-room.jpg",
    branches: [{ id: "koramangala", location: "Koramangala", address: "Koramangala" }],
  },
  {
    area: "Marathahalli",
    areaId: "marathahalli",
    tagline: "Premium stay near Spice Garden & Kauvery Hospital",
    image: "/media/rooms/lobby.jpg",
    branches: [{ id: "marathahalli", location: "Marathahalli — Spice Garden", address: "Spice Garden Layout, Marathahalli" }],
  },
  {
    area: "Sarjapur",
    areaId: "sarjapur",
    tagline: "Your home near Sarjapur's IT corridor",
    image: "/media/rooms/premium-twin.jpg",
    branches: [{ id: "sarjapur", location: "Sarjapur", address: "Sarjapur Road" }],
  },
  {
    area: "Whitefield",
    areaId: "whitefield",
    tagline: "Premium comfort in Whitefield's tech hub",
    image: "/media/rooms/superior-club.jpg",
    branches: [{ id: "whitefield", location: "Whitefield", address: "Whitefield" }],
  },
]

function PropertyCard({ group, index }: { group: LocationGroup; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const hasMultiple = group.branches.length > 1

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")

    if (mq.matches) {
      el.style.opacity = "1"
      el.style.transform = "none"
      return
    }

    el.style.opacity = "0"
    el.style.transform = "translateY(50px)"
    el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <article
      ref={cardRef}
      className="rounded-xl overflow-hidden border border-[#e8d5f0] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(86,29,112,0.15)] hover:border-[#561d70]"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={group.image}
          alt={`${group.area} property`}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 500,
              fontSize: "1.2rem",
              color: "#561d70",
            }}
          >
            {group.area}
          </h3>
          {hasMultiple && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(86,29,112,0.1)",
                color: "#561d70",
                fontFamily: "var(--font-inter)",
                fontWeight: 500,
              }}
            >
              2 branches
            </span>
          )}
        </div>

        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 300,
            fontSize: "14px",
            color: "#5a4a6a",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}
        >
          {group.tagline}
        </p>

        {/* Single branch — direct link */}
        {!hasMultiple && (
          <Link
            href={`/${group.branches[0].id}`}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#561d70] hover:text-[#7b3fa0] transition-colors"
            style={{ fontFamily: "var(--font-inter)" }}
            aria-label={`Explore ${group.area} property`}
          >
            EXPLORE →
          </Link>
        )}

        {/* Multiple branches — expandable */}
        {hasMultiple && (
          <>
            <button
              aria-expanded={expanded}
              aria-controls={`${group.areaId}-branches`}
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-[#561d70] hover:text-[#7b3fa0] transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {expanded ? "HIDE BRANCHES ↑" : "VIEW 2 BRANCHES →"}
            </button>

            <div
              id={`${group.areaId}-branches`}
              hidden={!expanded}
              style={{
                display: expanded ? "grid" : "none",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              {group.branches.map((b) => (
                <Link
                  key={b.id}
                  href={`/${b.id}`}
                  className="flex flex-col p-3 rounded-lg border border-[#e8d5f0] hover:border-[#561d70] hover:bg-[#faf7fc] transition-all duration-200"
                >
                  <span
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      color: "#561d70",
                    }}
                  >
                    {b.location.includes("Sector 1") ? "Sector 1" : "Sector 7"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "11px",
                      color: "#8a6a9a",
                      marginTop: "2px",
                    }}
                  >
                    View →
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  )
}

export function PropertiesGrid() {
  return (
    <section
      id="properties"
      aria-labelledby="properties-heading"
      className="py-24 px-6 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="label-caps mb-4"
            style={{ color: "#561d70" }}
            aria-hidden="true"
          >
            OUR LOCATIONS
          </p>
          <h2
            id="properties-heading"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#2d1b3d",
            }}
          >
            8 Properties. One Bangalore.
          </h2>
        </div>

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {LOCATION_GROUPS.map((group, i) => (
            <PropertyCard key={group.areaId} group={group} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
