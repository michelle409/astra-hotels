"use client"

import { useEffect, useRef, useState } from "react"

const STATS = [
  { value: 8, suffix: "", label: "Properties" },
  { value: 400, suffix: "+", label: "Rooms Across Bangalore" },
  { value: 50000, suffix: "+", label: "Happy Guests" },
  { value: 4.6, suffix: "★", label: "Average Rating" },
]

function StatCounter({ stat, trigger }: { stat: typeof STATS[0]; trigger: boolean }) {
  const [display, setDisplay] = useState(0)
  const animRef = useRef<number>(0)
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mq.matches)
  }, [])

  useEffect(() => {
    if (!trigger) return

    if (prefersReduced) {
      setDisplay(stat.value)
      return
    }

    const start = performance.now()
    const duration = 2000
    const target = stat.value

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      const current = target < 100
        ? parseFloat((ease * target).toFixed(1))
        : Math.round(ease * target)
      setDisplay(current)
      if (progress < 1) {
        animRef.current = requestAnimationFrame(step)
      } else {
        setDisplay(target)
      }
    }

    animRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animRef.current)
  }, [trigger, stat.value, prefersReduced])

  return (
    <div className="text-center">
      <p
        aria-label={`${stat.value}${stat.suffix} ${stat.label}`}
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          fontWeight: 300,
          color: "white",
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true">
          {display}
          {stat.suffix}
        </span>
      </p>
      <p
        style={{
          fontFamily: "var(--font-inter)",
          fontWeight: 300,
          fontSize: "13px",
          color: "rgba(255,255,255,0.65)",
          marginTop: "0.5rem",
          letterSpacing: "0.08em",
        }}
        aria-hidden="true"
      >
        {stat.label}
      </p>
    </div>
  )
}

export function VideoAmbiance() {
  const sectionRef = useRef<HTMLElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ambiance-heading"
      className="relative overflow-hidden dark-bg"
      style={{ minHeight: "500px" }}
    >
      {/* Background video */}
      <video
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        poster="/media/properties/hotel-room-stock.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/media/videos/room-video.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "rgba(26,10,36,0.65)", zIndex: 1 }}
      />

      <div
        className="relative flex flex-col items-center justify-center py-24 px-6 text-center"
        style={{ zIndex: 2 }}
      >
        <h2
          id="ambiance-heading"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 300,
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            color: "white",
            fontStyle: "italic",
            marginBottom: "1rem",
          }}
        >
          Experience Astra
        </h2>
        <p
          style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 300,
            fontSize: "18px",
            color: "rgba(255,255,255,0.7)",
            maxWidth: "480px",
            lineHeight: 1.6,
            marginBottom: "4rem",
          }}
        >
          Where every detail is designed for your comfort.
        </p>

        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-10 w-full max-w-3xl"
          aria-label="Astra Hotels statistics"
        >
          {STATS.map((stat) => (
            <StatCounter key={stat.label} stat={stat} trigger={triggered} />
          ))}
        </div>
      </div>
    </section>
  )
}
