"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MapPin, Loader2 } from "lucide-react"
import { PROPERTIES } from "@/lib/data"
import { getDistance } from "@/lib/utils"

type NearestResult = {
  property: (typeof PROPERTIES)[0]
  distance: number
}

export function GpsFinder() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NearestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [displayDist, setDisplayDist] = useState(0)
  const [prefersReduced, setPrefersReduced] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const resultCardRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mq.matches)
  }, [])

  function handleDetect() {
    setLoading(true)
    setError(null)
    setResult(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported in your browser.")
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
          if (d < minDist) { minDist = d; nearest = p }
        }

        setResult({ property: nearest, distance: minDist })
        setLoading(false)

        if (statusRef.current) {
          statusRef.current.textContent = `Nearest hotel found: ${nearest.name}, ${nearest.location}, ${minDist.toFixed(1)} km away`
        }
      },
      () => {
        setError("Location access was denied.")
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 300000 }
    )
  }

  // Animate distance counter — decorative only, no live region
  useEffect(() => {
    if (!result || prefersReduced) {
      if (result) setDisplayDist(parseFloat(result.distance.toFixed(1)))
      return
    }
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
  }, [result, prefersReduced])

  useEffect(() => {
    if (result && resultCardRef.current) {
      resultCardRef.current.focus()
    }
  }, [result])

  const googleMapsUrl = result
    ? `https://www.google.com/maps/dir/?api=1&destination=${result.property.lat},${result.property.lng}`
    : ""

  return (
    <section
      id="locations"
      aria-labelledby="gps-heading"
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #561d70 0%, #3d1452 100%)",
        padding: "120px 48px",
      }}
    >
      {/* Screen reader status */}
      <div ref={statusRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Background decoration */}
      <div aria-hidden="true" style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)",
        pointerEvents: "none",
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: "-50px", right: "100px",
        width: "300px", height: "300px",
        borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          gap: "80px",
          alignItems: "center",
        }}
      >
        {/* Left — text + CTA */}
        <div style={{ flex: "0 0 55%" }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-inter)",
              fontWeight: 500,
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              padding: "6px 14px",
              borderRadius: "20px",
              marginBottom: "24px",
            }}
          >
            GPS POWERED
          </span>

          <h2
            id="gps-heading"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 300,
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              lineHeight: 1.1,
              color: "white",
              marginBottom: "20px",
            }}
          >
            Find Your Nearest<br />
            <em>Astra Hotel.</em>
          </h2>

          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "18px",
              color: "rgba(255,255,255,0.7)",
              maxWidth: "420px",
              lineHeight: 1.6,
              marginBottom: "40px",
            }}
          >
            {"We'll detect your location and find the closest Astra property — with accurate straight-line distance."}
          </p>

          {!result && (
            <div className="inline-flex items-center justify-center relative">
              {loading && (
                <>
                  <style>{`
                    @media (prefers-reduced-motion: no-preference) {
                      @keyframes gps-ring {
                        0% { transform: scale(1); opacity: 0.6; }
                        100% { transform: scale(2.2); opacity: 0; }
                      }
                    }
                  `}</style>
                  {[0, 0.4, 0.8].map((delay) => (
                    <span
                      key={delay}
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "8px",
                        border: "2px solid rgba(255,255,255,0.5)",
                        animation: `gps-ring 1.8s ease-out ${delay}s infinite`,
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </>
              )}
              <button
                onClick={handleDetect}
                disabled={loading}
                aria-busy={loading}
                aria-label="Find nearest Astra hotel using my location"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "white",
                  color: "#561d70",
                  padding: "16px 36px",
                  borderRadius: "8px",
                  fontFamily: "var(--font-inter)",
                  fontWeight: 600,
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  border: "none",
                  cursor: loading ? "default" : "pointer",
                  opacity: loading ? 0.8 : 1,
                  transition: "all 0.25s",
                  position: "relative",
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = "#f3eef7"
                    e.currentTarget.style.transform = "scale(1.02)"
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "white"
                  e.currentTarget.style.transform = "scale(1)"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} aria-hidden="true" className="animate-spin" />
                    <span className="sr-only">Detecting your location...</span>
                    Detecting...
                  </>
                ) : (
                  <>
                    <MapPin size={18} aria-hidden="true" />
                    DETECT MY LOCATION
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-6">
              <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "rgba(255,255,255,0.8)", marginBottom: "12px" }}>
                {error}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleDetect}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.8)",
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  Try again
                </button>
                <Link
                  href="/#properties"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "var(--font-inter)",
                    fontSize: "13px",
                    color: "white",
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "6px",
                    padding: "8px 16px",
                    textDecoration: "none",
                  }}
                >
                  View all properties
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right — result card */}
        <div style={{ flex: "0 0 45%" }}>
          {result ? (
            <div
              ref={resultCardRef}
              tabIndex={-1}
              className="rounded-2xl outline-none"
              style={{
                background: "white",
                padding: "40px",
                boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
                opacity: 1,
                transform: "translateX(0)",
                transition: prefersReduced ? "none" : "opacity 0.5s ease, transform 0.5s ease",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 600,
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#561d70",
                  marginBottom: "12px",
                }}
              >
                NEAREST PROPERTY
              </p>

              <h3
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 500,
                  fontSize: "1.8rem",
                  color: "#2d1b3d",
                  marginBottom: "4px",
                }}
              >
                {result.property.name}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "15px",
                  color: "#8a6a9a",
                  marginBottom: "24px",
                }}
              >
                {result.property.location}
              </p>

              {/* Distance + directions */}
              <div
                style={{ display: "flex", gap: "24px", alignItems: "center", marginBottom: "20px" }}
              >
                <div>
                  <p
                    aria-label={`${result.distance.toFixed(1)} kilometres straight-line distance`}
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      fontWeight: 600,
                      fontSize: "2.2rem",
                      color: "#561d70",
                      lineHeight: 1,
                    }}
                  >
                    <span aria-hidden="true">{displayDist.toFixed(1)} km</span>
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "12px",
                      color: "#8a6a9a",
                      marginTop: "4px",
                    }}
                  >
                    straight-line distance
                  </p>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Get directions to ${result.property.name} (opens in Google Maps)`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#561d70",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "13px",
                    textDecoration: "none",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
                >
                  <MapPin size={14} aria-hidden="true" />
                  Get Directions →
                </a>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #e8d5f0", margin: "0 0 20px" }} />

              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "#5a4a6a",
                  marginBottom: "24px",
                }}
              >
                {result.property.address}
              </p>

              <div style={{ display: "flex", gap: "12px" }}>
                <Link
                  href={`/${result.property.id}`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "44px",
                    borderRadius: "8px",
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#561d70",
                    background: "white",
                    border: "1.5px solid #561d70",
                    textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f3eef7" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white" }}
                >
                  VIEW PROPERTY
                </Link>
                <Link
                  href={`/${result.property.id}#booking`}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "44px",
                    borderRadius: "8px",
                    fontFamily: "var(--font-inter)",
                    fontWeight: 500,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "white",
                    background: "#561d70",
                    textDecoration: "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
                >
                  BOOK NOW
                </Link>
              </div>
            </div>
          ) : (
            /* Placeholder card when no result yet */
            <div
              aria-hidden="true"
              style={{
                borderRadius: "16px",
                border: "2px dashed rgba(255,255,255,0.15)",
                height: "320px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.2rem",
                fontWeight: 300,
                color: "rgba(255,255,255,0.3)",
                fontStyle: "italic",
                textAlign: "center",
                padding: "20px",
              }}>
                Your nearest Astra<br />will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stack vertically at small screens */}
      <style>{`
        @media (max-width: 767px) {
          #locations > div[style] {
            flex-direction: column !important;
            gap: 48px !important;
          }
          #locations > div[style] > div:first-child,
          #locations > div[style] > div:last-child {
            flex: none !important;
            width: 100% !important;
          }
          #locations {
            padding: 60px 20px !important;
          }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          #locations {
            padding: 80px 32px !important;
          }
        }
      `}</style>
    </section>
  )
}
