"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import PanoramaViewer from "@/components/PanoramaViewer"

// ─── Data ──────────────────────────────────────────────────────────────────

const RESTAURANTS = [
  {
    id: "zaffran",
    name: "Zaffran",
    property: "Astra Hotels & Suites, Marathahalli",
    propertyId: "marathahalli",
    tagline: "Authentic Flavours of the North West Frontier",
    cuisine: "North West Frontier Cuisine",
    hours: "11:00 AM – 12:00 AM",
    phone: "+91 80 XXXX XXXX",
    longDescription:
      "Every dish at Zaffran is a journey to the rugged, spice-laden kitchens of the North West Frontier. Our chefs slow-cook in traditional clay ovens, coaxing deep, smoky flavours from the finest cuts of meat. Pair your meal with our curated wine list or hand-selected spirits for an evening that lingers in memory.",
    rating: 4.5,
    ratingLabel: "Rating: 4.5 out of 5 stars",
    images: [
      { src: "/media/restaurants/zaffran-main.jpg", alt: "Zaffran restaurant interior with warm amber lighting and traditional decor" },
      { src: "/media/restaurants/zaffran-2.jpg", alt: "Signature North West Frontier dishes at Zaffran including kebabs and tandoor breads" },
    ],
    tour360Hdr: "/media/360/hdr-png/zaffran-360.jpg",
    highlights: ["Slow-cooked Kebabs", "Tender Lamb Dishes", "Curated Wine List", "Traditional Clay Oven"],
    accentColor: "#c9a84c",
    imageLeft: true,
  },
  {
    id: "tbc",
    name: "TBC",
    property: "Astra Hotels & Suites, HSR Layout Sector 1",
    propertyId: "hsr-sector-1",
    tagline: "Modern Gastropub & Lounge",
    cuisine: "Modern Indian · Continental · Craft Bar",
    hours: "11:00 AM – 11:00 PM",
    phone: "+91 80 XXXX XXXX",
    longDescription:
      "TBC redefines the gastro-social experience. Whether you're winding down after a long day at a nearby tech park or catching up with friends over craft beers, TBC delivers on every front — bold flavours, energetic ambience, and a curated selection of premium spirits and ales from around the world.",
    rating: 4.3,
    ratingLabel: "Rating: 4.3 out of 5 stars",
    images: [
      { src: "/media/restaurants/tbc-1.jpg", alt: "TBC gastropub bar area with craft beer taps and warm neon lighting" },
      { src: "/media/restaurants/tbc-2.jpg", alt: "TBC seating area with industrial-chic decor" },
      { src: "/media/restaurants/tbc-3.jpg", alt: "Handcrafted cocktails at TBC bar" },
      { src: "/media/restaurants/tbc-4.jpg", alt: "TBC signature dishes featuring bold Indian and continental cuisine" },
      { src: "/media/restaurants/tbc-5.jpg", alt: "TBC lounge area in the evening" },
      { src: "/media/restaurants/tbc-6.jpg", alt: "TBC outdoor seating under warm lights" },
    ],
    tour360Hdr: "/media/360/hdr-png/tbc-360.jpg",
    highlights: ["Craft Beer Selection", "Handcrafted Cocktails", "Bold Indian Flavours", "Global Comfort Food"],
    accentColor: "#4ade80",
    imageLeft: false,
  },
  {
    id: "sunshine",
    name: "Sunshine Cafe",
    property: "Astra Hotels & Suites, Koramangala",
    propertyId: "koramangala",
    tagline: "All-Day Dining in the Heart of Koramangala",
    cuisine: "All-day Dining · Cafe · Multi-cuisine",
    hours: "7:00 AM – 11:00 PM",
    phone: "+91 80 XXXX XXXX",
    longDescription:
      "Sunshine Cafe is a sanctuary of calm in the heart of bustling Koramangala. From freshly brewed single-origin coffees to hearty multi-cuisine meals, every visit is a celebration of simplicity and quality. Our all-day menu caters to every mood — whether it's a quick power breakfast before a long day or a leisurely weekend brunch.",
    rating: 4.4,
    ratingLabel: "Rating: 4.4 out of 5 stars",
    images: [
      { src: "/media/restaurants/sunshine-sunshine-1.jpg", alt: "Sunshine Cafe interior with natural light streaming through large windows" },
      { src: "/media/restaurants/sunshine-sunshine-2.jpg", alt: "Fresh breakfast spread at Sunshine Cafe with pastries and fruit" },
    ],
    tour360Hdr: "/media/360/hdr-png/sunshine-360.jpg",
    highlights: ["Fresh Breakfast Menus", "Single-Origin Coffees", "Healthy Options", "Bright, Airy Ambience"],
    accentColor: "#f59e0b",
    imageLeft: true,
  },
]

type Restaurant = (typeof RESTAURANTS)[number]

