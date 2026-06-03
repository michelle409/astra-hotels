"use client"

import { notFound, useSearchParams } from "next/navigation"
import { use, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, MapPin, Clock, UtensilsCrossed, Phone, Mail, MessageCircle } from "lucide-react"
import { PROPERTIES } from "@/lib/data"
import { Navigation } from "@/components/Navigation"
import { PropertyBookingForm } from "@/components/PropertyBookingForm"
import { PropertyRoomsSection } from "@/components/PropertyRoomsSection"
import { NearbyAttractions } from "@/components/NearbyAttractions"
import { AmenitiesSection } from "@/components/AmenitiesSection"
import { Footer } from "@/components/Footer"

type Props = {
  params: Promise<{ propertyId: string }>
}

export default function PropertyPage({ params }: Props) {
  const { propertyId } = use(params)
  const property = PROPERTIES.find((p) => p.id === propertyId)

  if (!property) notFound()

  const searchParams = useSearchParams()
  const checkIn = searchParams.get("checkIn") || ""
  const checkOut = searchParams.get("checkOut") || ""
  const guests = searchParams.get("guests") || "1"
  const roomType = searchParams.get("roomType") || ""

  const bookingSectionRef = useRef<HTMLDivElement>(null)

  function scrollToBooking(preSelectRoom?: string) {
    bookingSectionRef.current?.scrollIntoView({ behavior: "smooth" })
    if (preSelectRoom) {
      const roomSelect = document.getElementById("prop-room") as HTMLSelectElement | null
      if (roomSelect) roomSelect.value = preSelectRoom
    }
  }

  return (
    <>
      <Navigation />
      <main id="main-content" tabIndex={-1}>
        {/* Property Hero */}
        <section
          aria-label={`${property.name}, ${property.location} — hero`}
          className="relative overflow-hidden"
          style={{ height: "100dvh", minHeight: "600px" }}
        >
          <div className="absolute inset-0 ken-burns" style={{ zIndex: 0 }}>
            <Image
              src={property.heroImage}
              alt={`${property.name} — ${property.area}`}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(26,10,36,0.9) 0%, rgba(86,29,112,0.4) 50%, rgba(0,0,0,0.2) 100%)",
              zIndex: 1,
            }}
          />

          <div
            className="relative h-full flex flex-col justify-end pb-20 px-8 max-w-5xl mx-auto"
            style={{ zIndex: 2 }}
          >
            {/* Back button */}
            <Link
              href="/"
              className="absolute top-24 left-8 inline-flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              All Properties
            </Link>

            {/* Area badge */}
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 self-start"
              style={{
                backgroundColor: "rgba(192,132,200,0.2)",
                border: "1px solid rgba(192,132,200,0.4)",
                color: "#c084c8",
                fontFamily: "var(--font-inter)",
                letterSpacing: "0.12em",
              }}
            >
              {property.area.toUpperCase()}
            </span>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 300,
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                color: "white",
                lineHeight: 1.05,
                marginBottom: "0.75rem",
              }}
            >
              {property.name}
              <br />
              <em style={{ fontSize: "0.75em", opacity: 0.8 }}>{property.location}</em>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 300,
                fontSize: "18px",
                color: "rgba(255,255,255,0.75)",
                marginBottom: "1.5rem",
              }}
            >
              {property.tagline}
            </p>

            {/* Info badges */}
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { icon: <MapPin size={14} aria-hidden="true" />, label: `${property.rooms} Rooms` },
                { icon: <Clock size={14} aria-hidden="true" />, label: `Check-in ${property.checkIn}` },
                { icon: <Clock size={14} aria-hidden="true" />, label: `Check-out ${property.checkOut}` },
                ...(property.restaurant
                  ? [{ icon: <UtensilsCrossed size={14} aria-hidden="true" />, label: property.restaurant.name }]
                  : []),
              ].map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {badge.icon}
                  {badge.label}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => scrollToBooking()}
                className="inline-flex items-center justify-center px-8 py-3 rounded-md text-white text-[13px] font-medium tracking-widest uppercase transition-all duration-200 hover:bg-[#7b3fa0]"
                style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
              >
                BOOK NOW
              </button>
              <button
                onClick={() => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center px-8 py-3 rounded-md text-white text-[13px] font-medium tracking-widest uppercase transition-all duration-200 hover:bg-white/10"
                style={{ fontFamily: "var(--font-inter)", border: "1.5px solid rgba(255,255,255,0.7)" }}
              >
                360° VIRTUAL TOURS
              </button>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section
          ref={bookingSectionRef}
          id="booking"
          aria-labelledby="prop-booking-heading"
          className="py-16 px-6"
          style={{ backgroundColor: "#561d70" }}
        >
          <div className="max-w-3xl mx-auto">
            <h2
              id="prop-booking-heading"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 300,
                fontSize: "2rem",
                color: "white",
                marginBottom: "2rem",
              }}
            >
              Book Your Stay at {property.location}
            </h2>
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <PropertyBookingForm
                property={property}
                initialCheckIn={checkIn}
                initialCheckOut={checkOut}
                initialGuests={guests}
                initialRoomType={roomType}
              />
            </div>
          </div>
        </section>

        {/* Rooms with 360 tours */}
        <PropertyRoomsSection onSelectRoom={(roomId) => scrollToBooking(roomId)} />

        {/* Day Use Rooms */}
        <section
          aria-labelledby="dayuse-heading"
          className="py-20 px-6"
          style={{ backgroundColor: "var(--light-gray)" }}
        >
          <div className="max-w-4xl mx-auto">
            <h2
              id="dayuse-heading"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 300,
                fontSize: "2rem",
                color: "#2d1b3d",
                marginBottom: "2rem",
              }}
            >
              Premium Day Stays
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Quick Luxe Stay",
                  duration: "4 Hours",
                  desc: "Refreshing daytime break — ideal for business visits, transit stays, or moments of relaxation.",
                },
                {
                  title: "Extended Comfort Escape",
                  duration: "8 Hours",
                  desc: "Relax, recharge, or work in style with premium hospitality and contemporary conveniences.",
                },
              ].map((pkg) => (
                <div key={pkg.title} className="bg-white rounded-2xl p-8 shadow-sm border border-[#e8d5f0]">
                  <h3
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      fontWeight: 500,
                      fontSize: "1.4rem",
                      color: "#561d70",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {pkg.title}
                  </h3>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "#8a6a9a", marginBottom: "0.75rem" }}>
                    Premium King Room &bull; Day use &bull; {pkg.duration}
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#5a4a6a", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                    {pkg.desc}
                  </p>
                  <button
                    onClick={() => scrollToBooking("premium-king")}
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-white text-sm font-medium transition-all duration-200 hover:bg-[#7b3fa0]"
                    style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
                    aria-label={`Book ${pkg.title} day stay`}
                  >
                    BOOK DAY STAY
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Restaurant — ONLY if property.restaurant !== null */}
        {property.restaurant && (
          <section
            id="dining"
            aria-labelledby="restaurant-heading"
            className="py-24 px-6 bg-white"
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-12 items-center">
                {/* Images */}
                <div className="md:w-1/2 relative">
                  {property.restaurant.images[0] && (
                    <div className="relative rounded-2xl overflow-hidden" style={{ height: "380px" }}>
                      <Image
                        src={property.restaurant.images[0]}
                        alt={`${property.restaurant.name} restaurant`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  {property.restaurant.images[1] && (
                    <div
                      className="absolute rounded-2xl overflow-hidden shadow-xl"
                      style={{
                        width: "55%",
                        height: "220px",
                        bottom: "-30px",
                        right: "-20px",
                        border: "4px solid white",
                      }}
                    >
                      <Image
                        src={property.restaurant.images[1]}
                        alt={`${property.restaurant.name} interior`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="30vw"
                      />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="md:w-1/2 md:pl-8">
                  <p
                    className="label-caps mb-3"
                    style={{ color: "#c084c8" }}
                    aria-hidden="true"
                  >
                    DINING AT ASTRA
                  </p>
                  <h2
                    id="restaurant-heading"
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      fontWeight: 500,
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      color: "#561d70",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {property.restaurant.name}
                  </h2>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "16px", color: "#8a6a9a", marginBottom: "0.75rem" }}>
                    {property.restaurant.cuisine}
                  </p>
                  <p
                    className="flex items-center gap-2 mb-4"
                    style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "15px", color: "#5a4a6a" }}
                  >
                    <Clock size={15} aria-hidden="true" />
                    {property.restaurant.hours}
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "15px", color: "#5a4a6a", lineHeight: 1.7, marginBottom: "2rem" }}>
                    {property.restaurant.description}
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    {/* Visit button — disabled if no websiteUrl, tooltip on hover */}
                    <span className="relative group">
                      <a
                        href={property.restaurant.websiteUrl || "#"}
                        aria-disabled={!property.restaurant.websiteUrl}
                        tabIndex={property.restaurant.websiteUrl ? 0 : -1}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
                        style={{
                          fontFamily: "var(--font-inter)",
                          border: `1.5px solid ${property.restaurant.websiteUrl ? "#561d70" : "#ccc"}`,
                          color: property.restaurant.websiteUrl ? "#561d70" : "#aaa",
                          cursor: property.restaurant.websiteUrl ? "pointer" : "default",
                          pointerEvents: property.restaurant.websiteUrl ? "auto" : "none",
                        }}
                        onClick={(e) => { if (!property.restaurant!.websiteUrl) e.preventDefault() }}
                      >
                        VISIT {property.restaurant.name.toUpperCase()} →
                      </a>
                      {!property.restaurant.websiteUrl && (
                        <span
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs text-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          style={{ backgroundColor: "#2d1b3d", fontFamily: "var(--font-inter)" }}
                          role="tooltip"
                        >
                          Website coming soon
                        </span>
                      )}
                    </span>

                    <a
                      href="#"
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-white text-sm font-medium transition-all duration-200 hover:bg-[#7b3fa0]"
                      style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
                    >
                      VIEW MENU
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Nearby Attractions */}
        <NearbyAttractions propertyId={property.id} />

        {/* Amenities */}
        <AmenitiesSection variant="light" heading="Every Comfort, Always Available" />

        {/* Contact + Map */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="py-20"
          style={{ backgroundColor: "var(--off-white)" }}
        >
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row overflow-hidden rounded-2xl shadow-lg">
            {/* Map */}
            <div className="md:w-1/2 h-72 md:h-auto min-h-[320px]">
              <iframe
                title={`Map showing ${property.name}, ${property.location} location`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
                className="w-full h-full border-0 rounded-l-2xl"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Contact info */}
            <div className="md:w-1/2 bg-white p-10 flex flex-col justify-center">
              <h2
                id="contact-heading"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 300,
                  fontSize: "2rem",
                  color: "#561d70",
                  marginBottom: "0.5rem",
                }}
              >
                {property.name}
              </h2>
              <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#8a6a9a", marginBottom: "1.5rem" }}>
                {property.location}
              </p>

              <address style={{ fontStyle: "normal" }} className="flex flex-col gap-3">
                <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#5a4a6a", lineHeight: 1.5 }}>
                  <MapPin size={14} className="inline mr-2" aria-hidden="true" />
                  {property.address}
                </p>
                <a
                  href={`tel:${property.phone}`}
                  className="flex items-center gap-2 text-[#561d70] hover:text-[#7b3fa0] transition-colors"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px" }}
                >
                  <Phone size={14} aria-hidden="true" />
                  {property.phone}
                </a>
                <a
                  href={`mailto:${property.email}`}
                  className="flex items-center gap-2 text-[#561d70] hover:text-[#7b3fa0] transition-colors"
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px" }}
                >
                  <Mail size={14} aria-hidden="true" />
                  {property.email}
                </a>
                <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "13px", color: "#8a6a9a" }}>
                  Check-in: {property.checkIn} &bull; Check-out: {property.checkOut}
                </p>
              </address>

              <div className="flex gap-3 mt-6 flex-wrap">
                <a
                  href="https://wa.me/918XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-white text-sm font-medium transition-all duration-200"
                  style={{ fontFamily: "var(--font-inter)", backgroundColor: "#25D366" }}
                  aria-label={`Chat with ${property.name} on WhatsApp`}
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  CHAT WITH US
                </a>
                <a
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 hover:bg-[#f3eef7]"
                  style={{ fontFamily: "var(--font-inter)", border: "1.5px solid #561d70", color: "#561d70" }}
                  aria-label={`Get directions to ${property.name}`}
                >
                  <MapPin size={14} aria-hidden="true" />
                  GET DIRECTIONS
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
