"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Camera } from "lucide-react"
import { ROOMS } from "@/lib/data"
import { Tour360Modal } from "./Tour360Modal"

export function RoomsShowcase() {
  const [activeTour, setActiveTour] = useState<{ imageUrl: string; roomName: string } | null>(null)
  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  function openTour(roomId: string, imageUrl: string, roomName: string) {
    setActiveTour({ imageUrl, roomName })
    const trigger = triggerRefs.current.get(roomId)
    if (trigger) trigger.dataset.tourId = roomId
  }

  function closeTour() {
    setActiveTour(null)
  }

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
            <RoomCard
              key={room.id}
              room={room}
              index={idx}
              onOpenTour={(imageUrl, roomName) => openTour(room.id, imageUrl, roomName)}
              triggerRef={(el) => {
                if (el) triggerRefs.current.set(room.id, el)
              }}
            />
          ))}
        </div>
      </div>

      {activeTour && (
        <Tour360Modal
          imageUrl={activeTour.imageUrl}
          roomName={activeTour.roomName}
          onClose={closeTour}
        />
      )}
    </section>
  )
}

type RoomCardProps = {
  room: (typeof ROOMS)[0]
  index: number
  onOpenTour: (imageUrl: string, roomName: string) => void
  triggerRef: (el: HTMLButtonElement | null) => void
}

function RoomCard({ room, index, onOpenTour, triggerRef }: RoomCardProps) {
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

        {/* 360 tour badge */}
        <div
          className="absolute top-4 left-4 animate-pulse-slow"
          aria-hidden="true"
        >
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white"
            style={{
              backgroundColor: "#561d70",
              fontFamily: "var(--font-inter)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.1em",
            }}
          >
            <Camera size={13} />
            360° TOUR
          </span>
        </div>

        {/* Clickable image overlay for tour */}
        <button
          onClick={() => onOpenTour(room.tour360, room.name)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`Open 360-degree virtual tour of ${room.name}`}
          tabIndex={-1}
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

          {/* Amenity pills — first 4 */}
          <div className="flex flex-wrap gap-2 mb-4" aria-label={`${room.name} amenities`}>
            {room.amenities.slice(0, 4).map((a) => (
              <span key={a} className="amenity-pill">
                {a}
              </span>
            ))}
          </div>
        </div>

        <div>
          {/* Price */}
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

          {/* Buttons */}
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

            <button
              ref={triggerRef}
              onClick={() => onOpenTour(room.tour360, room.name)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-[13px] font-medium tracking-wide transition-all duration-200 hover:bg-[#f3eef7]"
              style={{
                fontFamily: "var(--font-inter)",
                border: "1.5px solid #561d70",
                color: "#561d70",
              }}
              aria-label={`Take a 360-degree virtual tour of ${room.name}`}
            >
              <Camera size={14} aria-hidden="true" />
              360° VIRTUAL TOUR
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