// ─── Star rating ───────────────────────────────────────────────────────────

function StarRating({ rating, label }: { rating: number; label: string }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const empty = 5 - full - (half ? 1 : 0)
  const stars = "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty)
  return (
    <div role="img" aria-label={label}>
      <span aria-hidden="true" style={{ fontSize: "18px", letterSpacing: "2px", color: "#c9a84c" }}>
        {stars}
      </span>
    </div>
  )
}

// ─── Image gallery ─────────────────────────────────────────────────────────

function ImageGallery({
  images,
}: {
  images: readonly { src: string; alt: string }[]
}) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [liveText, setLiveText] = useState("")

  function select(i: number) {
    setActiveIdx(i)
    setLiveText(`Now showing: ${images[i].alt}`)
  }

  return (
    <div>
      <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
        <Image
          src={images[activeIdx].src}
          alt={images[activeIdx].alt}
          width={640}
          height={420}
          style={{ width: "100%", height: "380px", objectFit: "cover", display: "block" }}
        />
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {images.map((img, i) => (
            <button
              key={i}
              aria-label={`View photo ${i + 1}: ${img.alt}`}
              aria-pressed={i === activeIdx}
              onClick={() => select(i)}
              style={{
                padding: 0,
                border: `2px solid ${i === activeIdx ? "#c9a84c" : "rgba(0,0,0,0.15)"}`,
                borderRadius: "6px",
                overflow: "hidden",
                cursor: "pointer",
                background: "none",
                transition: "border-color 0.2s, transform 0.2s",
                transform: i === activeIdx ? "scale(1.05)" : "scale(1)",
              }}
            >
              <Image
                src={img.src}
                alt=""
                width={72}
                height={48}
                style={{ width: "72px", height: "48px", objectFit: "cover", display: "block" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Restaurant card ───────────────────────────────────────────────────────

const metaDtStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "11px",
  textTransform: "uppercase", letterSpacing: "0.1em",
  color: "#8a6a9a", minWidth: "68px", paddingTop: "1px",
}
const metaDdStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "13px", color: "#5a4a6a",
}

type RestaurantCardProps = {
  restaurant: Restaurant
  idx: number
  onOpen360: () => void
  tourBtnRef: (el: HTMLButtonElement | null) => void
}

function RestaurantCard({ restaurant, idx, onOpen360, tourBtnRef }: RestaurantCardProps) {
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) return
    el.style.opacity = "0"
    el.style.transform = "translateY(48px)"
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transition = "opacity 0.7s ease, transform 0.7s ease"
          el.style.opacity = "1"
          el.style.transform = "none"
          obs.disconnect()
        }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const isEven = idx % 2 === 0

  return (
    <article
      ref={cardRef}
      aria-label={restaurant.name}
      className="dining-card"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "80px",
        alignItems: "center",
        marginBottom: "120px",
        direction: isEven ? "ltr" : "rtl",
      }}
    >
      <div style={{ direction: "ltr" }}>
        <ImageGallery images={restaurant.images} />
      </div>

      <div style={{ direction: "ltr" }}>
        <p style={{
          fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: restaurant.accentColor, marginBottom: "12px",
        }}>
          {restaurant.cuisine}
        </p>

        <h3 style={{
          fontFamily: "var(--font-cormorant)", fontWeight: 300,
          fontSize: "clamp(2.2rem, 4vw, 3.2rem)", color: "#0a0a0a",
          lineHeight: 1.05, marginBottom: "8px",
        }}>
          {restaurant.name}
        </h3>

        <p style={{
          fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 400,
          fontSize: "1.2rem", color: "#561d70", marginBottom: "14px",
        }}>
          {restaurant.tagline}
        </p>

        <StarRating rating={restaurant.rating} label={restaurant.ratingLabel} />

        <p style={{
          fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "15px",
          color: "#5a4a6a", lineHeight: 1.75, margin: "16px 0 24px",
        }}>
          {restaurant.longDescription}
        </p>

        <ul
          aria-label={`${restaurant.name} highlights`}
          style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "28px" }}
        >
          {restaurant.highlights.map((h) => (
            <li key={h}>
              <span style={{
                display: "inline-block", padding: "5px 14px",
                background: "#f5f0ff", color: "#561d70",
                border: "1px solid #d8b4f8", borderRadius: "20px",
                fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 500,
              }}>
                {h}
              </span>
            </li>
          ))}
        </ul>

        <dl style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <dt style={metaDtStyle}>Hours</dt>
            <dd style={metaDdStyle}>{restaurant.hours}</dd>
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <dt style={metaDtStyle}>Location</dt>
            <dd style={metaDdStyle}>{restaurant.property}</dd>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <dt style={metaDtStyle}>Reservations</dt>
            <dd style={metaDdStyle}>
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                style={{ color: "#561d70", textDecoration: "none" }}
              >
                {restaurant.phone}
              </a>
            </dd>
          </div>
        </dl>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href={`/property/${restaurant.propertyId}`}
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "13px 28px",
              background: "#561d70", color: "white",
              borderRadius: "6px",
              fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
          >
            Book a Table
          </Link>
          <a
            href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "13px 28px",
              background: "transparent", color: "#561d70",
              border: "1.5px solid #561d70", borderRadius: "6px",
              fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f0ff" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
          >
            Call Now
          </a>
          <button
            ref={tourBtnRef}
            onClick={onOpen360}
            aria-label={`TAKE A 360° TOUR — ${restaurant.name}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "13px 28px",
              background: "transparent", color: "#561d70",
              border: "1.5px solid #561d70", borderRadius: "6px",
              fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f0ff" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
          >
            <span aria-hidden="true">🎯</span>
            TAKE A 360° TOUR
          </button>
        </div>
      </div>
    </article>
  )
}

// ─── Reservation section ───────────────────────────────────────────────────

function ReservationSection() {
  return (
    <section
      aria-labelledby="reservation-heading"
      style={{ background: "#faf7fc", padding: "96px 48px", borderTop: "1px solid #e8d5f0" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <p style={{
          fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#561d70", textAlign: "center", marginBottom: "16px",
        }}>
          Reserve Your Experience
        </p>
        <h2
          id="reservation-heading"
          style={{
            fontFamily: "var(--font-cormorant)", fontWeight: 300,
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "#2d1b3d",
            textAlign: "center", marginBottom: "56px",
          }}
        >
          Make a Reservation
        </h2>

        <div className="reservation-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px" }}>
          {RESTAURANTS.map((r) => (
            <div
              key={r.id}
              style={{
                borderRadius: "16px", background: "white",
                border: "1px solid #e0d0ec", overflow: "hidden",
                boxShadow: "0 4px 24px rgba(86,29,112,0.06)",
              }}
            >
              <div style={{ position: "relative", height: "200px" }}>
                <Image
                  src={r.images[0].src}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                />
                <div
                  aria-hidden="true"
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)" }}
                />
                <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px" }}>
                  <p style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "1.5rem", color: "white", lineHeight: 1.1, marginBottom: "2px" }}>
                    {r.name}
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.8)" }}>
                    {r.property}
                  </p>
                </div>
              </div>
              <div style={{ padding: "24px" }}>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a", marginBottom: "4px" }}>
                  {r.cuisine}
                </p>
                <p style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "13px", color: "#2d1b3d", marginBottom: "20px" }}>
                  Open {r.hours}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <Link
                    href={`/property/${r.propertyId}`}
                    style={{
                      display: "block", textAlign: "center", padding: "11px 0",
                      background: "#561d70", color: "white", borderRadius: "6px",
                      fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
                      letterSpacing: "0.06em", textDecoration: "none", transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
                  >
                    Book Now
                  </Link>
                  <a
                    href={`tel:${r.phone.replace(/\s/g, "")}`}
                    style={{
                      display: "block", textAlign: "center", padding: "11px 0",
                      background: "transparent", color: "#561d70",
                      border: "1.5px solid #561d70", borderRadius: "6px",
                      fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "13px",
                      letterSpacing: "0.06em", textDecoration: "none", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f0ff" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                  >
                    {r.phone}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Cross-promo banner ────────────────────────────────────────────────────

function CrossPromoBanner() {
  return (
    <aside
      aria-label="Discover Astra Hotels properties across Bangalore"
      style={{
        background: "linear-gradient(135deg, #0a1a0a 0%, #1a4a1a 60%, #0f2e0f 100%)",
        padding: "80px 48px",
        textAlign: "center",
      }}
    >
      <p style={{
        fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px",
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "#4ade80", marginBottom: "16px",
      }}>
        Astra Hotels Across Bangalore
      </p>
      <h2 style={{
        fontFamily: "var(--font-cormorant)", fontWeight: 300,
        fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "white", marginBottom: "20px",
      }}>
        Stay Where You Dine
      </h2>
      <p style={{
        fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "16px",
        color: "rgba(255,255,255,0.75)", maxWidth: "560px",
        margin: "0 auto 40px", lineHeight: 1.75,
      }}>
        Each Astra property brings a unique dining experience. Explore all 8 locations across Bangalore and find the perfect base for your stay.
      </p>
      <Link
        href="/#properties"
        style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "16px 40px",
          background: "#1a4a1a", color: "white",
          border: "1.5px solid #4ade80", borderRadius: "6px",
          fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px",
          letterSpacing: "0.1em", textTransform: "uppercase",
          textDecoration: "none", transition: "all 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#2d6b2d"; e.currentTarget.style.transform = "scale(1.02)" }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#1a4a1a"; e.currentTarget.style.transform = "scale(1)" }}
      >
        Explore All Properties →
      </Link>
    </aside>
  )
}

// ─── Hero ──────────────────────────────────────────────────────────────────

function DiningHero() {
  const heroRef = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!heroRef.current || !imgRef.current) return
      gsap.to(imgRef.current, {
        y: 180,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      })
    })

    mm.add("(prefers-reduced-motion: reduce)", () => {})

    return () => { mm.revert() }
  }, [])

  return (
    <section
      ref={heroRef}
      aria-label="Dining at Astra Hotels"
      className="dark-bg"
      style={{ position: "relative", height: "100vh", overflow: "hidden" }}
    >
      <div
        ref={imgRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, height: "130%", top: "-15%" }}
      >
        <Image
          src="/media/restaurants/zaffran-main.jpg"
          alt=""
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,5,20,0.75) 60%, rgba(10,5,20,0.96) 100%)" }}
      />

      <div style={{
        position: "relative", zIndex: 1, height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        textAlign: "center", padding: "0 48px",
      }}>
        <p style={{
          fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#c9a84c", marginBottom: "24px",
        }}>
          The Astra Dining Collection
        </p>
        <h1 style={{
          fontFamily: "var(--font-cormorant)", fontWeight: 300,
          fontSize: "clamp(3rem, 8vw, 5.5rem)", color: "white",
          lineHeight: 1.0, marginBottom: "24px",
        }}>
          Extraordinary Dining,<br />
          <em>Three Distinct Experiences</em>
        </h1>
        <p style={{
          fontFamily: "var(--font-inter)", fontWeight: 300,
          fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.75)",
          maxWidth: "600px", lineHeight: 1.75, marginBottom: "48px",
        }}>
          From frontier-spiced kebabs at Zaffran to craft cocktails at TBC and sun-lit mornings at Sunshine Cafe — savour Bangalore through the lens of Astra.
        </p>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="#restaurants"
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "15px 36px",
              background: "#561d70", color: "white", borderRadius: "6px",
              fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              textDecoration: "none", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
          >
            Explore Restaurants
          </a>
        </div>
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", opacity: 0.55,
        }}
      >
        <span style={{ fontFamily: "var(--font-inter)", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "white" }}>Scroll</span>
        <div style={{ width: "1px", height: "40px", background: "linear-gradient(to bottom, white, transparent)" }} />
      </div>
    </section>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────

export function DiningPageClient() {
  const [activeTourId, setActiveTourId] = useState<string | null>(null)
  const tourTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const activeRestaurant = RESTAURANTS.find((r) => r.id === activeTourId) ?? null

  return (
    <>
      <Navigation />

      <main id="main-content" tabIndex={-1}>
        <DiningHero />

        <section id="restaurants" aria-labelledby="restaurants-heading" style={{ padding: "120px 48px 0", background: "white" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "80px" }}>
              <p style={{
                fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "12px",
                letterSpacing: "0.18em", textTransform: "uppercase", color: "#561d70", marginBottom: "16px",
              }}>
                Signature Restaurants
              </p>
              <h2
                id="restaurants-heading"
                style={{
                  fontFamily: "var(--font-cormorant)", fontWeight: 300,
                  fontSize: "clamp(2rem, 4vw, 3rem)", color: "#0a0a0a",
                }}
              >
                Three Restaurants, One Collection
              </h2>
            </div>
            {RESTAURANTS.map((r, i) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                idx={i}
                onOpen360={() => setActiveTourId(r.id)}
                tourBtnRef={(el) => {
                  if (el) tourTriggerRefs.current.set(r.id, el)
                  else tourTriggerRefs.current.delete(r.id)
                }}
              />
            ))}
          </div>
        </section>

        <ReservationSection />
        <CrossPromoBanner />
      </main>

      <Footer />

      {activeTourId && activeRestaurant && (
        <PanoramaViewer
          isOpen={true}
          title={`${activeRestaurant.name} — 360° Tour`}
          scenes={[{ id: "main", label: activeRestaurant.name, icon: "🍽", file: activeRestaurant.tour360Hdr }]}
          onClose={() => {
            const id = activeTourId
            setActiveTourId(null)
            setTimeout(() => tourTriggerRefs.current.get(id)?.focus(), 0)
          }}
        />
      )}

      <style>{`
        @media (max-width: 1023px) {
          .dining-card {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
            direction: ltr !important;
          }
          .dining-card > div { direction: ltr !important; }
        }
        @media (max-width: 767px) {
          .reservation-grid { grid-template-columns: 1fr !important; }
          #restaurants { padding: 80px 20px 0 !important; }
          [aria-labelledby="reservation-heading"] { padding: 64px 20px !important; }
          [aria-label="Discover Astra Hotels properties across Bangalore"] { padding: 64px 20px !important; }
        }
      `}</style>
    </>
  )
}
