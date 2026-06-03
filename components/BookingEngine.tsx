"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { PROPERTIES, ROOMS } from "@/lib/data"

type Fields = {
  propertyId: string
  checkIn: string
  checkOut: string
  guests: string
  roomType: string
  purpose: string
  promoCode: string
}

type Errors = Partial<Record<keyof Fields, string>>

const today = new Date().toISOString().split("T")[0]

export function BookingEngine() {
  const router = useRouter()
  const [fields, setFields] = useState<Fields>({
    propertyId: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    roomType: "",
    purpose: "",
    promoCode: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [shakeField, setShakeField] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Live price preview (debounced)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  const computePrice = useCallback(() => {
    const room = ROOMS.find((r) => r.id === fields.roomType) || ROOMS[2]
    const guests = parseInt(fields.guests) || 1
    const base = room.basePrice
    const surcharge = guests > 2 ? (guests - 2) * 500 : 0
    setEstimatedPrice(base + surcharge)
  }, [fields.roomType, fields.guests])

  useEffect(() => {
    clearTimeout(priceRef.current)
    priceRef.current = setTimeout(computePrice, 500)
    return () => clearTimeout(priceRef.current)
  }, [computePrice])

  function setField(key: keyof Fields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function triggerShake(field: string) {
    setShakeField(null)
    requestAnimationFrame(() => setShakeField(field))
  }

  function validate(): Errors {
    const e: Errors = {}
    if (!fields.propertyId) e.propertyId = "Please select a property"
    if (!fields.checkIn) e.checkIn = "Check-in date is required"
    if (!fields.checkOut) e.checkOut = "Check-out date is required"
    if (fields.checkIn && fields.checkOut && fields.checkOut <= fields.checkIn) {
      e.checkOut = "Check-out must be after check-in"
      triggerShake("checkOut")
    }
    if (!fields.guests || parseInt(fields.guests) < 1) e.guests = "At least 1 guest required"
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTimeout(() => errorSummaryRef.current?.focus(), 50)
      return
    }

    setLoading(true)
    const params = new URLSearchParams({
      checkIn: fields.checkIn,
      checkOut: fields.checkOut,
      guests: fields.guests,
      ...(fields.roomType && { roomType: fields.roomType }),
    })
    router.push(`/${fields.propertyId}?${params.toString()}`)
  }

  const fieldClass = (name: keyof Fields) =>
    `form-field${errors[name] ? " error" : ""}${shakeField === name ? " shake" : ""}`

  return (
    <section
      id="booking"
      aria-labelledby="booking-heading"
      className="relative py-24 px-6 overflow-hidden"
      style={{ minHeight: "500px" }}
    >
      {/* Video background */}
      <video
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        poster="/media/properties/hotel-lobby-stock.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/media/videos/hero-video.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "rgba(26,10,36,0.75)", zIndex: 1 }}
      />

      <div className="relative max-w-4xl mx-auto" style={{ zIndex: 2 }}>
        <h2
          id="booking-heading"
          className="text-center mb-10 text-white"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          Reserve Your Stay
        </h2>

        <form
          onSubmit={handleSubmit}
          noValidate
          aria-label="Hotel booking form"
        >
          {/* Required fields note */}
          <p
            className="text-sm mb-6 text-center"
            style={{
              fontFamily: "var(--font-inter)",
              color: "rgba(255,255,255,0.65)",
              fontSize: "13px",
            }}
          >
            Fields marked with <span aria-hidden="true">*</span>
            <span className="sr-only">(asterisk)</span> are required.
          </p>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              className="mb-6 p-4 rounded-lg outline-none"
              style={{
                backgroundColor: "rgba(220,38,38,0.15)",
                border: "1px solid rgba(220,38,38,0.4)",
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                color: "#fca5a5",
              }}
            >
              Please correct {Object.keys(errors).length} error
              {Object.keys(errors).length > 1 ? "s" : ""} before continuing.
            </div>
          )}

          <div
            className="p-8 rounded-2xl"
            style={{ backgroundColor: "white", boxShadow: "0 8px 60px rgba(0,0,0,0.3)" }}
          >
            {/* Row 1: Property, Check-in, Check-out, Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label htmlFor="booking-property" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Property <span aria-hidden="true">*</span><span className="sr-only"> (required)</span>
                </label>
                <select
                  id="booking-property"
                  value={fields.propertyId}
                  onChange={(e) => setField("propertyId", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.propertyId}
                  aria-describedby={errors.propertyId ? "err-property" : undefined}
                  className={fieldClass("propertyId")}
                >
                  <option value="">Select property</option>
                  {PROPERTIES.map((p) => (
                    <option key={p.id} value={p.id}>{p.area} — {p.location}</option>
                  ))}
                </select>
                {errors.propertyId && (
                  <p id="err-property" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>
                    {errors.propertyId}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-checkin" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Check-in <span aria-hidden="true">*</span><span className="sr-only"> (required)</span>
                </label>
                <input
                  id="booking-checkin"
                  type="date"
                  min={today}
                  value={fields.checkIn}
                  onChange={(e) => setField("checkIn", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.checkIn}
                  aria-describedby={errors.checkIn ? "err-checkin" : undefined}
                  className={fieldClass("checkIn")}
                />
                {errors.checkIn && (
                  <p id="err-checkin" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>
                    {errors.checkIn}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-checkout" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Check-out <span aria-hidden="true">*</span><span className="sr-only"> (required)</span>
                </label>
                <input
                  id="booking-checkout"
                  type="date"
                  min={fields.checkIn || today}
                  value={fields.checkOut}
                  onChange={(e) => setField("checkOut", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.checkOut}
                  aria-describedby={errors.checkOut ? "err-checkout" : undefined}
                  className={fieldClass("checkOut")}
                />
                {errors.checkOut && (
                  <p id="err-checkout" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>
                    {errors.checkOut}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-guests" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Guests <span aria-hidden="true">*</span><span className="sr-only"> (required)</span>
                </label>
                <input
                  id="booking-guests"
                  type="number"
                  min={1}
                  max={8}
                  value={fields.guests}
                  onChange={(e) => setField("guests", e.target.value)}
                  aria-required="true"
                  aria-invalid={!!errors.guests}
                  aria-describedby={errors.guests ? "err-guests" : "guests-hint"}
                  className={fieldClass("guests")}
                />
                <p id="guests-hint" className="sr-only">Enter number of guests, 1 to 8</p>
                {errors.guests && (
                  <p id="err-guests" role="alert" className="mt-1 text-xs text-red-600" style={{ fontFamily: "var(--font-inter)" }}>
                    {errors.guests}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Room type, Purpose, Promo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="booking-room" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Room Type
                </label>
                <select
                  id="booking-room"
                  value={fields.roomType}
                  onChange={(e) => setField("roomType", e.target.value)}
                  className={fieldClass("roomType")}
                >
                  <option value="">All Types</option>
                  {ROOMS.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="booking-purpose" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Purpose
                </label>
                <select
                  id="booking-purpose"
                  value={fields.purpose}
                  onChange={(e) => setField("purpose", e.target.value)}
                  className={fieldClass("purpose")}
                >
                  <option value="">Select purpose</option>
                  <option value="business">Business</option>
                  <option value="leisure">Leisure</option>
                  <option value="family">Family</option>
                  <option value="medical">Medical Tourism</option>
                </select>
              </div>

              <div>
                <label htmlFor="booking-promo" className="block text-xs font-medium mb-1.5" style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a", letterSpacing: "0.08em" }}>
                  Promo Code
                </label>
                <input
                  id="booking-promo"
                  type="text"
                  placeholder="Optional"
                  value={fields.promoCode}
                  onChange={(e) => setField("promoCode", e.target.value)}
                  className={fieldClass("promoCode")}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full text-white font-medium tracking-widest uppercase transition-all duration-300 rounded-lg relative overflow-hidden"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                height: "56px",
                backgroundColor: "#561d70",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#7b3fa0"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#561d70"
              }}
            >
              {loading ? "Checking availability..." : "CHECK AVAILABILITY"}
            </button>

            {/* Live price preview — WCAG 4.1.3: polite live region */}
            {estimatedPrice !== null && (
              <p
                className="text-center mt-4 text-sm"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  color: "#5a4a6a",
                  fontSize: "14px",
                }}
              >
                Estimated from{" "}
                <span
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Estimated price from ₹${estimatedPrice.toLocaleString("en-IN")} per night`}
                >
                  <strong style={{ color: "#561d70" }}>
                    ₹{estimatedPrice.toLocaleString("en-IN")}
                  </strong>{" "}
                  per night
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
