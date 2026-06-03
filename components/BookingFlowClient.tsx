"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, ChevronUp, CreditCard, Smartphone, Check } from "lucide-react"
import { PROPERTIES, ROOMS, type Property, type Room } from "@/lib/data"
import { formatPrice } from "@/lib/utils"

// ─── Pricing ──────────────────────────────────────────────────────────────────

type Pricing = { mrp: number; price: number; gst: number; total: number; cashback: number }

const BOOKING_PRICING: Record<string, Pricing> = {
  "family-room":   { mrp: 6999, price: 4999, gst: 250, total: 5249, cashback: 379 },
  "superior-club": { mrp: 5999, price: 3999, gst: 200, total: 4199, cashback: 299 },
  "premium-king":  { mrp: 4499, price: 2999, gst: 150, total: 3149, cashback: 225 },
  "premium-twin":  { mrp: 4199, price: 2799, gst: 140, total: 2939, cashback: 199 },
}

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Singapore", "United Arab Emirates", "Germany", "France", "Japan", "New Zealand",
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useCountdown(initialSeconds = 20 * 60) {
  const [s, setS] = useState(initialSeconds)
  useEffect(() => {
    const id = setInterval(() => setS(prev => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const m = String(Math.floor(s / 60)).padStart(2, "0")
  const sec = String(s % 60).padStart(2, "0")
  return `${m}:${sec}`
}

function makeRef(pid: string, rid: string) {
  const seed = (pid + rid).split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return "ASTRA-" + Array.from({ length: 6 }, (_, i) => chars[(seed * (i + 7)) % chars.length]).join("")
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function nightCount(checkIn: string, checkOut: string) {
  return Math.max(1, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ))
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  firstName: string
  lastName: string
  email: string
  country: string
  phone: string
  roomPref: string
  bedPref: string
  extraPrefs: string[]
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-inter)",
  fontSize: "13px",
  fontWeight: 600,
  color: "#2d1b3d",
  marginBottom: "6px",
}

const dateLabelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-inter)",
  fontSize: "11px",
  fontWeight: 600,
  color: "#561d70",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "4px",
}

const dateInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #e8d5f0",
  borderRadius: "6px",
  fontFamily: "var(--font-inter)",
  fontSize: "12px",
  color: "#2d1b3d",
  boxSizing: "border-box",
}

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: "12px",
  color: "#c62828",
  marginTop: "4px",
}

// ─── Top progress bar ─────────────────────────────────────────────────────────

