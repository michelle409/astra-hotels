"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Wifi, Thermometer, Wind, Coffee, Droplets, Eye, Moon,
  Bell, Utensils, Users, ChevronDown, ChevronUp,
} from "lucide-react"
import { ROOMS, type Property, type Room } from "@/lib/data"
import { Navigation } from "@/components/Navigation"
import { Footer } from "@/components/Footer"
import { formatPrice } from "@/lib/utils"
import { GlassDatePicker, type DateSelection } from "@/components/GlassDatePicker"
import PanoramaViewer from "@/components/PanoramaViewer"

// ─── Supplemental room detail data ────────────────────────────────────────

type RoomDetail = {
  mrp: number
  discount: number
  breakfastPrice: number
  cashbackBase: number
  cashbackBreakfast: number
  tags: { label: string; color: "green" | "blue" | "purple" }[]
  filterKeys: string[]
  amenities: { Icon: React.ElementType; label: string }[]
}

const ROOM_DETAIL: Record<string, RoomDetail> = {
  "family-room": {
    mrp: 6999, discount: 29, breakfastPrice: 5699, cashbackBase: 400, cashbackBreakfast: 350,
    tags: [
      { label: "Recommended", color: "green" },
      { label: "Kids Stay Free", color: "green" },
      { label: "Family Favorite", color: "blue" },
    ],
    filterKeys: ["King Bed", "City View", "Breakfast Included", "Non-smoking"],
    amenities: [
      { Icon: Eye, label: "City view" },
      { Icon: Coffee, label: "Electric kettle" },
      { Icon: Droplets, label: "Private bathroom" },
      { Icon: Wind, label: "Hair dryer" },
      { Icon: Wifi, label: "Wi-Fi (free)" },
      { Icon: Moon, label: "Blackout curtains" },
      { Icon: Thermometer, label: "Air conditioning" },
      { Icon: Bell, label: "Room service" },
    ],
  },
  "superior-club": {
    mrp: 5999, discount: 33, breakfastPrice: 4599, cashbackBase: 300, cashbackBreakfast: 280,
    tags: [
      { label: "Extended Stay", color: "blue" },
      { label: "Kitchen Included", color: "green" },
      { label: "Popular Choice", color: "purple" },
    ],
    filterKeys: ["King Bed", "Kitchen", "Breakfast Included", "Non-smoking"],
    amenities: [
      { Icon: Coffee, label: "Electric kettle" },
      { Icon: Utensils, label: "Separate kitchen" },
      { Icon: Droplets, label: "Private bathroom" },
      { Icon: Wind, label: "Hair dryer" },
      { Icon: Wifi, label: "Wi-Fi (free)" },
      { Icon: Thermometer, label: "Air conditioning" },
      { Icon: Bell, label: "Room service" },
    ],
  },
  "premium-king": {
    mrp: 4499, discount: 33, breakfastPrice: 3499, cashbackBase: 250, cashbackBreakfast: 230,
    tags: [
      { label: "Recommended", color: "green" },
      { label: "Preferred by Couples", color: "blue" },
      { label: "Business Favorite", color: "purple" },
    ],
    filterKeys: ["King Bed", "Breakfast Included", "Non-smoking"],
    amenities: [
      { Icon: Coffee, label: "Electric kettle" },
      { Icon: Droplets, label: "Private bathroom" },
      { Icon: Wind, label: "Hair dryer" },
      { Icon: Wifi, label: "Wi-Fi (free)" },
      { Icon: Moon, label: "Blackout curtains" },
      { Icon: Thermometer, label: "Air conditioning" },
      { Icon: Bell, label: "Room service" },
    ],
  },
  "premium-twin": {
    mrp: 4199, discount: 33, breakfastPrice: 3299, cashbackBase: 200, cashbackBreakfast: 180,
    tags: [
      { label: "Preferred by Colleagues", color: "blue" },
      { label: "Non-smoking", color: "green" },
      { label: "Good Value", color: "purple" },
    ],
    filterKeys: ["Twin Bed", "Breakfast Included", "Non-smoking"],
    amenities: [
      { Icon: Coffee, label: "Electric kettle" },
      { Icon: Droplets, label: "Private bathroom" },
      { Icon: Wind, label: "Hair dryer" },
      { Icon: Wifi, label: "Wi-Fi (free)" },
      { Icon: Thermometer, label: "Air conditioning" },
      { Icon: Bell, label: "Room service" },
    ],
  },
}

