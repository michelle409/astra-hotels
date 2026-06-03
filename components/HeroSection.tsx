"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const labelRef = useRef<HTMLParagraphElement>(null)
  const charsRef = useRef<HTMLSpanElement[]>([])
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const ctasRef = useRef<HTMLDivElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  const headline = "Where Every Stay Feels Like Home."

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      // Static visibility — just show everything immediately
      if (labelRef.current) labelRef.current.style.opacity = "1"
      charsRef.current.forEach((c) => {
        if (c) { c.style.opacity = "1"; c.style.transform = "translateY(0)" }
      })
      if (subtextRef.current) subtextRef.current.style.opacity = "1"
      if (ctasRef.current) ctasRef.current.style.opacity = "1"
      return
    }

    // Entrance animations
    const timers: ReturnType<typeof setTimeout>[] = []

    // Label slides up
    timers.push(setTimeout(() => {
      if (labelRef.current) {
        labelRef.current.style.transition = "opacity 0.6s ease, transform 0.6s ease"
        labelRef.current.style.opacity = "1"
        labelRef.current.style.transform = "translateY(0)"
      }
    }, 300))

    // Chars stagger
    charsRef.current.forEach((span, i) => {
      if (!span) return
      timers.push(setTimeout(() => {
        span.style.transition = "opacity 0.4s ease, transform 0.4s ease"
        span.style.opacity = "1"
        span.style.transform = "translateY(0)"
      }, 500 + i * 25))
    })

    // Subtext
    timers.push(setTimeout(() => {
      if (subtextRef.current) {
        subtextRef.current.style.transition = "opacity 0.8s ease"
        subtextRef.current.style.opacity = "1"
      }
    }, 1200))

    // CTAs
    timers.push(setTimeout(() => {
      if (ctasRef.current) {
        ctasRef.current.style.transition = "opacity 0.6s ease, transform 0.6s ease"
        ctasRef.current.style.opacity = "1"
        ctasRef.current.style.transform = "translateY(0)"
      }
    }, 1400))

    return () => timers.forEach(clearTimeout)
  }, [reducedMotion])

  return (
    <section
      aria-label="Astra Hotels & Suites — hero"
      className="relative w-full overflow-hidden dark-bg"
      style={{ height: "100dvh", minHeight: "600px" }}
    >
      {/* Background video — decorative, no audio */}
      <video
        aria-hidden="true"
        autoPlay={!reducedMotion}
        muted
        loop={!reducedMotion}
        playsInline
        poster="/media/properties/hotel-exterior.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/media/videos/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(26,10,36,0.9) 0%, rgba(86,29,112,0.45) 50%, rgba(0,0,0,0.25) 100%)",
          zIndex: 1,
        }}
      />

      {/* Particle dots — CSS only, decorative */}
      <div aria-hidden="true" className="absolute inset-0" style={{ zIndex: 1 }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-float"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 7 + 5) % 95}%`,
              top: `${(i * 13 + 10) % 85}%`,
              opacity: 0.12 + (i % 4) * 0.06,
              animationDelay: `${(i * 0.3) % 2}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className="relative flex flex-col items-center justify-center h-full px-6 text-center"
        style={{ zIndex: 2, maxWidth: "900px", margin: "0 auto" }}
      >
        {/* Property count label */}
        <p
          ref={labelRef}
          className="label-caps mb-6"
          style={{
            color: "#c084c8",
            fontSize: "11px",
            letterSpacing: "0.25em",
            opacity: reducedMotion ? 1 : 0,
            transform: reducedMotion ? "none" : "translateY(16px)",
          }}
        >
          8 PREMIUM PROPERTIES ACROSS BANGALORE
        </p>

        {/* Headline — aria-label provides clean text for screen readers */}
        <h1
          aria-label="Where Every Stay Feels Like Home."
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(2rem, 7vw, 7rem)",
            fontWeight: 300,
            lineHeight: 1.05,
            color: "white",
          }}
        >
          {/* aria-hidden span — words wrapped to prevent mid-word line breaks */}
          <span aria-hidden="true">
            {(() => {
              const words = headline.split(" ")
              let ci = 0
              const nodes: React.ReactNode[] = []
              words.forEach((word, wi) => {
                nodes.push(
                  <span key={`w${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                    {word.split("").map((char) => {
                      const idx = ci++
                      return (
                        <span
                          key={idx}
                          ref={(el) => { charsRef.current[idx] = el! }}
                          style={{
                            display: "inline-block",
                            opacity: reducedMotion ? 1 : 0,
                            transform: reducedMotion ? "none" : "translateY(20px)",
                          }}
                        >
                          {char}
                        </span>
                      )
                    })}
                  </span>
                )
                if (wi < words.length - 1) {
                  const idx = ci++
                  nodes.push(
                    <span
                      key={`s${wi}`}
                      ref={(el) => { charsRef.current[idx] = el! }}
                      style={{
                        display: "inline-block",
                        opacity: reducedMotion ? 1 : 0,
                        transform: reducedMotion ? "none" : "translateY(20px)",
                        whiteSpace: "pre",
                      }}
                    >
                      {" "}
                    </span>
                  )
                }
              })
              return nodes
            })()}
          </span>
        </h1>

        {/* Subtext */}
        <p
          ref={subtextRef}
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "18px",
            fontWeight: 300,
            color: "rgba(255,255,255,0.75)",
            marginTop: "1.5rem",
            maxWidth: "560px",
            lineHeight: 1.6,
            opacity: reducedMotion ? 1 : 0,
          }}
        >
          Premium comfort across Electronic City, HSR Layout, Koramangala, Marathahalli, and beyond.
        </p>

        {/* CTAs */}
        <div
          ref={ctasRef}
          className="flex gap-4 mt-10 flex-wrap justify-center"
          style={{
            opacity: reducedMotion ? 1 : 0,
            transform: reducedMotion ? "none" : "translateY(20px)",
          }}
        >
          <Link
            href="/#properties"
            className="inline-flex items-center justify-center text-white text-[14px] font-medium tracking-widest uppercase rounded-md transition-all duration-300 hover:bg-[#7b3fa0] hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#c9a84c]"
            style={{
              fontFamily: "var(--font-inter)",
              backgroundColor: "#561d70",
              height: "48px",
              padding: "0 24px",
            }}
          >
            EXPLORE PROPERTIES
          </Link>

          <Link
            href="/#booking"
            className="inline-flex items-center justify-center text-white text-[14px] font-medium tracking-widest uppercase rounded-md transition-all duration-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#c9a84c]"
            style={{
              fontFamily: "var(--font-inter)",
              border: "1.5px solid rgba(255,255,255,0.8)",
              height: "48px",
              padding: "0 24px",
            }}
          >
            BOOK YOUR STAY
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#properties"
        aria-label="Scroll to Our Properties section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float"
        style={{ zIndex: 2, color: "#c084c8" }}
      >
        <ChevronDown size={32} aria-hidden="true" />
      </a>
    </section>
  )
}
