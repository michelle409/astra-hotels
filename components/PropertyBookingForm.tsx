"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ROOMS, type Property } from "@/lib/data"
import { cn } from "@/lib/utils"

type Props = {
  property: Property
  initialCheckIn?: string
  initialCheckOut?: string
  initialGuests?: string
  initialRoomType?: string
}

type Fields = {
  checkIn: string
  checkOut: string
  guests: string
  roomType: string
  name: string
  phone: string
  email: string
  specialRequests: string
}

type Errors = Partial<Record<keyof Fields, string>>

const today = new Date().toISOString().split("T")[0]

type BookingResult = {
  bookingRef: string
  summary: {
    roomName: string
    checkIn: string
    checkOut: string
    nights: number
    guests: number
    name: string
    email: string
    phone: string
    subtotal: number
    taxes: number
    total: number
  }
}

export function PropertyBookingForm({ property, initialCheckIn = "", initialCheckOut = "", initialGuests = "1", initialRoomType = "" }: Props) {
  const [fields, setFields] = useState<Fields>({
    checkIn: initialCheckIn,
    checkOut: initialCheckOut,
    guests: initialGuests,
    roomType: initialRoomType,
    name: "",
    phone: "",
    email: "",
    specialRequests: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [shakeField, setShakeField] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BookingResult | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const priceTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Live price calculation
  const [priceDisplay, setPriceDisplay] = useState<{
    nights: number; roomPrice: number; subtotal: number; taxes: number; total: number
  } | null>(null)

  const computePrice = useCallback(() => {
    if (!fields.checkIn || !fields.checkOut || fields.checkOut <= fields.checkIn) {
      setPriceDisplay(null)
      return
    }
    const room = ROOMS.find((r) => r.id === fields.roomType) || ROOMS[2]
    const guests = parseInt(fields.guests) || 1
    const nights = Math.ceil(
      (new Date(fields.checkOut).getTime() - new Date(fields.checkIn).getTime()) / 86400000
    )
    if (nights <= 0) { setPriceDisplay(null); return }
    const guestSurcharge = guests > 2 ? (guests - 2) * 500 : 0
    const roomPrice = room.basePrice + guestSurcharge
    const subtotal = roomPrice * nights
    const taxes = Math.round(subtotal * 0.12)
    setPriceDisplay({ nights, roomPrice, subtotal, taxes, total: subtotal + taxes })
  }, [fields.checkIn, fields.checkOut, fields.guests, fields.roomType])

  useEffect(() => {
    clearTimeout(priceTimeoutRef.current)
    priceTimeoutRef.current = setTimeout(computePrice, 500)
    return () => clearTimeout(priceTimeoutRef.current)
  }, [computePrice])

  function setField(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
    if (serverError) setServerError(null)
  }

  function triggerShake(field: string) {
    setShakeField(null)
    requestAnimationFrame(() => setShakeField(field))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!fields.checkIn) e.checkIn = "Check-in date is required"
    if (fields.checkIn && fields.checkIn < today) {
      e.checkIn = "Check-in date cannot be in the past"
      triggerShake("checkIn")
    }
    if (!fields.checkOut) e.checkOut = "Check-out date is required"
    if (fields.checkIn && fields.checkOut && fields.checkOut <= fields.checkIn) {
      e.checkOut = "Check-out must be after check-in"
      triggerShake("checkOut")
    }
    const g = parseInt(fields.guests)
    if (!g || g < 1) e.guests = "At least 1 guest required"
    const room = ROOMS.find((r) => r.id === fields.roomType)
    if (room && g > room.maxGuests) {
      e.guests = `${room.name} accommodates a maximum of ${room.maxGuests} guests`
    }
    if (!fields.name || fields.name.trim().length < 2) e.name = "Name must be at least 2 characters"
    const phoneRegex = /^[6-9]\d{9}$/
    if (!fields.phone || !phoneRegex.test(fields.phone.replace(/\s+/g, ""))) {
      e.phone = "Please enter a valid 10-digit Indian mobile number"
      triggerShake("phone")
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!fields.email || !emailRegex.test(fields.email)) {
      e.email = "Please enter a valid email address"
    }
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
          roomType: fields.roomType || "premium-king",
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
        setResult(data)
      } else {
        setServerError(data.error || "Something went wrong. Please try again.")
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  function fieldClass(name: keyof Fields) {
    return cn("form-field", errors[name] && "error", shakeField === name && "shake")
  }

  // Success confirmation
  if (result) {
    return (
      <div
        className="p-8 rounded-2xl bg-white"
        role="region"
        aria-label="Booking confirmation"
        aria-live="polite"
      >
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: "rgba(86,29,112,0.1)" }}
            aria-hidden="true"
          >
            <span style={{ fontSize: "2rem" }}>✓</span>
          </div>
          <h3
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 300,
              fontSize: "2rem",
              color: "#561d70",
            }}
          >
            Booking Request Confirmed
          </h3>
        </div>

        <div
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: "var(--off-white)" }}
        >
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Booking Reference", result.bookingRef],
              ["Room", result.summary.roomName],
              ["Check-in", result.summary.checkIn],
              ["Check-out", result.summary.checkOut],
              ["Nights", String(result.summary.nights)],
              ["Guests", String(result.summary.guests)],
              ["Subtotal", `₹${result.summary.subtotal.toLocaleString("en-IN")}`],
              ["GST (12%)", `₹${result.summary.taxes.toLocaleString("en-IN")}`],
              ["Total", `₹${result.summary.total.toLocaleString("en-IN")}`],
            ].map(([label, value]) => (
              <div key={label} className={label === "Total" ? "col-span-2 pt-2 border-t border-[#e8d5f0]" : ""}>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#8a6a9a", marginBottom: "2px" }}>{label}</p>
                <p style={{ fontFamily: label === "Total" ? "var(--font-cormorant)" : "var(--font-inter)", fontSize: label === "Total" ? "1.4rem" : "14px", fontWeight: label === "Total" ? 500 : 400, color: "#2d1b3d" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#5a4a6a", textAlign: "center", lineHeight: 1.6 }}>
          A confirmation will be sent to <strong>{result.summary.email}</strong>.<br />
          Our team will contact you at <strong>{result.summary.phone}</strong> within 2 hours.
        </p>

        <button
          onClick={() => window.print()}
          className="w-full mt-6 py-3 rounded-lg border border-[#e8d5f0] text-[#561d70] text-sm font-medium transition-colors hover:bg-[#f3eef7]"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Print / Save Confirmation
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={`Book your stay at ${property.name}, ${property.location}`}>
      <p className="text-sm mb-5" style={{ fontFamily: "var(--font-inter)", color: "#8a6a9a", fontSize: "13px" }}>
        Fields marked <span aria-hidden="true">*</span><span className="sr-only">(asterisk)</span> are required.
      </p>

      {/* Error summary */}
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-5 p-4 rounded-lg outline-none"
          style={{ backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#dc2626" }}
        >
          Please correct {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} below.
        </div>
      )}

      {serverError && (
        <div role="alert" className="mb-5 p-4 rounded-lg" style={{ backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", fontFamily: "var(--font-inter)", fontSize: "14px", color: "#dc2626" }}>
          {serverError}
        </div>
      )}

      {/* Row 1: Dates + guests */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="prop-checkin" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
            Check-in <span aria-hidden="true">*</span><span className="sr-only"> required</span>
          </label>
          <input id="prop-checkin" type="date" min={today} value={fields.checkIn}
            onChange={(e) => setField("checkIn", e.target.value)}
            aria-required="true" aria-invalid={!!errors.checkIn}
            aria-describedby={errors.checkIn ? "err-prop-checkin" : undefined}
            className={fieldClass("checkIn")} />
          {errors.checkIn && <p id="err-prop-checkin" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>{errors.checkIn}</p>}
        </div>

        <div>
          <label htmlFor="prop-checkout" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
            Check-out <span aria-hidden="true">*</span><span className="sr-only"> required</span>
          </label>
          <input id="prop-checkout" type="date" min={fields.checkIn || today} value={fields.checkOut}
            onChange={(e) => setField("checkOut", e.target.value)}
            aria-required="true" aria-invalid={!!errors.checkOut}
            aria-describedby={errors.checkOut ? "err-prop-checkout" : undefined}
            className={fieldClass("checkOut")} />
          {errors.checkOut && <p id="err-prop-checkout" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>{errors.checkOut}</p>}
        </div>

        <div>
          <label htmlFor="prop-guests" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
            Guests <span aria-hidden="true">*</span><span className="sr-only"> required</span>
          </label>
          <input id="prop-guests" type="number" min={1} max={8} value={fields.guests}
            onChange={(e) => setField("guests", e.target.value)}
            aria-required="true" aria-invalid={!!errors.guests}
            aria-describedby={errors.guests ? "err-prop-guests" : "prop-guests-hint"}
            className={fieldClass("guests")} />
          <p id="prop-guests-hint" className="sr-only">Enter number of guests, 1 to 8</p>
          {errors.guests && <p id="err-prop-guests" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>{errors.guests}</p>}
        </div>
      </div>

      {/* Row 2: Room type */}
      <div className="mb-4">
        <label htmlFor="prop-room" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
          Room Type
        </label>
        <select id="prop-room" value={fields.roomType} onChange={(e) => setField("roomType", e.target.value)} className={fieldClass("roomType")}>
          <option value="">Select room type</option>
          {ROOMS.map((r) => (
            <option key={r.id} value={r.id}>{r.name} — {r.size} — From ₹{r.basePrice.toLocaleString("en-IN")}/night</option>
          ))}
        </select>
      </div>

      {/* Row 3: Name, Phone, Email */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="prop-name" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
            Full Name <span aria-hidden="true">*</span><span className="sr-only"> required</span>
          </label>
          <input id="prop-name" type="text" autoComplete="name" value={fields.name}
            onChange={(e) => setField("name", e.target.value)}
            aria-required="true" aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "err-prop-name" : undefined}
            className={fieldClass("name")} placeholder="Your full name" />
          {errors.name && <p id="err-prop-name" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="prop-phone" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
            Phone <span aria-hidden="true">*</span><span className="sr-only"> required</span>
          </label>
          <input id="prop-phone" type="tel" autoComplete="tel" value={fields.phone}
            onChange={(e) => setField("phone", e.target.value)}
            aria-required="true" aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-prop-phone" : "prop-phone-hint"}
            className={fieldClass("phone")} placeholder="10-digit mobile number" />
          <p id="prop-phone-hint" className="sr-only">Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9</p>
          {errors.phone && <p id="err-prop-phone" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="prop-email" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
            Email <span aria-hidden="true">*</span><span className="sr-only"> required</span>
          </label>
          <input id="prop-email" type="email" autoComplete="email" value={fields.email}
            onChange={(e) => setField("email", e.target.value)}
            aria-required="true" aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "err-prop-email" : undefined}
            className={fieldClass("email")} placeholder="your@email.com" />
          {errors.email && <p id="err-prop-email" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>{errors.email}</p>}
        </div>
      </div>

      {/* Row 4: Special requests */}
      <div className="mb-6">
        <label htmlFor="prop-requests" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.06em" }}>
          Special Requests <span style={{ color: "#8a6a9a" }}>(optional)</span>
        </label>
        <textarea
          id="prop-requests"
          rows={3}
          value={fields.specialRequests}
          onChange={(e) => setField("specialRequests", e.target.value)}
          className="form-field resize-none"
          placeholder="Early check-in, dietary requirements, accessibility needs..."
        />
      </div>

      {/* Live price preview */}
      {priceDisplay && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{ backgroundColor: "var(--off-white)", border: "1px solid #e8d5f0" }}
          aria-live="polite"
          aria-atomic="true"
          aria-label="Estimated booking price"
        >
          <div className="flex justify-between items-start mb-2">
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a" }}>
              ₹{priceDisplay.roomPrice.toLocaleString("en-IN")} × {priceDisplay.nights} night{priceDisplay.nights > 1 ? "s" : ""}
            </span>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#2d1b3d" }}>
              ₹{priceDisplay.subtotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-start mb-3">
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a" }}>GST (12%)</span>
            <span style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#2d1b3d" }}>₹{priceDisplay.taxes.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#e8d5f0]">
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px", color: "#2d1b3d" }}>Total</span>
            <span style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "1.5rem", color: "#561d70" }}>
              ₹{priceDisplay.total.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full text-white font-medium tracking-widest uppercase rounded-lg transition-all duration-300"
        style={{ fontFamily: "var(--font-inter)", fontSize: "14px", height: "56px", backgroundColor: "#561d70" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#7b3fa0" }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#561d70" }}
      >
        {loading ? (
          <>
            <span className="sr-only">Processing your booking request...</span>
            Processing...
          </>
        ) : "CONFIRM BOOKING REQUEST"}
      </button>
    </form>
  )
}