const FILTER_CHIPS = [
  "Breakfast Included",
  "Non-smoking",
  "Twin Bed",
  "King Bed",
  "Kitchen",
  "City View",
]

const TAG_COLORS = {
  green:  { bg: "#f0faf0", color: "#1a5c1a", border: "#b3ddb3" },
  blue:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  purple: { bg: "#f5f0ff", color: "#561d70", border: "#d8b4f8" },
}

function getRoomScenes(roomId: string) {
  const bedroomFiles: Record<string, string> = {
    "family-room": "/media/360/hdr-png/family-room-360.jpg",
    "superior-club": "/media/360/hdr-png/superior-club-360.jpg",
    "premium-king": "/media/360/hdr-png/premium-king-360.jpg",
    "premium-twin": "/media/360/hdr-png/premium-twin-360.jpg",
  }
  return [
    { id: "bedroom", label: "Bedroom", icon: "🛏", file: bedroomFiles[roomId] || bedroomFiles["family-room"] },
    { id: "bathroom", label: "Bathroom", icon: "🚿", file: "/media/360/hdr-png/bathroom.jpg" },
  ]
}

function slugHash(slug: string): number {
  return slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function getLastBooked(slug: string, idx: number): number {
  return ((slugHash(slug) + idx * 3) % 8) + 1
}

// ─── RoomCard ──────────────────────────────────────────────────────────────

type RoomCardProps = {
  room: Room
  property: Property
  detail: RoomDetail
  soldOut: boolean
  expanded: boolean
  onToggleExpand: () => void
  onBook: (room: Room) => void
  onOpen360: () => void
  tourBtnRef: (el: HTMLButtonElement | null) => void
  slug: string
  idx: number
}

function RoomCard({
  room, property: _property, detail, soldOut, expanded,
  onToggleExpand, onBook, onOpen360, tourBtnRef, slug, idx,
}: RoomCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const lastBooked = getLastBooked(slug, idx)
  const offersId = `offers-${room.id}`

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) { el.style.opacity = "1"; el.style.transform = "none"; return }
    el.style.opacity = "0"
    el.style.transform = "translateY(32px)"
    el.style.transition = `opacity 0.6s ease ${idx * 0.12}s, transform 0.6s ease ${idx * 0.12}s`
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "none"; obs.disconnect() }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [idx])

  const colBorder = "1px solid #f0e8f7"

  return (
    <article
      ref={cardRef}
      aria-label={soldOut ? `${room.name} — sold out` : room.name}
      style={{ border: "1px solid #e0d0ec", borderRadius: "12px", background: "white", overflow: "hidden", marginBottom: "24px" }}
    >
      <div className="pdc-grid">

        {/* ── LEFT: Image + Info ── */}
        <div style={{ padding: "20px", borderRight: colBorder, opacity: soldOut ? 0.55 : 1 }}>
          <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", marginBottom: "12px" }}>
            {/* Decorative badge — same info repeated in right col for AT */}
            <span aria-hidden="true" style={{
              position: "absolute", top: 8, left: 8, zIndex: 2,
              background: "#561d70", color: "white",
              padding: "3px 8px", borderRadius: "4px",
              fontFamily: "var(--font-inter)", fontSize: "10px", fontWeight: 500,
            }}>
              Booked {lastBooked}h ago
            </span>
            <span aria-hidden="true" style={{
              position: "absolute", bottom: 8, right: 8, zIndex: 2,
              background: "rgba(0,0,0,0.55)", color: "white",
              padding: "2px 7px", borderRadius: "4px",
              fontFamily: "var(--font-inter)", fontSize: "11px",
            }}>
              1 / 3
            </span>
            <Image
              src={room.image}
              alt={room.name}
              width={280}
              height={180}
              style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
            />
          </div>

          {!soldOut && (
            <>
              <a
                href="#"
                aria-label={`See photos of ${room.name}`}
                onClick={(e) => e.preventDefault()}
                style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#561d70", textDecoration: "underline", marginBottom: "8px", display: "block" }}
              >
                See photos
              </a>
              <button
                ref={tourBtnRef}
                onClick={onOpen360}
                aria-label={`TAKE A 360° TOUR — ${room.name}`}
                style={{
                  display: "block", width: "100%", marginBottom: "12px",
                  padding: "7px 10px",
                  border: "1.5px solid #561d70", borderRadius: "6px",
                  background: "transparent", color: "#561d70",
                  fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600,
                  cursor: "pointer", textAlign: "center",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}
              >
                <span aria-hidden="true">🎯 </span>TAKE A 360° TOUR
              </button>
            </>
          )}

          <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600, fontSize: "1.2rem", color: "#2d1b3d", marginBottom: "8px" }}>
            {room.name}
          </h3>

          <ul aria-label="Room specifications" style={{ listStyle: "none", marginBottom: "12px" }}>
            <li style={specStyle}>{room.size}</li>
            <li style={specStyle}>
              <Users size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
              Max {room.maxGuests} guests
            </li>
            <li style={specStyle}>{room.beds}</li>
          </ul>

          <ul aria-label="Room highlights" style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "16px" }}>
            {detail.tags.map(tag => {
              const s = TAG_COLORS[tag.color]
              return (
                <li key={tag.label}>
                  <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: "2px 8px", borderRadius: "4px", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 500 }}>
                    {tag.label}
                  </span>
                </li>
              )
            })}
          </ul>

          <ul aria-label="Room amenities" style={{ listStyle: "none" }}>
            {detail.amenities.map(({ Icon, label }) => (
              <li key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-inter)", fontSize: "12px", color: "#5a4a6a", marginBottom: "5px" }}>
                <Icon size={13} aria-hidden="true" color="#561d70" style={{ flexShrink: 0 }} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* ── MIDDLE: Offers ── */}
        <div style={{ padding: "20px", borderRight: colBorder }}>
          {soldOut ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "16px", color: "#c62828", marginBottom: "8px" }}>Sold out</p>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#8a6a9a" }}>
                This room type is fully booked for your selected dates.
              </p>
            </div>
          ) : (
            <>
              {/* Offer 1 */}
              <div
                role="group"
                aria-label={`Lowest price offer — ${room.name}`}
                style={{ borderRadius: "8px", border: "1px solid #ffd0d0", overflow: "hidden", marginBottom: "12px" }}
              >
                <div style={{ background: "#d32f2f", color: "white", padding: "5px 12px" }}>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em" }}>
                    LOWEST PRICE
                  </p>
                </div>
                <div style={{ padding: "12px" }}>
                  <ul style={{ listStyle: "none" }}>
                    {[
                      { icon: <Users size={12} aria-hidden="true" />, text: "2 adults" },
                      { icon: null, text: "Breakfast available (₹525/person)" },
                      { icon: null, text: "Non-refundable — Low price!" },
                      { icon: null, text: "Pay at hotel" },
                      { icon: null, text: "Free fitness center access" },
                      { icon: null, text: "Free Parking" },
                      { icon: null, text: "Express check-in" },
                      { icon: <Wifi size={12} aria-hidden="true" />, text: "Free WiFi" },
                    ].map((item, i) => (
                      <li key={i} style={offerItemStyle}>
                        {item.icon}{item.text}
                      </li>
                    ))}
                    <li style={{ ...offerItemStyle, color: "#1a5c1a", fontWeight: 500 }}>
                      Cashback: {formatPrice(detail.cashbackBase)}{" "}
                      <span style={{ fontWeight: 300 }}>(Terms apply)</span>
                    </li>
                  </ul>
                  <a
                    href="#"
                    aria-label={`See details for lowest price offer — ${room.name}`}
                    onClick={(e) => e.preventDefault()}
                    style={seeDetailsStyle}
                  >
                    See details
                  </a>
                </div>
              </div>

              <button
                aria-expanded={expanded}
                aria-controls={offersId}
                onClick={onToggleExpand}
                style={toggleBtnStyle}
              >
                {expanded ? "Hide offers" : "Show more offers"}
                {expanded
                  ? <ChevronUp size={14} aria-hidden="true" />
                  : <ChevronDown size={14} aria-hidden="true" />
                }
              </button>

              {/* Offer 2 */}
              <div
                id={offersId}
                hidden={!expanded}
                role="group"
                aria-label={`Breakfast included offer — ${room.name}`}
                style={{ borderRadius: "8px", border: "1px solid #c8e6c9", overflow: "hidden", marginTop: "8px" }}
              >
                <div style={{ background: "#2e7d32", color: "white", padding: "5px 12px" }}>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em" }}>
                    BREAKFAST INCLUDED
                  </p>
                </div>
                <div style={{ padding: "12px" }}>
                  <ul style={{ listStyle: "none" }}>
                    {[
                      { icon: null, text: "Breakfast Included", green: true },
                      { icon: <Users size={12} aria-hidden="true" />, text: "2 adults", green: false },
                      { icon: null, text: "Free cancellation (until 24h before)", green: false },
                      { icon: null, text: "Pay at hotel", green: false },
                      { icon: null, text: "Free fitness center access", green: false },
                      { icon: <Wifi size={12} aria-hidden="true" />, text: "Free WiFi", green: false },
                    ].map((item, i) => (
                      <li key={i} style={{ ...offerItemStyle, color: item.green ? "#1a5c1a" : "#5a4a6a", fontWeight: item.green ? 600 : 400 }}>
                        {item.icon}{item.text}
                      </li>
                    ))}
                    <li style={{ ...offerItemStyle, color: "#1a5c1a", fontWeight: 500 }}>
                      Cashback: {formatPrice(detail.cashbackBreakfast)}{" "}
                      <span style={{ fontWeight: 300 }}>(Terms apply)</span>
                    </li>
                  </ul>
                  <a
                    href="#"
                    aria-label={`See details for breakfast included offer — ${room.name}`}
                    onClick={(e) => e.preventDefault()}
                    style={seeDetailsStyle}
                  >
                    See details
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Pricing + Book ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          {soldOut ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", color: "#aaa", marginBottom: "20px" }}>
                Sold out at {formatPrice(detail.mrp)}
              </p>
              {/* aria-disabled only — NOT disabled — so keyboard users can reach and hear the sold-out state */}
              <button
                aria-disabled="true"
                aria-label={`${room.name} is currently sold out`}
                onClick={(e) => e.preventDefault()}
                style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#ddd", color: "#888", border: "none", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", cursor: "not-allowed" }}
              >
                Sold Out
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "11px", color: "#1a5c1a", marginBottom: "6px" }}>
                Cheapest price!
              </p>

              {/* Strikethrough MRP — sr-only provides context, del is aria-hidden */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="sr-only">Original price</span>
                <del aria-hidden="true" style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#999" }}>
                  {formatPrice(detail.mrp)}
                </del>
                <span aria-hidden="true" style={{ background: "#2e7d32", color: "white", padding: "1px 7px", borderRadius: "4px", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "11px" }}>
                  -{detail.discount}%
                </span>
              </div>

              {/* Current price — aria-label on wrapper, visible span is aria-hidden */}
              <p
                aria-label={`Current price: ${formatPrice(room.basePrice)} per night`}
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: "2rem", color: "#2d1b3d", lineHeight: 1, marginBottom: "4px" }}
              >
                <span aria-hidden="true">{formatPrice(room.basePrice)}</span>
              </p>

              <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#1a5c1a", marginBottom: "2px" }}>
                <span aria-hidden="true">🇮🇳 </span>
                Cashback: {formatPrice(detail.cashbackBase)} applied
              </p>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "11px", color: "#8a6a9a", marginBottom: "16px" }}>
                Per night before taxes
              </p>

              <label htmlFor={`rooms-${room.id}`} className="sr-only">Number of rooms</label>
              <select
                id={`rooms-${room.id}`}
                defaultValue="1"
                style={{ width: "100%", height: "36px", borderRadius: "6px", border: "1px solid #d0c0e0", fontFamily: "var(--font-inter)", fontSize: "13px", padding: "0 8px", marginBottom: "10px", color: "#2d1b3d" }}
              >
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} room{n > 1 ? "s" : ""}</option>)}
              </select>

              <button
                aria-label={`Book ${room.name} — ${formatPrice(room.basePrice)} per night`}
                onClick={() => onBook(room)}
                style={bookBtnStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
              >
                Book
              </button>

              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "11px", color: "#8a6a9a", textAlign: "center", marginBottom: "6px" }}>
                It only takes 2 minutes
              </p>
              {/* Static "last booked" — no aria-live needed */}
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "#1a5c1a", textAlign: "center" }}>
                Last booked {lastBooked} hours ago
              </p>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

