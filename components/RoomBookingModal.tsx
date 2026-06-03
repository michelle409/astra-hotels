"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, Loader2 } from "lucide-react"
import type { Room, Property } from "@/lib/data"
import { cn } from "@/lib/utils"

type Props = {
  room: Room
  property: Property
  onClose: () => void
}

type Fields = {
  checkIn: string
  checkOut: string
  guests: string
  name: string
  phone: string
  email: string
  specialRequests: string
}

type Errors = Partial<Record<keyof Fields, string>>

const today = new Date().toISOString().split("T")[0]

type ConfirmData = {
  bookingRef: string
  email: string
  phone: string
  roomName: string
  nights: number
  subtotal: number
  taxes: number
  total: number
  checkIn: string
  checkOut: string
  guests: string
}

export function RoomBookingModal({ room, property, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const priceTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [fields, setFields] = useState<Fields>({
    checkIn: "",
    checkOut: "",
    guests: "1",
    name: "",
    phone: "",
    email: "",
    specialRequests: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [shakeField, setShakeField] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState<ConfirmData | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  // Price preview
  const [price, setPrice] = useState<{ nights: number; roomPrice: number; subtotal: number; taxes: number; total: number } | null>(null)

  const computePrice = useCallback(() => {
    if (!fields.checkIn || !fields.checkOut || fields.checkOut <= fields.checkIn) { setPrice(null); return }
    const nights = Math.ceil((new Date(fields.checkOut).getTime() - new Date(fields.checkIn).getTime()) / 86400000)
    if (nights <= 0) { setPrice(null); return }
    const guests = parseInt(fields.guests) || 1
    const guestSurcharge = guests > 2 ? (guests - 2) * 500 : 0
    const roomPrice = room.basePrice + guestSurcharge
    const subtotal = roomPrice * nights
    const taxes = Math.round(subtotal * 0.12)
    setPrice({ nights, roomPrice, subtotal, taxes, total: subtotal + taxes })
  }, [fields.checkIn, fields.checkOut, fields.guests, room.basePrice])

  useEffect(() => {
    clearTimeout(priceTimerRef.current)
    priceTimerRef.current = setTimeout(computePrice, 400)
    return () => clearTimeout(priceTimerRef.current)
  }, [computePrice])

  // Open dialog
  useEffect(() => {
    dialogRef.current?.showModal()
    setTimeout(() => firstFieldRef.current?.focus(), 50)
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  function setField(k: keyof Fields, v: string) {
    setFields(prev => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
    if (serverError) setServerError(null)
  }

  function shake(f: string) {
    setShakeField(null)
    requestAnimationFrame(() => setShakeField(f))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!fields.checkIn) e.checkIn = "Check-in date is required"
    if (fields.checkIn && fields.checkIn < today) { e.checkIn = "Date cannot be in the past"; shake("checkIn") }
    if (!fields.checkOut) e.checkOut = "Check-out date is required"
    if (fields.checkIn && fields.checkOut && fields.checkOut <= fields.checkIn) { e.checkOut = "Must be after check-in"; shake("checkOut") }
    const g = parseInt(fields.guests)
    if (!g || g < 1) e.guests = "At least 1 guest required"
    if (g > room.maxGuests) e.guests = `Maximum ${room.maxGuests} guests for this room`
    if (!fields.name || fields.name.trim().length < 2) e.name = "Name must be at least 2 characters"
    if (!/^[6-9]\d{9}$/.test(fields.phone.replace(/\s+/g, ""))) { e.phone = "Enter valid 10-digit mobile number"; shake("phone") }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) e.email = "Valid email required"
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTimeout(() => errorSummaryRef.current?.focus(), 50)
      return
    }
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          roomType: room.id,
          checkIn: fields.checkIn,
          checkOut: fields.checkOut,
          guests: parseInt(fields.guests),
          name: fields.name,
          phone: fields.phone,
          email: fields.email,
          specialRequests: fields.specialRequests,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setConfirmed({
          bookingRef: data.bookingRef,
          email: fields.email,
          phone: fields.phone,
          roomName: room.name,
          nights: price?.nights ?? 1,
          subtotal: price?.subtotal ?? 0,
          taxes: price?.taxes ?? 0,
          total: price?.total ?? 0,
          checkIn: fields.checkIn,
          checkOut: fields.checkOut,
          guests: fields.guests,
        })
      } else {
        setServerError(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setServerError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  function fieldClass(k: keyof Fields) {
    return cn("form-field", errors[k] && "error", shakeField === k && "shake")
  }

  if (typeof window === "undefined") return null

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="book-modal-title"
      aria-describedby="book-modal-desc"
      onClick={(e) => { if (e.target === dialogRef.current) onClose() }}
      onCancel={onClose}
      className="p-0 bg-transparent border-0 max-w-none w-full h-full m-0"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        width: "100dvw",
        height: "100dvh",
        maxWidth: "100dvw",
        maxHeight: "100dvh",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(26,10,36,0.96)",
      }}
    >
      <p id="book-modal-desc" className="sr-only">
        Booking form for {room.name}. Fill in your details to request a reservation. Press Escape to close.
      </p>

      {/* Centered card */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full bg-white overflow-y-auto"
        style={{
          maxWidth: "620px",
          maxHeight: "90dvh",
          borderRadius: "16px",
          animation: "modalIn 0.3s cubic-bezier(0.2,0.8,0.2,1) both",
        }}
      >
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @keyframes modalIn {
              from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)) scale(0.96); }
              to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-8 pt-8 pb-6 border-b border-[#f0e6f8]">
          <button
            onClick={onClose}
            aria-label="Close booking form"
            className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-[#f3eef7] text-[#2d1b3d]"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <p
            className="uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 500, color: "#561d70" }}
          >
            {property.name} · {property.location}
          </p>
          <h2
            id="book-modal-title"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "2rem", color: "#2d1b3d" }}
          >
            {room.name}
          </h2>
          <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#8a6a9a", marginTop: "4px" }}>
            {room.size} &bull; Up to {room.maxGuests} guests &bull; {room.beds}
          </p>
        </div>

        <div className="px-8 py-6">
          {confirmed ? (
            /* ── CONFIRMATION STATE ── */
            <div>
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: "rgba(86,29,112,0.08)" }}
                  aria-hidden="true"
                >
                  <span style={{ fontSize: "2rem", color: "#561d70" }}>✓</span>
                </div>
                <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "1.8rem", color: "#2d1b3d" }}>
                  Booking Confirmed
                </h3>
              </div>

              <div
                className="rounded-xl p-6 mb-6"
                style={{ backgroundColor: "var(--off-white)" }}
                role="region"
                aria-label="Booking confirmation details"
                aria-live="polite"
              >
                {[
                  ["Reference", confirmed.bookingRef],
                  ["Room", confirmed.roomName],
                  ["Check-in", confirmed.checkIn],
                  ["Check-out", confirmed.checkOut],
                  ["Nights", String(confirmed.nights)],
                  ["Guests", confirmed.guests],
                  ["Subtotal", `₹${confirmed.subtotal.toLocaleString("en-IN")}`],
                  ["GST (12%)", `₹${confirmed.taxes.toLocaleString("en-IN")}`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between py-1.5">
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#2d1b3d" }}>{val}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 mt-2 border-t border-[#e8d5f0]">
                  <span style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px", color: "#2d1b3d" }}>Total</span>
                  <span style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "1.5rem", color: "#561d70" }}>
                    ₹{confirmed.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#5a4a6a", textAlign: "center", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Confirmation sent to <strong>{confirmed.email}</strong>.<br />
                Our team will contact you at <strong>{confirmed.phone}</strong> within 2 hours.
              </p>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg text-white font-medium transition-all duration-200 hover:bg-[#7b3fa0]"
                style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
              >
                DONE
              </button>
            </div>
          ) : (
            /* ── BOOKING FORM ── */
            <form onSubmit={handleSubmit} noValidate aria-label={`Book ${room.name} at ${property.name}`}>
              <p className="text-xs mb-5" style={{ fontFamily: "var(--font-inter)", color: "#8a6a9a" }}>
                Fields marked <span aria-hidden="true">*</span><span className="sr-only">(asterisk)</span> are required.
              </p>

              {Object.keys(errors).length > 0 && (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  role="alert"
                  className="mb-5 p-4 rounded-lg outline-none"
                  style={{ backgroundColor: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#dc2626" }}
                >
                  Please correct {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} below.
                </div>
              )}
              {serverError && (
                <div role="alert" className="mb-5 p-4 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#dc2626" }}>
                  {serverError}
                </div>
              )}

              {/* Row 1: Dates */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="modal-checkin" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                    Check-in <span aria-hidden="true">*</span><span className="sr-only"> required</span>
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="modal-checkin"
                    type="date"
                    min={today}
                    value={fields.checkIn}
                    onChange={e => setField("checkIn", e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.checkIn}
                    aria-describedby={errors.checkIn ? "err-modal-checkin" : undefined}
                    className={fieldClass("checkIn")}
                  />
                  {errors.checkIn && <p id="err-modal-checkin" role="alert" className="mt-1 text-xs text-red-600">{errors.checkIn}</p>}
                </div>

                <div>
                  <label htmlFor="modal-checkout" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                    Check-out <span aria-hidden="true">*</span><span className="sr-only"> required</span>
                  </label>
                  <input
                    id="modal-checkout"
                    type="date"
                    min={fields.checkIn || today}
                    value={fields.checkOut}
                    onChange={e => setField("checkOut", e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.checkOut}
                    aria-describedby={errors.checkOut ? "err-modal-checkout" : undefined}
                    className={fieldClass("checkOut")}
                  />
                  {errors.checkOut && <p id="err-modal-checkout" role="alert" className="mt-1 text-xs text-red-600">{errors.checkOut}</p>}
                </div>
              </div>

              {/* Row 2: Guests */}
              <div className="mb-4">
                <label htmlFor="modal-guests" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                  Number of Guests <span aria-hidden="true">*</span><span className="sr-only"> required</span>
                </label>
                <input
                  id="modal-guests"
                  type="number"
                  min={1}
                  max={room.maxGuests}
                  value={fields.guests}
                  onChange={e => setField("guests", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.guests}
                  aria-describedby={errors.guests ? "err-modal-guests" : "modal-guests-hint"}
                  className={fieldClass("guests")}
                />
                <p id="modal-guests-hint" className="sr-only">Maximum {room.maxGuests} guests for {room.name}</p>
                {errors.guests && <p id="err-modal-guests" role="alert" className="mt-1 text-xs text-red-600">{errors.guests}</p>}
              </div>

              {/* Row 3: Name + Phone */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="modal-name" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                    Full Name <span aria-hidden="true">*</span><span className="sr-only"> required</span>
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={fields.name}
                    onChange={e => setField("name", e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "err-modal-name" : undefined}
                    className={fieldClass("name")}
                  />
                  {errors.name && <p id="err-modal-name" role="alert" className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="modal-phone" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                    Phone <span aria-hidden="true">*</span><span className="sr-only"> required</span>
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={fields.phone}
                    onChange={e => setField("phone", e.target.value)}
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? "err-modal-phone" : "modal-phone-hint"}
                    className={fieldClass("phone")}
                  />
                  <p id="modal-phone-hint" className="sr-only">10-digit Indian mobile starting with 6–9</p>
                  {errors.phone && <p id="err-modal-phone" role="alert" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
              </div>

              {/* Row 4: Email */}
              <div className="mb-4">
                <label htmlFor="modal-email" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                  Email <span aria-hidden="true">*</span><span className="sr-only"> required</span>
                </label>
                <input
                  id="modal-email"
                  type="email"
                  autoComplete="email"
                  placeholder="your@email.com"
                  value={fields.email}
                  onChange={e => setField("email", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "err-modal-email" : undefined}
                  className={fieldClass("email")}
                />
                {errors.email && <p id="err-modal-email" role="alert" className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {/* Row 5: Special requests */}
              <div className="mb-6">
                <label htmlFor="modal-requests" className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ fontFamily: "var(--font-inter)", color: "#561d70" }}>
                  Special Requests <span style={{ color: "#8a6a9a", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                </label>
                <textarea
                  id="modal-requests"
                  rows={3}
                  value={fields.specialRequests}
                  onChange={e => setField("specialRequests", e.target.value)}
                  className="form-field resize-none"
                  placeholder="Early check-in, dietary needs, accessibility requirements..."
                />
              </div>

              {/* Live price preview — WCAG 4.1.3 polite live region */}
              {price && (
                <div
                  className="rounded-xl p-5 mb-6"
                  style={{ backgroundColor: "var(--light-gray)" }}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label="Price estimate"
                >
                  <div className="flex justify-between mb-2">
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#5a4a6a" }}>
                      {price.nights} night{price.nights > 1 ? "s" : ""} × ₹{price.roomPrice.toLocaleString("en-IN")}
                    </span>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d" }}>
                      ₹{price.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#5a4a6a" }}>
                      + 12% GST
                    </span>
                    <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "#2d1b3d" }}>
                      ₹{price.taxes.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-[#e8d5f0]">
                    <span style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "15px", color: "#2d1b3d" }}>
                      TOTAL
                    </span>
                    <span style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "1.6rem", color: "#561d70" }}>
                      ₹{price.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="gold-sweep w-full py-[14px] rounded-lg text-white font-medium transition-all duration-300 hover:scale-[1.01]"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "1.2rem",
                  fontWeight: 500,
                  backgroundColor: "#561d70",
                  letterSpacing: "0.05em",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                    <span className="sr-only">Processing your request...</span>
                    Processing...
                  </span>
                ) : "CONFIRM BOOKING REQUEST"}
              </button>
            </form>
          )}
        </div>
      </div>
    </dialog>,
    document.body
  )
}
