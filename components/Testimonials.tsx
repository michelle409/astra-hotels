"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"

const TESTIMONIALS = [
  {
    quote:
      "Excellent location and spotless rooms. The Zaffran restaurant is a highlight — authentic North-West Frontier cuisine right at the hotel.",
    name: "Rajesh M.",
    role: "Business Traveler",
    stars: 5,
  },
  {
    quote:
      "Perfect for family stays. The Family Room gave us all the space we needed. The staff went above and beyond to make us comfortable.",
    name: "Priya K.",
    role: "Family Guest",
    stars: 5,
  },
  {
    quote:
      "Best hotel near Whitefield. Clean, comfortable, and the staff is incredibly responsive. Will absolutely stay again on my next Bangalore trip.",
    name: "Anand S.",
    role: "Tech Professional",
    stars: 5,
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div aria-label={`${count} out of 5 stars`} style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ color: "#c9a84c", fontSize: "24px" }}>★</span>
      ))}
    </div>
  )
}

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const sectionRef = useRef<HTMLElement>(null)

  const advance = useCallback(() => {
    setCurrent((c) => (c + 1) % TESTIMONIALS.length)
  }, [])

  // Respect prefers-reduced-motion: start paused if user prefers reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) setPaused(true)
  }, [])

  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current)
    } else {
      intervalRef.current = setInterval(advance, 4500)
    }
    return () => clearInterval(intervalRef.current)
  }, [paused, advance])

  function handleFocus() { setPaused(true) }
  function handleBlur(e: React.FocusEvent) {
    if (!sectionRef.current?.contains(e.relatedTarget as Node)) setPaused(false)
  }

  const slide = TESTIMONIALS[current]

  return (
    <section
      ref={sectionRef}
      aria-label="Guest testimonials"
      aria-roledescription="carousel"
      className="section-padding"
      style={{
        backgroundColor: "white",
        paddingLeft: "48px",
        paddingRight: "48px",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        <p
          className="label-caps"
          style={{ color: "#561d70", marginBottom: "48px" }}
          aria-hidden="true"
        >
          WHAT OUR GUESTS SAY
        </p>

        {/* Decorative quote mark */}
        <span
          aria-hidden="true"
          style={{
            display: "block",
            fontFamily: "var(--font-cormorant)",
            fontSize: "120px",
            color: "#561d70",
            opacity: 0.15,
            lineHeight: 0.8,
            marginBottom: "24px",
          }}
        >
          &ldquo;
        </span>

        <div aria-live={paused ? "polite" : "off"} aria-atomic="true">
          <blockquote>
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 300,
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                fontStyle: "italic",
                lineHeight: 1.6,
                color: "#2d1b3d",
                marginBottom: "40px",
              }}
            >
              {slide.quote}
            </p>
            <footer>
              <Stars count={slide.stars} />
              <cite
                style={{
                  display: "block",
                  fontFamily: "var(--font-inter)",
                  fontWeight: 500,
                  fontSize: "15px",
                  color: "#561d70",
                  marginTop: "24px",
                  fontStyle: "normal",
                }}
              >
                — {slide.name},{" "}
                <span style={{ color: "#8a6a9a", fontWeight: 300 }}>{slide.role}</span>
              </cite>
            </footer>
          </blockquote>
        </div>

        {/* Navigation controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          <button
            onClick={() => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            aria-label="Previous testimonial"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #e8d5f0",
              background: "white",
              color: "#561d70",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#561d70"
              e.currentTarget.style.background = "#f3eef7"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8d5f0"
              e.currentTarget.style.background = "white"
            }}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Dots — navigation buttons, not tabs */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }} aria-label="Testimonial navigation">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                aria-label={`Go to testimonial ${i + 1} by ${t.name}`}
                aria-current={i === current ? "true" : undefined}
                onClick={() => setCurrent(i)}
                style={{
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s",
                  width: i === current ? "10px" : "8px",
                  height: i === current ? "10px" : "8px",
                  backgroundColor: i === current ? "#561d70" : "#e8d5f0",
                }}
                onMouseEnter={(e) => {
                  if (i !== current) e.currentTarget.style.backgroundColor = "#c084c8"
                }}
                onMouseLeave={(e) => {
                  if (i !== current) e.currentTarget.style.backgroundColor = "#e8d5f0"
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((c) => (c + 1) % TESTIMONIALS.length)}
            aria-label="Next testimonial"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #e8d5f0",
              background: "white",
              color: "#561d70",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#561d70"
              e.currentTarget.style.background = "#f3eef7"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8d5f0"
              e.currentTarget.style.background = "white"
            }}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>

          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume testimonials slideshow" : "Pause testimonials slideshow"}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #e8d5f0",
              background: "white",
              color: "#561d70",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#561d70"
              e.currentTarget.style.background = "#f3eef7"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e8d5f0"
              e.currentTarget.style.background = "white"
            }}
          >
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  )
}