// ─── Shared micro-styles ───────────────────────────────────────────────────

const specStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "5px",
  fontFamily: "var(--font-inter)", fontSize: "12px", color: "#5a4a6a", marginBottom: "4px",
}

const offerItemStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "5px",
  fontFamily: "var(--font-inter)", fontSize: "12px", color: "#5a4a6a", marginBottom: "4px",
}

const seeDetailsStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)", fontSize: "12px", color: "#561d70",
  textDecoration: "underline", marginTop: "6px", display: "block",
}

const toggleBtnStyle: React.CSSProperties = {
  width: "100%", background: "none", border: "none",
  fontFamily: "var(--font-inter)", fontSize: "13px", color: "#561d70",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
  padding: "6px 0",
}

const bookBtnStyle: React.CSSProperties = {
  width: "100%", padding: "12px 0", borderRadius: "8px",
  background: "#561d70", color: "white", border: "none",
  fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px",
  textTransform: "uppercase", letterSpacing: "0.06em",
  cursor: "pointer", marginBottom: "8px", transition: "background 0.2s",
}

// ─── Date helpers ─────────────────────────────────────────────────────────

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function fmtBarDate(d: Date) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${months[d.getMonth()]} ${d.getDate()}`
}

function nightsBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

// ─── Main exported component ───────────────────────────────────────────────

export function PropertyDetailClient({ property }: { property: Property }) {
  const router = useRouter()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())
  const [activeTourRoomId, setActiveTourRoomId] = useState<string | null>(null)
  const tourTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Date picker state
  const [showPicker, setShowPicker] = useState(true)
  const [dateSelection, setDateSelection] = useState<DateSelection | null>(null)
  const changeDatesBtnRef = useRef<HTMLButtonElement>(null)

  const hash = slugHash(property.id)
  const showUrgency = hash % 3 !== 0
  const soldOutGlobalIdx = hash % 2 === 0 ? null : hash % 4

  function handlePickerConfirm(sel: DateSelection) {
    setDateSelection(sel)
    setShowPicker(false)
    // Smooth scroll to rooms after overlay closes
    setTimeout(() => {
      document.getElementById("rooms-heading")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  }

  function handlePickerClose() {
    setShowPicker(false)
  }

  function buildBookingUrl(roomId: string) {
    const base = `/booking/${property.id}?room=${roomId}`
    if (!dateSelection) return base
    const params = new URLSearchParams({
      room: roomId,
      checkIn: toISODate(dateSelection.checkIn),
      checkOut: toISODate(dateSelection.checkOut),
      rooms: String(dateSelection.rooms),
      adults: String(dateSelection.adults),
    })
    return `/booking/${property.id}?${params.toString()}`
  }

  function toggleFilter(chip: string) {
    setActiveFilters(prev =>
      prev.includes(chip) ? prev.filter(f => f !== chip) : [...prev, chip]
    )
  }

  function toggleExpand(roomId: string) {
    setExpandedRooms(prev => {
      const next = new Set(prev)
      next.has(roomId) ? next.delete(roomId) : next.add(roomId)
      return next
    })
  }

  const visibleRooms = ROOMS.filter(room => {
    if (activeFilters.length === 0) return true
    const detail = ROOM_DETAIL[room.id]
    if (!detail) return false
    return activeFilters.every(f => detail.filterKeys.includes(f))
  })

  // How far down the sticky bars sit
  const dateBarpx = dateSelection ? 48 : 0
  const filterTop = `${72 + dateBarpx}px`

  return (
    <>
      <Navigation />

      {/* ── GLASSMORPHISM DATE PICKER OVERLAY ── */}
      <GlassDatePicker
        propertyName={property.name}
        propertyLocation={property.location}
        heroImage={property.heroImage}
        isOpen={showPicker}
        onConfirm={handlePickerConfirm}
        onClose={handlePickerClose}
        triggerRef={changeDatesBtnRef}
      />

      <main id="main-content" tabIndex={-1} style={{ paddingTop: "72px" }}>

        {/* ── HERO ── */}
        <section
          aria-label={`${property.name}, ${property.location} — hero`}
          className="dark-bg"
          style={{ position: "relative", height: "65vh", minHeight: "460px", overflow: "hidden" }}
        >
          <Image
            src={property.heroImage}
            alt=""
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.7) 100%)" }} />
          <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "48px 64px", maxWidth: "1344px", margin: "0 auto", boxSizing: "border-box", width: "100%" }}>
            <Link
              href="/"
              aria-label="Back to all properties"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-inter)", fontSize: "13px", textDecoration: "none", marginBottom: "24px", width: "fit-content" }}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              All properties
            </Link>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", lineHeight: 1.1, marginBottom: "8px" }}>
              {property.name} —<br />
              <em>{property.location}</em>
            </h1>
            <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.75)", marginBottom: "12px" }}>
              {property.address}
            </p>
            <div aria-label="Star rating: 4 stars" style={{ display: "flex", gap: "4px" }}>
              {[1, 2, 3, 4].map(n => (
                <span key={n} aria-hidden="true" style={{ color: "#c9a84c", fontSize: "20px" }}>★</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── STICKY DATES BAR (appears after picker is dismissed) ── */}
        {dateSelection && (
          <div
            role="region"
            aria-label="Selected stay dates"
            aria-live="polite"
            style={{
              position: "sticky", top: "72px", zIndex: 51,
              background: "linear-gradient(135deg, #2d1b3d 0%, #561d70 100%)",
              borderBottom: "1px solid rgba(201,168,76,0.3)",
              padding: "10px 48px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "16px", flexWrap: "wrap",
              boxShadow: "0 2px 16px rgba(86,29,112,0.2)",
            }}
            className="pdc-datebar"
          >
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "white", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <time dateTime={toISODate(dateSelection.checkIn)} style={{ fontWeight: 500 }}>
                {fmtBarDate(dateSelection.checkIn)}
              </time>
              <span aria-hidden="true" style={{ color: "#c9a84c" }}>→</span>
              <time dateTime={toISODate(dateSelection.checkOut)} style={{ fontWeight: 500 }}>
                {fmtBarDate(dateSelection.checkOut)}
              </time>
              <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.5)", margin: "0 2px" }}>·</span>
              <span>{nightsBetween(dateSelection.checkIn, dateSelection.checkOut)} Night{nightsBetween(dateSelection.checkIn, dateSelection.checkOut) !== 1 ? "s" : ""}</span>
              <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.5)", margin: "0 2px" }}>·</span>
              <span>{dateSelection.adults} Adult{dateSelection.adults !== 1 ? "s" : ""}</span>
              <span aria-hidden="true" style={{ color: "rgba(255,255,255,0.5)", margin: "0 2px" }}>·</span>
              <span>{dateSelection.rooms} Room{dateSelection.rooms !== 1 ? "s" : ""}</span>
            </p>
            <button
              ref={changeDatesBtnRef}
              aria-label={`Change stay dates — currently ${fmtBarDate(dateSelection.checkIn)} to ${fmtBarDate(dateSelection.checkOut)}`}
              aria-expanded={showPicker}
              aria-controls="date-picker-dialog"
              onClick={() => setShowPicker(true)}
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.4)",
                borderRadius: "20px",
                padding: "5px 14px",
                fontFamily: "var(--font-inter)", fontSize: "12px", fontWeight: 500,
                color: "#c9a84c", cursor: "pointer",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(201,168,76,0.28)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(201,168,76,0.15)")}
            >
              Change dates
            </button>
          </div>
        )}

        {/* ── FILTER BAR ── */}
        <div
          role="group"
          aria-label="Filter rooms by amenity"
          style={{
            position: "sticky", top: filterTop, zIndex: 50,
            background: "white", borderBottom: "1px solid #e8d5f0",
            padding: "12px 48px", display: "flex", gap: "8px", flexWrap: "wrap",
            boxShadow: "0 2px 12px rgba(86,29,112,0.06)",
            transition: "top 0.3s",
          }}
        >
          {FILTER_CHIPS.map(chip => {
            const active = activeFilters.includes(chip)
            return (
              <button
                key={chip}
                aria-pressed={active}
                onClick={() => toggleFilter(chip)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", borderRadius: "20px",
                  fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", transition: "all 0.2s",
                  background: active ? "#561d70" : "white",
                  color: active ? "white" : "#561d70",
                  border: `1.5px solid ${active ? "#561d70" : "#d0b8e8"}`,
                }}
              >
                {chip}
              </button>
            )
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              aria-label="Clear all active filters"
              style={{ padding: "6px 14px", borderRadius: "20px", background: "none", border: "1.5px solid #d0b8e8", color: "#8a6a9a", fontFamily: "var(--font-inter)", fontSize: "13px", cursor: "pointer" }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* ── ROOMS SECTION ── */}
        <section aria-labelledby="rooms-heading" style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 48px 80px" }}>

          {/* Urgency banner — plain div, no live region role (rendered on initial load, not dynamically) */}
          {showUrgency && (
            <div style={{
              background: "#7b2d00", color: "white",
              padding: "12px 20px", borderRadius: "8px",
              marginBottom: "24px", textAlign: "center",
              fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px",
            }}>
              ⚡ Hurry up! Only a few rooms left for your dates!
            </div>
          )}

          <h2
            id="rooms-heading"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#2d1b3d", marginBottom: "32px" }}
          >
            Choose Your Room
          </h2>

          {visibleRooms.length === 0 ? (
            <div role="status" style={{ textAlign: "center", padding: "48px", color: "#8a6a9a", fontFamily: "var(--font-inter)" }}>
              <p>
                No rooms match your selected filters.{" "}
                <button
                  onClick={() => setActiveFilters([])}
                  style={{ color: "#561d70", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "inherit", fontSize: "inherit" }}
                >
                  Clear filters
                </button>
              </p>
            </div>
          ) : (
            visibleRooms.map((room, visIdx) => {
              const detail = ROOM_DETAIL[room.id]
              if (!detail) return null
              const globalIdx = ROOMS.findIndex(r => r.id === room.id)
              const soldOut = soldOutGlobalIdx === globalIdx

              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  property={property}
                  detail={detail}
                  soldOut={soldOut}
                  expanded={expandedRooms.has(room.id)}
                  onToggleExpand={() => toggleExpand(room.id)}
                  onBook={(r) => router.push(buildBookingUrl(r.id))}
                  onOpen360={() => setActiveTourRoomId(room.id)}
                  tourBtnRef={(el) => {
                    if (el) tourTriggerRefs.current.set(room.id, el)
                    else tourTriggerRefs.current.delete(room.id)
                  }}
                  slug={property.id}
                  idx={visIdx}
                />
              )
            })
          )}
        </section>

        {/* ── DINING SECTION ── */}
        {property.restaurant ? (
          <section
            aria-labelledby="dining-heading"
            style={{ background: "#faf7fc", padding: "80px 48px", borderTop: "1px solid #e8d5f0" }}
          >
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              <h2
                id="dining-heading"
                style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#2d1b3d", marginBottom: "40px" }}
              >
                Dining at {property.name}
              </h2>
              <div className="pdc-dining-grid">
                <div style={{ borderRadius: "16px", overflow: "hidden" }}>
                  <Image
                    src={property.restaurant.images[0]}
                    alt={`${property.restaurant.name} restaurant interior`}
                    width={600}
                    height={400}
                    style={{ width: "100%", height: "320px", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "1.8rem", color: "#2d1b3d", marginBottom: "8px" }}>
                    {property.restaurant.name}
                  </h3>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#561d70", fontWeight: 500, marginBottom: "6px" }}>
                    {property.restaurant.cuisine}
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a", marginBottom: "16px" }}>
                    {property.restaurant.hours}
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "15px", color: "#5a4a6a", lineHeight: 1.7, marginBottom: "24px" }}>
                    {property.restaurant.description}
                  </p>
                  <Link
                    href="/dining"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px",
                      color: "#561d70", textDecoration: "none",
                      borderBottom: "1px solid #561d70", paddingBottom: "2px",
                      transition: "opacity 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7" }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1" }}
                  >
                    See Full Dining Experience →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <aside
            aria-label="Astra Hotels dining experiences"
            style={{
              background: "linear-gradient(135deg, #0f1a0f 0%, #1a4a1a 100%)",
              padding: "64px 48px", borderTop: "1px solid #2d4a2d",
            }}
          >
            <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#4ade80", marginBottom: "10px" }}>
                  Astra Dining Collection
                </p>
                <h2 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "white", marginBottom: "10px" }}>
                  Extraordinary Dining Nearby
                </h2>
                <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.65, maxWidth: "520px" }}>
                  Discover Zaffran's North West Frontier cuisine, TBC's craft gastropub, and Sunshine Cafe's all-day dining — all at sister Astra properties across Bangalore.
                </p>
              </div>
              <Link
                href="/dining"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 32px", whiteSpace: "nowrap",
                  background: "#1a4a1a", color: "white",
                  border: "1.5px solid #4ade80", borderRadius: "6px",
                  fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  textDecoration: "none", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#2d6b2d"; e.currentTarget.style.transform = "scale(1.02)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1a4a1a"; e.currentTarget.style.transform = "scale(1)" }}
              >
                Explore Astra Dining →
              </Link>
            </div>
          </aside>
        )}

      </main>

      <Footer />

      {activeTourRoomId && (
        <PanoramaViewer
          isOpen={true}
          title={`${ROOMS.find((r) => r.id === activeTourRoomId)?.name ?? ""} — 360° Tour`}
          scenes={getRoomScenes(activeTourRoomId)}
          onClose={() => {
            const id = activeTourRoomId
            setActiveTourRoomId(null)
            setTimeout(() => tourTriggerRefs.current.get(id)?.focus(), 0)
          }}
        />
      )}

      <style>{`
        /* 3-column room card grid */
        .pdc-grid {
          display: grid;
          grid-template-columns: 30% 1fr 28%;
        }
        @media (max-width: 1023px) {
          .pdc-grid { grid-template-columns: 1fr; }
          .pdc-grid > div { border-right: none !important; border-bottom: 1px solid #f0e8f7; }
          .pdc-grid > div:last-child { border-bottom: none; }
        }
        /* Dining layout */
        .pdc-dining-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 767px) {
          .pdc-dining-grid { grid-template-columns: 1fr; }
          #main-content section:first-child { height: 50vh !important; }
          .pdc-datebar { padding: 10px 16px !important; }
          [role="group"][aria-label="Filter rooms by amenity"] { padding: 10px 16px !important; }
          [aria-labelledby="rooms-heading"] { padding: 32px 16px 48px !important; }
          [aria-labelledby="dining-heading"] { padding: 48px 16px !important; }
        }
      `}</style>
    </>
  )
}
