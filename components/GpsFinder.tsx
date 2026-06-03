"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MapPin, Loader2 } from "lucide-react"
import { PROPERTIES } from "@/lib/data"
import { getDistance } from "@/lib/utils"

type NearestResult = {
  property: (typeof PROPERTIES)[0]
  distance: number
  driveMins: number
}

export function GpsFinder() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NearestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [displayDist, setDisplayDist] = useState(0)
  const statusRef = useRef<HTMLDivElement>(null)
  const resultCardRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  function handleDetect() {
    setLoading(true)
    setError(null)
    setResult(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported in your browser. Here are all Astra properties.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        let nearest = PROPERTIES[0]
        let minDist = getDistance(latitude, longitude, PROPERTIES[0].lat, PROPERTIES[0].lng)

        for (const p of PROPERTIES) {
          const d = getDistance(latitude, longitude, p.lat, p.lng)
          if (d < minDist) {
            minDist = d
            nearest = p
          }
        }

        const driveMins = Math.round((minDist / 30) * 60)
        setResult({ property: nearest, distance: minDist, driveMins })
        setLoading(false)

        if (statusRef.current) {
          statusRef.current.textContent = `Nearest hotel: ${nearest.name}, ${nearest.location}, ${minDist.toFixed(1)} km away`
        }
      },
      () => {
        setError("Location access was denied. Here are all Astra properties.")
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  // Animate distance counter
  useEffect(() => {
    if (!result) return
    const target = parseFloat(result.distance.toFixed(1))
    const start = performance.now()
    const duration = 1500

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayDist(parseFloat((ease * target).toFixed(1)))
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        setDisplayDist(target)
      }
    }

    animFrameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [result])

  // Focus result card on arrive
  useEffect(() => {
    if (result && resultCardRef.current) {
      resultCardRef.current.focus()
    }
  }, [result])

  return (
    <section
      id="locations"
      className="w-full py-20 px-6"
      style={{ backgroundColor: "var(--off-white)" }}
    >
      {/* Screen reader status — WCAG 4.1.3 */}
      <div
        ref={statusRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="max-w-3xl mx-auto text-center">
        <p
          className="label-caps mb-4"
          style={{ color: "#561d70" }}
          aria-hidden="true"
        >
          FIND YOUR NEAREST ASTRA
        </p>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 300,
            fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
            color: "#561d70",
            marginBottom: "1rem",
          }}
        >
          The closest comfort is closer than you think.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 300,
            fontSize: "16px",
            color: "#5a4a6a",
            marginBottom: "2.5rem",
            lineHeight: 1.6,
          }}
        >
          Allow location access and we&apos;ll instantly show you the nearest Astra property.
        </p>

        {!result && (
          <button
            onClick={handleDetect}
            disabled={loading}
            aria-busy={loading}
            aria-label="Find nearest Astra hotel using my location"
            className="inline-flex items-center gap-3 text-white text-[14px] font-medium tracking-widest uppercase rounded-md transition-all duration-300 disabled:opacity-70"
            style={{
              fontFamily: "var(--font-inter)",
              backgroundColor: "#561d70",
              height: "52px",
              padding: "0 32px",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = "#3d1452"
                e.currentTarget.style.transform = "scale(1.02)"
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#561d70"
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            {loading ? (
              <>
                <Loader2 size={20} aria-hidden="true" className="animate-spin" />
                <span className="sr-only">Finding nearest hotel...</span>
                Finding...
              </>
            ) : (
              <>
                <MapPin size={20} aria-hidden="true" />
                DETECT MY LOCATION
              </>
            )}
          </button>
        )}

        {/* Error state — role="alert" for assertive announcement */}
        {error && (
          <div role="alert" className="mt-6 mb-4 text-center">
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                color: "#7b3fa0",
                marginBottom: "1rem",
              }}
            >
              {error}
            </p>
            <button
              onClick={handleDetect}
              className="text-[13px] underline text-[#561d70]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Error: show all properties */}
        {error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 text-left">
            {PROPERTIES.map((p) => (
              <Link
                key={p.id}
                href={`/${p.id}`}
                className="block p-4 rounded-xl border border-[#e8d5f0] bg-white hover:border-[#561d70] hover:shadow-lg transition-all duration-300"
              >
                <p
                  className="font-medium text-[#561d70] mb-1"
                  style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.1rem" }}
                >
                  {p.area}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "13px",
                    color: "#5a4a6a",
                  }}
                >
                  {p.rooms} rooms
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Success result card */}
        {result && (
          <div
            ref={resultCardRef}
            tabIndex={-1}
            className="mt-8 rounded-2xl overflow-hidden shadow-2xl outline-none"
            style={{
              background: "linear-gradient(135deg, #561d70, #3d1452)",
              animation: "fadeSlideUp 0.5s cubic-bezier(0.2,0.8,0.2,1) both",
            }}
          >
            <style>{`
              @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(40px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            <div className="flex flex-col md:flex-row dark-bg">
              {/* Left — details */}
              <div className="flex-1 p-8 text-left">
                <p
                  className="label-caps mb-3"
                  style={{ color: "#c084c8", fontSize: "10px" }}
                >
                  NEAREST PROPERTY
                </p>
                <h3
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "1.8rem",
                    fontWeight: 300,
                    color: "white",
                    marginBottom: "0.25rem",
                  }}
                >
                  {result.property.name}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "15px",
                    marginBottom: "1rem",
                  }}
                >
                  {result.property.location}
                </p>

                {/* Distance badge */}
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2"
                  style={{
                    backgroundColor: "rgba(201,168,76,0.2)",
                    color: "#c9a84c",
                    fontFamily: "var(--font-inter)",
                    border: "1px solid rgba(201,168,76,0.4)",
                  }}
                  aria-label={`${result.distance.toFixed(1)} kilometres away`}
                >
                  <MapPin size={14} aria-hidden="true" />
                  <span aria-live="polite" aria-atomic="true">
                    {displayDist.toFixed(1)} km away
                  </span>
                </span>

                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.55)",
                    fontSize: "13px",
                    marginBottom: "1rem",
                  }}
                >
                  ~{result.driveMins} minutes by car
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "13px",
                    marginBottom: "0.5rem",
                  }}
                >
                  {result.property.address}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "13px",
                    marginBottom: "1.5rem",
                  }}
                >
                  {result.property.phone}
                </p>

                <div className="flex gap-3 flex-wrap">
                  <Link
                    href={`/${result.property.id}`}
                    className="inline-flex items-center px-5 py-2 rounded-md text-[13px] font-medium text-[#561d70] bg-white transition-all duration-200 hover:bg-[#f3eef7]"
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    VIEW PROPERTY
                  </Link>
                  <Link
                    href={`/${result.property.id}#booking`}
                    className="inline-flex items-center px-5 py-2 rounded-md text-[13px] font-medium text-[#1a0a24]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      backgroundColor: "#c9a84c",
                    }}
                  >
                    BOOK NOW
                  </Link>
                </div>
              </div>

              {/* Right — map */}
              <div className="md:w-64 h-48 md:h-auto flex-shrink-0 p-4">
                <iframe
                  title={`Map showing ${result.property.name}, ${result.property.location}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(result.property.address)}&output=embed`}
                  className="w-full h-full rounded-xl border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
