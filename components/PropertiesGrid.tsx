"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { PROPERTIES } from "@/lib/data"

type LocationGroup = {
  area: string
  areaId: string
  tagline: string
  branches: { id: string; location: string }[]
}

const LOCATION_GROUPS: LocationGroup[] = [
  { area: "Electronic City", areaId: "electronic-city", tagline: "Gateway to Bangalore's Silicon Valley", branches: [{ id: "electronic-city", location: "Electronic City" }] },
  { area: "HSR Layout", areaId: "hsr-layout", tagline: "Premium comfort in the heart of HSR", branches: [{ id: "hsr-sector-1", location: "HSR Layout — Sector 1" }, { id: "hsr-sector-7", location: "HSR Layout — Sector 7" }] },
  { area: "Kadubeesanahalli", areaId: "kadubeesanahalli", tagline: "Business comfort near Outer Ring Road", branches: [{ id: "kadubeesanahalli", location: "Kadubeesanahalli" }] },
  { area: "Koramangala", areaId: "koramangala", tagline: "At the pulse of Bangalore's social hub", branches: [{ id: "koramangala", location: "Koramangala" }] },
  { area: "Marathahalli", areaId: "marathahalli", tagline: "Premium stay near Spice Garden & Kauvery Hospital", branches: [{ id: "marathahalli", location: "Marathahalli — Spice Garden" }] },
  { area: "Sarjapur", areaId: "sarjapur", tagline: "Your home near Sarjapur's IT corridor", branches: [{ id: "sarjapur", location: "Sarjapur" }] },
  { area: "Whitefield", areaId: "whitefield", tagline: "Premium comfort in Whitefield's tech hub", branches: [{ id: "whitefield", location: "Whitefield" }] },
]

function getCardImage(primaryId: string): string {
  const prop = PROPERTIES.find((p) => p.id === primaryId)
  return prop?.cardImage ?? "/media/properties/card-1.jpg"
}

function PropertyCard({ group, index }: { group: LocationGroup; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const hasMultiple = group.branches.length > 1
  const cardImage = getCardImage(group.branches[0].id)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) { el.style.opacity = "1"; el.style.transform = "none"; return }

    el.style.opacity = "0"
    el.style.transform = "translateY(50px)"
    el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; observer.disconnect() }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  return (
    <article
      ref={cardRef}
      style={{
        border: `1px solid ${hovered ? "#561d70" : "#e8d5f0"}`,
        borderRadius: "16px",
        overflow: "hidden",
        background: "white",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered ? "0 24px 64px rgba(86,29,112,0.12)" : "none",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{ height: "220px", overflow: "hidden" }}>
        <Image
          src={cardImage}
          alt={`${group.area} property`}
          width={400}
          height={220}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>

      {/* Content */}
      <div style={{ padding: "28px 28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600, fontSize: "1.3rem", color: "#561d70" }}>
            {group.area}
          </h3>
          {hasMultiple && (
            <span style={{
              display: "inline-block",
              background: "#f3eef7",
              color: "#561d70",
              padding: "3px 10px",
              borderRadius: "20px",
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "11px",
            }}>
              2 branches
            </span>
          )}
        </div>

        <p style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 300,
          fontSize: "14px",
          color: "#666",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}>
          {group.tagline}
        </p>

        {!hasMultiple && (
          <Link
            href={`/${group.branches[0].id}`}
            aria-label={`Explore ${group.area} property`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: hovered ? "10px" : "6px",
              fontFamily: "var(--font-inter)",
              fontWeight: 600,
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#561d70",
              textDecoration: "none",
              transition: "gap 0.2s",
            }}
          >
            EXPLORE
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}

        {hasMultiple && (
          <>
            <button
              aria-expanded={expanded}
              aria-controls={`${group.areaId}-branches`}
              aria-label={expanded ? `Hide branches for ${group.area}` : `View 2 branches for ${group.area}`}
              onClick={() => setExpanded((v) => !v)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "var(--font-inter)",
                fontWeight: 600,
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#561d70",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {expanded ? "HIDE BRANCHES" : "VIEW 2 BRANCHES"}
              <ArrowRight
                size={14}
                aria-hidden="true"
                style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}
              />
            </button>

            <div
              id={`${group.areaId}-branches`}
              hidden={!expanded}
              style={{
                display: expanded ? "grid" : "none",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginTop: "14px",
              }}
            >
              {group.branches.map((b) => (
                <Link
                  key={b.id}
                  href={`/${b.id}`}
                  aria-label={`View ${b.location}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #e8d5f0",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#561d70"
                    e.currentTarget.style.background = "#faf7fc"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e8d5f0"
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "0.95rem", fontWeight: 500, color: "#561d70" }}>
                    {b.location.includes("Sector 1") ? "Sector 1" : "Sector 7"}
                  </span>
                  <span style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "#8a6a9a", marginTop: "2px" }}>
                    View<span aria-hidden="true"> →</span>
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
      className="section-padding"
      style={{ backgroundColor: "white", paddingLeft: "48px", paddingRight: "48px" }}
    >
      <div className="site-container">
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p className="label-caps" style={{ color: "#561d70", marginBottom: "16px" }} aria-hidden="true">
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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "36px",
          }}
        >
          {LOCATION_GROUPS.map((group, i) => (
            <PropertyCard key={group.areaId} group={group} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          #properties .site-container > div:last-child {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 28px !important;
          }
        }
        @media (max-width: 767px) {
          #properties .site-container > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          #properties { padding-left: 20px !important; padding-right: 20px !important; }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          #properties { padding-left: 32px !important; padding-right: 32px !important; }
        }
      `}</style>
    </section>
  )
}
