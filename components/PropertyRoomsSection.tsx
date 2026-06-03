"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Camera, Check } from "lucide-react"
import { ROOMS, type Property, type Room } from "@/lib/data"
import { Tour360Modal } from "./Tour360Modal"
import { RoomBookingModal } from "./RoomBookingModal"

type Props = {
  property: Property
}

export function PropertyRoomsSection({ property }: Props) {
  const [activeTour, setActiveTour] = useState<Room | null>(null)
  const [activeBookingRoom, setActiveBookingRoom] = useState<Room | null>(null)
  const tourTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  function openTour(room: Room) {
    setActiveTour(room)
  }

  function closeTour() {
    setActiveTour(null)
  }

  return (
    <section
      id="rooms"
      aria-labelledby="prop-rooms-heading"
      className="py-20 px-6 bg-white"
    >
      <div className="max-w-5xl mx-auto">
        <h2
          id="prop-rooms-heading"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            color: "#2d1b3d",
            marginBottom: "3rem",
          }}
        >
          Choose Your Room
        </h2>

        <div className="flex flex-col gap-12">
          {ROOMS.map((room) => (
            <article key={room.id} className="flex flex-col md:flex-row rounded-2xl overflow-hidden bg-white shadow-lg border border-[#f0e6f8]">
              {/* Image */}
              <div className="relative md:w-[55%] h-64 md:h-auto flex-shrink-0" style={{ minHeight: "320px" }}>
                <Image
                  src={room.image}
                  alt={`${room.name} — ${room.size}, ${room.beds}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  loading="lazy"
                />
                {/* Tour badge */}
                <div className="absolute top-4 left-4 animate-pulse-slow" aria-hidden="true">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-medium" style={{ backgroundColor: "#561d70", fontFamily: "var(--font-inter)", letterSpacing: "0.08em" }}>
                    <Camera size={12} />
                    360° TOUR AVAILABLE
                  </span>
                </div>
                {/* Image click for tour */}
                <button
                  onClick={() => openTour(room)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  aria-label={`Open 360-degree view of ${room.name}`}
                  tabIndex={-1}
                />
              </div>

              {/* Details */}
              <div className="flex-1 p-10 flex flex-col justify-between">
                <div>
                  <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "2rem", color: "#561d70", marginBottom: "0.5rem" }}>
                    {room.name}
                  </h3>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#8a6a9a", marginBottom: "1.25rem" }}>
                    {room.size} &bull; Up to {room.maxGuests} guests &bull; {room.beds}
                  </p>

                  {/* Full amenities */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-6 list-none" role="list" aria-label={`${room.name} amenities`}>
                    {room.amenities.map((a) => (
                      <li key={a} className="flex items-center gap-2">
                        <Check size={14} aria-hidden="true" style={{ color: "#561d70", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "13px", color: "#5a4a6a" }}>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.6rem", color: "#561d70", marginBottom: "0.25rem" }}>
                    From ₹{room.basePrice.toLocaleString("en-IN")} <span style={{ fontSize: "1rem" }}>/ night</span>
                  </p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "12px", color: "#8a6a9a", marginBottom: "1.5rem" }}>
                    + 12% GST
                  </p>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setActiveBookingRoom(room)}
                      className="inline-flex items-center justify-center px-6 py-2.5 rounded-md text-white text-[13px] font-medium tracking-wide transition-all duration-200 hover:bg-[#7b3fa0]"
                      style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
                      aria-label={`Book ${room.name}`}
                    >
                      BOOK THIS ROOM
                    </button>

                    <button
                      ref={(el) => { if (el) tourTriggerRefs.current.set(room.id, el) }}
                      onClick={() => openTour(room)}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md text-[13px] font-medium tracking-wide transition-all duration-200 hover:bg-[#f3eef7]"
                      style={{ fontFamily: "var(--font-inter)", border: "1.5px solid #561d70", color: "#561d70" }}
                      aria-label={`Take a 360-degree virtual tour of ${room.name}`}
                    >
                      <Camera size={14} aria-hidden="true" />
                      TAKE A 360° TOUR
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeTour && (
        <Tour360Modal room={activeTour} onClose={closeTour} />
      )}

      {activeBookingRoom && (
        <RoomBookingModal
          room={activeBookingRoom}
          property={property}
          onClose={() => setActiveBookingRoom(null)}
        />
      )}
    </section>
  )
}