function TopBar({ step, countdown }: { step: number; countdown: string }) {
  const steps = ["Your Details", "Payment", "Confirmed"]

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "white", borderBottom: "1px solid #e8d5f0",
      height: "72px", display: "flex", alignItems: "center",
      padding: "0 32px", justifyContent: "space-between",
      boxShadow: "0 2px 12px rgba(86,29,112,0.08)",
    }}>
      <Link href="/" aria-label="Astra Hotels — back to home">
        <Image
          src="/media/astra-logo-dark.png"
          alt="Astra Hotels"
          width={120}
          height={40}
          style={{ objectFit: "contain", height: "36px", width: "auto" }}
        />
      </Link>

      <nav aria-label="Booking progress">
        <ol style={{ display: "flex", alignItems: "center", listStyle: "none", margin: 0, padding: 0, gap: 0 }}>
          {steps.map((label, i) => {
            const num = i + 1
            const completed = step > num
            const active = step === num
            return (
              <li
                key={label}
                aria-current={active ? "step" : undefined}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: completed ? "#2e7d32" : active ? "#561d70" : "#e0d0ec",
                      color: (completed || active) ? "white" : "#8a6a9a",
                      fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "12px",
                    }}
                  >
                    {completed ? "✓" : num}
                  </span>
                  <span className="booking-step-label" style={{
                    fontFamily: "var(--font-inter)", fontSize: "13px",
                    color: active ? "#561d70" : completed ? "#2e7d32" : "#8a6a9a",
                    fontWeight: active ? 600 : 400,
                  }}>
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span aria-hidden="true" style={{
                    display: "block", width: "40px", height: "1px",
                    background: completed ? "#2e7d32" : "#e0d0ec",
                    margin: "0 12px", flexShrink: 0,
                  }} />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Cosmetic-only timer — fully hidden from assistive technology */}
      {step < 3 && (
        <div aria-hidden="true" style={{
          fontFamily: "var(--font-inter)", fontSize: "13px", color: "#d32f2f",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          ⏱ {countdown} left
        </div>
      )}
    </header>
  )
}

// ─── Order summary sidebar ────────────────────────────────────────────────────

function OrderSidebar({
  property, room, pricing, checkIn, checkOut,
  onCheckInChange, onCheckOutChange,
  collapsed, onToggle, isMobile,
}: {
  property: Property
  room: Room
  pricing: Pricing
  checkIn: string
  checkOut: string
  onCheckInChange: (v: string) => void
  onCheckOutChange: (v: string) => void
  collapsed: boolean
  onToggle: () => void
  isMobile: boolean
}) {
  const nights = nightCount(checkIn, checkOut)
  const panelId = isMobile ? "order-summary-mobile-panel" : undefined
  const btnId = isMobile ? "order-summary-mobile-btn" : undefined

  return (
    <aside aria-label="Order summary">
      {isMobile && (
        <button
          id={btnId}
          aria-expanded={!collapsed}
          aria-controls="order-summary-mobile-panel"
          onClick={onToggle}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px",
            background: "#faf7fc", border: "1px solid #e8d5f0",
            borderRadius: collapsed ? "8px" : "8px 8px 0 0",
            fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#561d70",
            cursor: "pointer",
          }}
        >
          <span>Order Summary</span>
          {collapsed
            ? <ChevronDown size={16} aria-hidden="true" />
            : <ChevronUp size={16} aria-hidden="true" />}
        </button>
      )}

      <div
        id={panelId}
        hidden={isMobile ? collapsed : false}
        style={{
          background: "#faf7fc",
          border: "1px solid #e8d5f0",
          borderTop: isMobile && !collapsed ? "none" : "1px solid #e8d5f0",
          borderRadius: isMobile ? "0 0 8px 8px" : "12px",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", height: "150px" }}>
          <Image src={property.heroImage} alt="" fill style={{ objectFit: "cover" }} />
        </div>

        <div style={{ padding: "20px" }}>
          <p style={{ fontFamily: "var(--font-cormorant)", fontWeight: 600, fontSize: "1.1rem", color: "#2d1b3d", marginBottom: "2px" }}>
            {property.name}
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#8a6a9a", marginBottom: "16px" }}>
            {property.location} · 4-star
          </p>

          {/* Dates */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            <div>
              <label htmlFor={isMobile ? "check-in-mobile" : "check-in-desktop"} style={dateLabelStyle}>
                Check-in
              </label>
              <input
                id={isMobile ? "check-in-mobile" : "check-in-desktop"}
                type="date"
                value={checkIn}
                min={todayStr()}
                onChange={e => onCheckInChange(e.target.value)}
                style={dateInputStyle}
              />
            </div>
            <div>
              <label htmlFor={isMobile ? "check-out-mobile" : "check-out-desktop"} style={dateLabelStyle}>
                Check-out
              </label>
              <input
                id={isMobile ? "check-out-mobile" : "check-out-desktop"}
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={e => onCheckOutChange(e.target.value)}
                style={dateInputStyle}
              />
            </div>
          </div>

          {/* Room card */}
          <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e8d5f0", padding: "12px", marginBottom: "16px" }}>
            <p style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#2d1b3d", marginBottom: "3px" }}>
              {room.name}
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#8a6a9a", marginBottom: "8px" }}>
              {room.size} · {room.beds} · {nights} night{nights !== 1 ? "s" : ""}
            </p>
            <ul aria-label="Room amenities included" style={{ listStyle: "none", display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {room.amenities.slice(0, 4).map(a => (
                <li key={a} style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "#561d70", background: "#f5f0ff", padding: "2px 8px", borderRadius: "4px" }}>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Urgency banners — static text conveys urgency, color is supplementary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
            <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "6px", padding: "8px 12px" }}>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#1b5e20", fontWeight: 500 }}>
                Free cancellation until 24 hours before check-in
              </p>
            </div>
            <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "6px", padding: "8px 12px" }}>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#e65100", fontWeight: 500 }}>
                Only 3 rooms left at this price — book now
              </p>
            </div>
            <div style={{ background: "#fce4ec", border: "1px solid #ef9a9a", borderRadius: "6px", padding: "8px 12px" }}>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#b71c1c", fontWeight: 500 }}>
                5 people are viewing this room right now
              </p>
            </div>
          </div>

          {/* Price breakdown */}
          <dl aria-label="Price breakdown" style={{ borderTop: "1px solid #e8d5f0", paddingTop: "12px", margin: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <dt style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#5a4a6a" }}>
                Room rate ({nights} night{nights !== 1 ? "s" : ""})
              </dt>
              <dd style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#2d1b3d", fontWeight: 500 }}>
                {formatPrice(pricing.price * nights)}<span className="sr-only"> rupees</span>
              </dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <dt style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#5a4a6a" }}>GST &amp; taxes</dt>
              <dd style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#2d1b3d", fontWeight: 500 }}>
                {formatPrice(pricing.gst * nights)}<span className="sr-only"> rupees</span>
              </dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <dt style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#1a5c1a", fontWeight: 500 }}>
                Cashback earned
              </dt>
              <dd style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#1a5c1a", fontWeight: 500 }}>
                −{formatPrice(pricing.cashback)}<span className="sr-only"> rupees</span>
              </dd>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e8d5f0", paddingTop: "10px", marginTop: "4px" }}>
              <dt style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "15px", color: "#2d1b3d" }}>Total</dt>
              <dd style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "15px", color: "#561d70" }}>
                {formatPrice(pricing.total * nights)}<span className="sr-only"> rupees total</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  )
}

