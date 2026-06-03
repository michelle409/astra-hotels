"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Check } from "lucide-react"
import { ROOMS, type Property } from "@/lib/data"
import PanoramaViewer from "./PanoramaViewer"
import { RoomBookingModal } from "./RoomBookingModal"

const TOUR_BTN_CSS = `
  @keyframes pulse-tour {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.55); }
    50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
  }
  .tour-360-btn { animation: pulse-tour 2.5s ease-in-out infinite; }
  .tour-360-btn:hover { background: #561d70 !important; color: white !important; }
  .tour-360-btn:focus-visible { outline: 2px solid #c9a84c; outline-offset: 2px; animation: none; }
  @media (prefers-reduced-motion: reduce) { .tour-360-btn { animation: none; } }
`

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

type Props = {
  property: Property
}

export function PropertyRoomsSection({ property }: Props) {
  const [activeTourRoomId, setActiveTourRoomId] = useState<string | null>(null)
  const [activeBookingRoomId, setActiveBookingRoomId] = useState<string | null>(null)
  const tourTriggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const activeTourRoom = ROOMS.find((r) => r.id === activeTourRoomId) ?? null
  const activeBookingRoom = ROOMS.find((r) => r.id === activeBookingRoomId) ?? null

  return (
    <section
      id="rooms"
      aria-labelledby="prop-rooms-heading"
      className="section-padding bg-white"
      style={{ paddingLeft: "48px", paddingRight: "48px" }}
    >
      <div className="site-container">
        <h2
          id="prop-rooms-heading"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            color: "#2d1b3d",
            marginBottom: "56px",
          }}
        >
          Choose Your Room
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "56px" }}>
          {ROOMS.map((room) => (
            <article key={room.id} className="flex flex-col md:flex-row rounded-2xl bg-white shadow-lg border border-[#f0e6f8]">
              {/* Image */}
              <div className="relative md:w-[55%] h-64 md:h-auto flex-shrink-0 overflow-hidden rounded-t-2xl md:rounded-t-none md:rounded-l-2xl" style={{ minHeight: "460px" }}>
                <Image
                  src={room.image}
                  alt={`${room.name} — ${room.size}, ${room.beds}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 55vw"
                  loading="lazy"
                />
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between" style={{ padding: "48px 56px" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500, fontSize: "2rem", color: "#561d70", marginBottom: "0.5rem" }}>
                    {room.name}
                  </h3>
                  <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "14px", color: "#8a6a9a", marginBottom: "1.25rem" }}>
                    {room.size} &bull; Up to {room.maxGuests} guests &bull; {room.beds}
                  </p>

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

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setActiveBookingRoomId(room.id)}
                      className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-md text-white text-[13px] font-medium tracking-wide transition-all duration-200 hover:bg-[#7b3fa0]"
                      style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
                      aria-label={`Book ${room.name}`}
                    >
                      BOOK THIS ROOM
                    </button>

                    <button
                      ref={(el) => {
                        if (el) tourTriggerRefs.current.set(room.id, el)
                        else tourTriggerRefs.current.delete(room.id)
                      }}
                      onClick={() => setActiveTourRoomId(room.id)}
                      aria-label={`TAKE A 360° TOUR — ${room.name}`}
                      className="tour-360-btn w-full inline-flex items-center justify-center px-6 py-2.5 rounded-md text-[13px] font-medium tracking-wide transition-all duration-200"
                      style={{
                        fontFamily: "var(--font-inter)",
                        border: "1.5px solid #561d70",
                        color: "#561d70",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <span aria-hidden="true">🎯 </span>TAKE A 360° TOUR
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeTourRoomId && activeTourRoom && (
        <PanoramaViewer
          isOpen={true}
          title={`${activeTourRoom.name} — 360° Tour`}
          scenes={getRoomScenes(activeTourRoomId)}
          onClose={() => {
            const id = activeTourRoomId
            setActiveTourRoomId(null)
            setTimeout(() => tourTriggerRefs.current.get(id)?.focus(), 0)
          }}
        />
      )}

      {activeBookingRoomId && activeBookingRoom && (
        <RoomBookingModal
          room={activeBookingRoom}
          property={property}
          onClose={() => setActiveBookingRoomId(null)}
        />
      )}

      <style>{TOUR_BTN_CSS}</style>
    </section>
  )
}
