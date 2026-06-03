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
    <span aria-label={`${count} out of 5 stars`} className="flex gap-1 justify-center">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} aria-hidden="true" style={{ color: "#c9a84c", fontSize: "22px" }}>
          ★
        </span>
      ))}
    </span>
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

  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current)
    } else {
      intervalRef.current = setInterval(advance, 4500)
    }
    return () => clearInterval(intervalRef.current)
  }, [paused, advance])

  // Pause on focus inside carousel
  function handleFocus() { setPaused(true) }
  function handleBlur(e: React.FocusEvent) {
    if (!sectionRef.current?.contains(e.relatedTarget as Node)) {
      setPaused(false)
    }
  }

  const slide = TESTIMONIALS[current]

  return (
    <section
      ref={sectionRef}
      aria-label="Guest testimonials"
      aria-roledescription="carousel"
      className="py-28 px-6"
      style={{ backgroundColor: "var(--off-white)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="max-w-3xl mx-auto text-center">
        <p
          className="label-caps mb-8"
          style={{ color: "#561d70" }}
          aria-hidden="true"
        >
          WHAT OUR GUESTS SAY
        </p>

        {/* Live region — polite when paused, off when auto-scrolling (WCAG carousel pattern) */}
        <div
          aria-live={paused ? "polite" : "off"}
          aria-atomic="true"
        >
          <blockquote aria-roledescription="slide">
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 300,
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                color: "#2d1b3d",
                fontStyle: "italic",
                lineHeight: 1.5,
                marginBottom: "1.5rem",
                transition: "opacity 0.5s ease",
              }}
            >
              &ldquo;{slide.quote}&rdquo;
            </p>
            <footer>
              <Stars count={slide.stars} />
              <cite
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 400,
                  fontSize: "15px",
                  color: "#561d70",
                  display: "block",
                  marginTop: "1rem",
                  fontStyle: "normal",
                }}
              >
                — {slide.name}, <span style={{ color: "#8a6a9a" }}>{slide.role}</span>
              </cite>
            </footer>
          </blockquote>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
            aria-label="Previous testimonial"
            className="p-2 rounded-full border border-[#e8d5f0] text-[#561d70] hover:bg-[#f3eef7] transition-colors"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2" role="tablist" aria-label="Testimonial navigation">
            {TESTIMONIALS.map((t, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to testimonial ${i + 1} by ${t.name}`}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  backgroundColor: i === current ? "#561d70" : "#e8d5f0",
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((c) => (c + 1) % TESTIMONIALS.length)}
            aria-label="Next testimonial"
            className="p-2 rounded-full border border-[#e8d5f0] text-[#561d70] hover:bg-[#f3eef7] transition-colors"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>

          <button
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume testimonials slideshow" : "Pause testimonials slideshow"}
            className="p-2 rounded-full border border-[#e8d5f0] text-[#561d70] hover:bg-[#f3eef7] transition-colors ml-2"
          >
            {paused ? (
              <Play size={16} aria-hidden="true" />
            ) : (
              <Pause size={16} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