// ─── Step 1: Customer Information ─────────────────────────────────────────────

function Step1({
  form, onChange, onNext,
}: {
  form: FormData
  onChange: (field: keyof FormData, value: string | string[]) => void
  onNext: () => void
}) {
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [prefsExpanded, setPrefsExpanded] = useState(false)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const lastNameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    h1Ref.current?.focus()
  }, [])

  function validate(): Partial<Record<keyof FormData, string>> {
    const e: Partial<Record<keyof FormData, string>> = {}
    if (!form.firstName.trim()) e.firstName = "First name is required"
    if (!form.lastName.trim()) e.lastName = "Last name is required"
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "A valid email address is required"
    }
    if (!form.phone.trim()) e.phone = "Phone number is required"
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      if (errs.firstName) firstNameRef.current?.focus()
      else if (errs.lastName) lastNameRef.current?.focus()
      else if (errs.email) emailRef.current?.focus()
      else if (errs.phone) phoneRef.current?.focus()
      return
    }
    onNext()
  }

  function fieldBorder(hasError: boolean): React.CSSProperties {
    return {
      width: "100%", padding: "11px 14px", borderRadius: "8px",
      fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d",
      border: `1.5px solid ${hasError ? "#c62828" : "#d0c0e0"}`,
      boxSizing: "border-box",
    }
  }

  const sectionHeadStyle: React.CSSProperties = {
    fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px",
    color: "#561d70", textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: "16px", display: "block", width: "100%",
  }

  return (
    <div>
      <h1
        ref={h1Ref}
        tabIndex={-1}
        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#2d1b3d", marginBottom: "32px", outline: "none" }}
      >
        Your Details
      </h1>

      <form onSubmit={handleSubmit} noValidate>
        {/* Personal Information */}
        <fieldset style={{ border: "none", padding: 0, marginBottom: "28px" }}>
          <legend style={sectionHeadStyle}>Personal Information</legend>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }} className="booking-name-row">
            <div>
              <label htmlFor="bf-first-name" style={labelStyle}>
                First name{" "}
                <span aria-hidden="true" style={{ color: "#c62828" }}>*</span>
              </label>
              <input
                ref={firstNameRef}
                id="bf-first-name"
                type="text"
                value={form.firstName}
                onChange={e => onChange("firstName", e.target.value)}
                required
                autoComplete="given-name"
                aria-describedby={errors.firstName ? "bf-first-name-error" : undefined}
                aria-invalid={!!errors.firstName || undefined}
                style={fieldBorder(!!errors.firstName)}
              />
              {errors.firstName && (
                <p id="bf-first-name-error" role="alert" style={errorStyle}>{errors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="bf-last-name" style={labelStyle}>
                Last name{" "}
                <span aria-hidden="true" style={{ color: "#c62828" }}>*</span>
              </label>
              <input
                ref={lastNameRef}
                id="bf-last-name"
                type="text"
                value={form.lastName}
                onChange={e => onChange("lastName", e.target.value)}
                required
                autoComplete="family-name"
                aria-describedby={errors.lastName ? "bf-last-name-error" : undefined}
                aria-invalid={!!errors.lastName || undefined}
                style={fieldBorder(!!errors.lastName)}
              />
              {errors.lastName && (
                <p id="bf-last-name-error" role="alert" style={errorStyle}>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="bf-email" style={labelStyle}>
              Email address{" "}
              <span aria-hidden="true" style={{ color: "#c62828" }}>*</span>
            </label>
            <input
              ref={emailRef}
              id="bf-email"
              type="email"
              value={form.email}
              onChange={e => onChange("email", e.target.value)}
              required
              autoComplete="email"
              aria-describedby={errors.email ? "bf-email-error" : undefined}
              aria-invalid={!!errors.email || undefined}
              style={fieldBorder(!!errors.email)}
            />
            {errors.email && (
              <p id="bf-email-error" role="alert" style={errorStyle}>{errors.email}</p>
            )}
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="bf-country" style={labelStyle}>Country</label>
            <select
              id="bf-country"
              value={form.country}
              onChange={e => onChange("country", e.target.value)}
              autoComplete="country"
              style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1.5px solid #d0c0e0", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d", background: "white", cursor: "pointer", boxSizing: "border-box" }}
            >
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="bf-phone" style={labelStyle}>
              Phone number (country code +91 pre-filled){" "}
              <span aria-hidden="true" style={{ color: "#c62828" }}>*</span>
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{
                display: "flex", alignItems: "center", padding: "0 14px",
                border: "1.5px solid #d0c0e0", borderRadius: "8px",
                fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d",
                background: "#f9f5fd", flexShrink: 0,
              }}>
                +91
              </div>
              <input
                ref={phoneRef}
                id="bf-phone"
                type="tel"
                value={form.phone}
                onChange={e => onChange("phone", e.target.value)}
                required
                autoComplete="tel"
                placeholder="9876543210"
                aria-describedby={errors.phone ? "bf-phone-error" : undefined}
                aria-invalid={!!errors.phone || undefined}
                style={{ ...fieldBorder(!!errors.phone), flex: 1 }}
              />
            </div>
            {errors.phone && (
              <p id="bf-phone-error" role="alert" style={errorStyle}>{errors.phone}</p>
            )}
          </div>
        </fieldset>

        {/* Special Requests */}
        <div style={{ marginBottom: "28px" }}>
          <p style={sectionHeadStyle}>Special Requests</p>

          <fieldset style={{ border: "1px solid #e8d5f0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
            <legend style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#2d1b3d", padding: "0 6px" }}>
              Room type preference
            </legend>
            {[
              { value: "no-pref", label: "No preference" },
              { value: "high-floor", label: "High floor" },
              { value: "low-floor", label: "Low floor" },
              { value: "quiet", label: "Quiet room" },
            ].map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d", marginBottom: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="bf-roomPref"
                  value={opt.value}
                  checked={form.roomPref === opt.value}
                  onChange={e => onChange("roomPref", e.target.value)}
                  style={{ accentColor: "#561d70" }}
                />
                {opt.label}
              </label>
            ))}
          </fieldset>

          <fieldset style={{ border: "1px solid #e8d5f0", borderRadius: "8px", padding: "16px", marginBottom: "12px" }}>
            <legend style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#2d1b3d", padding: "0 6px" }}>
              Bed setup preference
            </legend>
            {[
              { value: "no-pref", label: "No preference" },
              { value: "together", label: "Beds together" },
              { value: "apart", label: "Beds apart" },
            ].map(opt => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d", marginBottom: "8px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="bf-bedPref"
                  value={opt.value}
                  checked={form.bedPref === opt.value}
                  onChange={e => onChange("bedPref", e.target.value)}
                  style={{ accentColor: "#561d70" }}
                />
                {opt.label}
              </label>
            ))}
          </fieldset>

          <button
            type="button"
            aria-expanded={prefsExpanded}
            aria-controls="bf-additional-prefs"
            onClick={() => setPrefsExpanded(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", fontFamily: "var(--font-inter)", fontSize: "13px", color: "#561d70", cursor: "pointer", padding: 0, fontWeight: 500 }}
          >
            {prefsExpanded ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
            Additional preferences
          </button>

          <div
            id="bf-additional-prefs"
            hidden={!prefsExpanded}
            style={{ marginTop: "12px", padding: "16px", border: "1px solid #e8d5f0", borderRadius: "8px" }}
          >
            {["Smoking room", "Non-smoking room", "Connecting rooms", "Baby cot", "Extra bed"].map(pref => (
              <label key={pref} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d", marginBottom: "8px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.extraPrefs.includes(pref)}
                  onChange={e => {
                    const curr = form.extraPrefs
                    onChange("extraPrefs", e.target.checked
                      ? [...curr, pref]
                      : curr.filter(p => p !== pref)
                    )
                  }}
                  style={{ accentColor: "#561d70" }}
                />
                {pref}
              </label>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <aside aria-label="Astra Rewards" style={{ background: "linear-gradient(135deg, #f5f0ff, #ede0ff)", border: "1px solid #d0b8f0", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
          <p style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px", color: "#561d70", marginBottom: "6px" }}>
            Astra Rewards — Cashback Applied
          </p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#5a4a6a", marginBottom: "10px" }}>
            Cashback will be credited to your account within 48 hours of check-out.
          </p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ background: "#561d70", color: "white", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "11px", padding: "4px 12px", borderRadius: "6px" }}>
              Verified Member
            </span>
            <span style={{ background: "#2e7d32", color: "white", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "11px", padding: "4px 12px", borderRadius: "6px" }}>
              Cashback Active
            </span>
          </div>
        </aside>

        {/* Free benefits */}
        <section aria-labelledby="bf-benefits-heading" style={{ marginBottom: "32px" }}>
          <h2 id="bf-benefits-heading" style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#561d70", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Included with your stay
          </h2>
          <ul aria-label="Included benefits" style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Free high-speed WiFi throughout your stay",
              "Complimentary parking on site",
              "Access to fitness center",
              "Express check-in",
              "24/7 room service",
            ].map(benefit => (
              <li key={benefit} style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#5a4a6a" }}>
                <span aria-hidden="true" style={{ color: "#2e7d32", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        <button
          type="submit"
          style={{ width: "100%", padding: "16px", borderRadius: "10px", background: "#561d70", color: "white", border: "none", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#7b3fa0" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#561d70" }}
        >
          Next: Payment Information →
        </button>
      </form>
    </div>
  )
}

// ─── Step 2: Payment ──────────────────────────────────────────────────────────

function Step2({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) {
  const [payMethod, setPayMethod] = useState<"property" | "now">("property")
  const h1Ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    h1Ref.current?.focus()
  }, [])

  const dummyInputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: "8px",
    border: "1.5px solid #d0c0e0", fontFamily: "var(--font-inter)", fontSize: "14px",
    color: "#aaa", boxSizing: "border-box", background: "#f9f9f9", cursor: "not-allowed",
  }

  return (
    <div>
      <h1
        ref={h1Ref}
        tabIndex={-1}
        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(1.8rem, 3vw, 2.4rem)", color: "#2d1b3d", marginBottom: "32px", outline: "none" }}
      >
        Payment Method
      </h1>

      <fieldset style={{ border: "none", padding: 0, marginBottom: "32px" }}>
        <legend style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#561d70", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", display: "block", width: "100%" }}>
          Choose payment method
        </legend>

        {/* Pay at property */}
        <label style={{
          display: "flex", alignItems: "flex-start", gap: "14px",
          padding: "18px 20px", border: `2px solid ${payMethod === "property" ? "#561d70" : "#e8d5f0"}`,
          borderRadius: "10px", marginBottom: "12px", cursor: "pointer",
          background: payMethod === "property" ? "#faf7fc" : "white", transition: "all 0.2s",
        }}>
          <input
            type="radio"
            name="bf-payMethod"
            value="property"
            checked={payMethod === "property"}
            onChange={() => setPayMethod("property")}
            style={{ marginTop: "2px", accentColor: "#561d70", flexShrink: 0 }}
          />
          <div>
            <p style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", color: "#2d1b3d", marginBottom: "4px" }}>
              Pay at property
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#5a4a6a" }}>
              Pay when you arrive. No payment required today. Free cancellation applies.
            </p>
            {payMethod === "property" && (
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#1a5c1a", marginTop: "8px", fontWeight: 500 }}>
                ✓ Recommended — most flexible option
              </p>
            )}
          </div>
        </label>

        {/* Pay now */}
        <label style={{
          display: "flex", alignItems: "flex-start", gap: "14px",
          padding: "18px 20px", border: `2px solid ${payMethod === "now" ? "#561d70" : "#e8d5f0"}`,
          borderRadius: "10px", cursor: "pointer",
          background: payMethod === "now" ? "#faf7fc" : "white", transition: "all 0.2s",
        }}>
          <input
            type="radio"
            name="bf-payMethod"
            value="now"
            checked={payMethod === "now"}
            onChange={() => setPayMethod("now")}
            style={{ marginTop: "2px", accentColor: "#561d70", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", color: "#2d1b3d", marginBottom: "4px" }}>
              Pay now
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#5a4a6a" }}>
              Securely pay online. Additional discount may apply.
            </p>

            {payMethod === "now" && (
              <div style={{ marginTop: "16px" }} onClick={e => e.stopPropagation()}>
                <p role="note" style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a", background: "#f5f0ff", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>
                  This is a demonstration. No payment will be processed.
                </p>

                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  <button type="button" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "2px solid #561d70", background: "#561d70", color: "white", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                    <CreditCard size={14} aria-hidden="true" /> Card
                  </button>
                  <button type="button" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "2px solid #e8d5f0", background: "white", color: "#561d70", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                    <Smartphone size={14} aria-hidden="true" /> UPI
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label htmlFor="bf-card-number" style={labelStyle}>Card number</label>
                    <input id="bf-card-number" type="text" readOnly placeholder="•••• •••• •••• ••••"
                      aria-label="Card number (demonstration only — no real payment)"
                      aria-describedby="bf-demo-notice" style={dummyInputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label htmlFor="bf-card-expiry" style={labelStyle}>Expiry</label>
                      <input id="bf-card-expiry" type="text" readOnly placeholder="MM / YY"
                        aria-label="Card expiry date (demonstration only)" style={dummyInputStyle} />
                    </div>
                    <div>
                      <label htmlFor="bf-card-cvv" style={labelStyle}>CVV</label>
                      <input id="bf-card-cvv" type="text" readOnly placeholder="•••"
                        aria-label="Card CVV (demonstration only)" style={dummyInputStyle} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bf-card-name" style={labelStyle}>Cardholder name</label>
                    <input id="bf-card-name" type="text" readOnly placeholder="Name on card"
                      aria-label="Cardholder name (demonstration only)" style={dummyInputStyle} />
                  </div>
                </div>
                <p id="bf-demo-notice" className="sr-only">
                  This is a demonstration form. No real payment data is collected or processed.
                </p>
              </div>
            )}
          </div>
        </label>
      </fieldset>

      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={onBack}
          style={{ flex: "0 0 auto", padding: "16px 28px", borderRadius: "10px", background: "none", border: "2px solid #e8d5f0", color: "#561d70", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", cursor: "pointer" }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onComplete}
          style={{ flex: 1, padding: "16px", borderRadius: "10px", background: "#561d70", color: "white", border: "none", fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "15px", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", transition: "background 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#7b3fa0" }}
          onMouseLeave={e => { e.currentTarget.style.background = "#561d70" }}
        >
          Complete Booking →
        </button>
      </div>
    </div>
  )
}

// ─── Step 3: Booking Confirmed ────────────────────────────────────────────────

function Step3({
  form, property, room, pricing, bookingRef, checkIn, checkOut,
}: {
  form: FormData
  property: Property
  room: Room
  pricing: Pricing
  bookingRef: string
  checkIn: string
  checkOut: string
}) {
  const nights = nightCount(checkIn, checkOut)
  const h1Ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const t = setTimeout(() => h1Ref.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" })

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center", paddingTop: "40px" }}>
      <div aria-hidden="true" style={{ marginBottom: "28px" }}>
        <div className="booking-check-ring">
          <Check size={40} color="white" strokeWidth={3} />
        </div>
      </div>

      <h1
        ref={h1Ref}
        tabIndex={-1}
        style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#2d1b3d", marginBottom: "8px", outline: "none" }}
      >
        Booking Confirmed!
      </h1>
      <p style={{ fontFamily: "var(--font-inter)", fontSize: "16px", color: "#5a4a6a", marginBottom: "32px" }}>
        Your reservation is confirmed. A confirmation email will be sent to{" "}
        <strong style={{ color: "#2d1b3d" }}>{form.email}</strong>.
      </p>

      <div style={{ background: "#f5f0ff", border: "2px solid #d0b8f0", borderRadius: "12px", padding: "20px", marginBottom: "32px", display: "inline-block" }}>
        <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#8a6a9a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
          Booking Reference
        </p>
        <p style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "22px", color: "#561d70", letterSpacing: "0.08em" }}>
          {bookingRef}
        </p>
      </div>

      {/* Summary card */}
      <div style={{ background: "white", border: "1px solid #e8d5f0", borderRadius: "16px", padding: "28px", marginBottom: "32px", textAlign: "left" }}>
        <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#561d70", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
          Booking Summary
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px", marginBottom: "20px" }} className="booking-summary-grid">
          {[
            { label: "Guest", value: `${form.firstName} ${form.lastName}` },
            { label: "Hotel", value: `${property.name}, ${property.location}` },
            { label: "Room", value: room.name },
            { label: "Guests", value: `Up to ${room.maxGuests} guests` },
            { label: "Check-in", value: formatDate(checkIn) },
            { label: "Check-out", value: formatDate(checkOut) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "#8a6a9a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>{label}</p>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px", color: "#2d1b3d" }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #e8d5f0", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "#8a6a9a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>
              Total ({nights} night{nights !== 1 ? "s" : ""})
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "20px", color: "#561d70" }}>
              {formatPrice(pricing.total * nights)}
            </p>
          </div>
          <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "8px", padding: "8px 16px", textAlign: "right" }}>
            <p style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "13px", color: "#1b5e20" }}>
              Cashback: {formatPrice(pricing.cashback)}
            </p>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "#388e3c" }}>credited within 48 hours</p>
          </div>
        </div>
      </div>

      {/* What's next */}
      <div style={{ background: "#faf7fc", border: "1px solid #e8d5f0", borderRadius: "16px", padding: "28px", marginBottom: "40px", textAlign: "left" }}>
        <h2 style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "14px", color: "#561d70", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
          What&apos;s next?
        </h2>
        <ol style={{ paddingLeft: "20px" }}>
          {[
            "Check your email for your booking confirmation and receipt.",
            `Arrive at ${property.name} on your check-in date. Check-in is from ${property.checkIn}.`,
            "Present your booking reference at reception.",
            `Cashback of ${formatPrice(pricing.cashback)} will be credited to your Astra Rewards account within 48 hours of check-out.`,
            "Enjoy your stay with us!",
          ].map((item, i) => (
            <li key={i} style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#5a4a6a", marginBottom: "10px", lineHeight: 1.6 }}>
              {item}
            </li>
          ))}
        </ol>
      </div>

      {/* Action buttons — Links, not buttons, since they navigate */}
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/"
          style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: "10px", border: "2px solid #561d70", color: "#561d70", background: "white", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f0ff" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "white" }}
        >
          Back to Home
        </Link>
        <Link
          href={`/property/${property.id}`}
          style={{ display: "inline-flex", alignItems: "center", padding: "14px 28px", borderRadius: "10px", background: "#561d70", color: "white", fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#7b3fa0" }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#561d70" }}
        >
          Book Another Room
        </Link>
      </div>
    </div>
  )
}

// ─── Main exported component ──────────────────────────────────────────────────

export function BookingFlowClient({
  propertyId, roomId,
  initialCheckIn, initialCheckOut, initialRooms: _initialRooms, initialAdults: _initialAdults,
}: {
  propertyId: string; roomId: string
  initialCheckIn?: string; initialCheckOut?: string
  initialRooms?: number; initialAdults?: number
}) {
  const property = PROPERTIES.find(p => p.id === propertyId)
  const room = ROOMS.find(r => r.id === roomId)
  const pricing = BOOKING_PRICING[roomId]

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    firstName: "", lastName: "", email: "", country: "India", phone: "",
    roomPref: "no-pref", bedPref: "no-pref", extraPrefs: [],
  })
  const [checkIn, setCheckIn] = useState(initialCheckIn || todayStr)
  const [checkOut, setCheckOut] = useState(initialCheckOut || tomorrowStr)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const countdown = useCountdown()
  const bookingRef = makeRef(propertyId, roomId)

  useEffect(() => {
    const titles: Record<number, string> = {
      1: "Your Details — Booking — Astra Hotels",
      2: "Payment Method — Booking — Astra Hotels",
      3: "Booking Confirmed — Astra Hotels",
    }
    document.title = titles[step] ?? "Booking — Astra Hotels"
  }, [step])

  if (!property || !room || !pricing) {
    return (
      <main id="main-content" tabIndex={-1} style={{ paddingTop: "120px", textAlign: "center", padding: "120px 24px" }}>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "2rem", color: "#2d1b3d", marginBottom: "16px" }}>
          Room not found
        </h1>
        <Link href="/" style={{ color: "#561d70", fontFamily: "var(--font-inter)" }}>Back to home</Link>
      </main>
    )
  }

  function handleFormChange(field: keyof FormData, value: string | string[]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const sidebarSharedProps = {
    property, room, pricing, checkIn, checkOut,
    onCheckInChange: setCheckIn, onCheckOutChange: setCheckOut,
    collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(v => !v),
  }

  return (
    <>
      <TopBar step={step} countdown={countdown} />

      <main id="main-content" tabIndex={-1} style={{ paddingTop: "72px", minHeight: "100vh", background: "#fbf9fd" }}>
        {step === 3 ? (
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px 80px" }}>
            <Step3
              form={form}
              property={property}
              room={room}
              pricing={pricing}
              bookingRef={bookingRef}
              checkIn={checkIn}
              checkOut={checkOut}
            />
          </div>
        ) : (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 80px" }}>
            {/* Mobile-only sidebar accordion at top */}
            <div className="booking-sidebar-mobile">
              <OrderSidebar {...sidebarSharedProps} isMobile={true} />
            </div>

            <div className="booking-layout">
              <div style={{ flex: 1, minWidth: 0 }}>
                {step === 1 && (
                  <Step1 form={form} onChange={handleFormChange} onNext={() => setStep(2)} />
                )}
                {step === 2 && (
                  <Step2 onBack={() => setStep(1)} onComplete={() => setStep(3)} />
                )}
              </div>

              {/* Desktop sticky sidebar */}
              <div className="booking-sidebar-desktop">
                <div style={{ position: "sticky", top: "100px", alignSelf: "flex-start" }}>
                  <OrderSidebar {...sidebarSharedProps} isMobile={false} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .booking-layout {
          display: flex;
          gap: 48px;
          align-items: flex-start;
        }
        .booking-sidebar-mobile {
          display: none;
          margin-bottom: 24px;
        }
        .booking-sidebar-desktop {
          width: 380px;
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .booking-layout {
            flex-direction: column;
          }
          .booking-sidebar-mobile {
            display: block;
          }
          .booking-sidebar-desktop {
            display: none;
          }
        }
        @media (max-width: 600px) {
          .booking-step-label {
            display: none;
          }
          .booking-name-row {
            grid-template-columns: 1fr !important;
          }
          .booking-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .booking-check-ring {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #2e7d32;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          animation: booking-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes booking-pop {
          from { transform: scale(0); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .booking-check-ring { animation: none; }
        }
      `}</style>
    </>
  )
}
