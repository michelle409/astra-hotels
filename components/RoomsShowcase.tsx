"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { ROOMS } from "@/lib/data"

export function RoomsShowcase() {
  return (
    <section
      id="rooms"
      aria-labelledby="rooms-heading"
      className="py-24 px-6"
      style={{ backgroundColor: "var(--off-white)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p
            className="label-caps mb-4"
            style={{ color: "#561d70" }}
            aria-hidden="true"
          >
            ROOM TYPES
          </p>
          <h2
            id="rooms-heading"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#2d1b3d",
            }}
          >
            Discover Your Perfect Room
          </h2>
        </div>

        <div className="flex flex-col gap-8">
          {ROOMS.map((room, idx) => (
            <RoomCard key={room.id} room={room} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

type RoomCardProps = {
  room: (typeof ROOMS)[0]
  index: number
}

function RoomCard({ room, index }: RoomCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const isEven = index % 2 === 0

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
    el.style.transform = isEven ? "translateX(-60px)" : "translateX(60px)"
    el.style.transition = `opacity 0.7s ease ${index * 0.1}s, transform 0.7s ease ${index * 0.1}s`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateX(0)"
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isEven, index])

  return (
    <article
      ref={cardRef}
      className="flex flex-col md:flex-row rounded-2xl overflow-hidden bg-white shadow-lg"
      style={{ minHeight: "400px" }}
    >
      {/* Image side */}
      <div className="relative md:w-[55%] h-64 md:h-auto flex-shrink-0">
        <Image
          src={room.image}
          alt={`${room.name} — ${room.size}, ${room.beds}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 55vw"
          loading="lazy"
        />
      </div>

      {/* Details side */}
      <div className="flex-1 p-8 flex flex-col justify-between">
        <div>
          <h3
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 500,
              fontSize: "1.6rem",
              color: "#561d70",
              marginBottom: "0.5rem",
            }}
          >
            {room.name}
          </h3>

          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "14px",
              color: "#8a6a9a",
              marginBottom: "1rem",
            }}
          >
            {room.size} &bull; Up to {room.maxGuests} guests &bull; {room.beds}
          </p>

          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "14px",
              color: "#5a4a6a",
              lineHeight: 1.6,
              marginBottom: "1.25rem",
            }}
          >
            {room.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4" aria-label={`${room.name} amenities`}>
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className="amenity-pill">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "1.4rem",
              color: "#561d70",
              marginBottom: "0.25rem",
            }}
          >
            From ₹{room.basePrice.toLocaleString("en-IN")} <span style={{ fontSize: "1rem" }}>/ night</span>
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "12px",
              color: "#8a6a9a",
              marginBottom: "1.25rem",
            }}
          >
            + 12% GST
          </p>

          <div className="flex gap-3 flex-wrap">
            <a
              href="/#booking"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-white text-[13px] font-medium tracking-wide transition-all duration-200 hover:bg-[#7b3fa0]"
              style={{
                fontFamily: "var(--font-inter)",
                backgroundColor: "#561d70",
              }}
            >
              BOOK NOW
              <span className="sr-only"> — {room.name}</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
