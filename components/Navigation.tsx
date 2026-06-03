"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { PROPERTIES } from "@/lib/data"

const MEGA_COLS = [
  {
    groups: [
      { area: "Electronic City", id: "ec", branches: [{ id: "electronic-city", label: "Astra Hotels & Suites" }] },
      { area: "Kadubeesanahalli", id: "kadu", branches: [{ id: "kadubeesanahalli", label: "Astra Hotels and Suites" }] },
    ],
  },
  {
    groups: [
      { area: "HSR Layout", id: "hsr", branches: [
        { id: "hsr-sector-1", label: "Sector 1" },
        { id: "hsr-sector-7", label: "Sector 7" },
      ]},
    ],
  },
  {
    groups: [
      { area: "Koramangala", id: "kora", branches: [{ id: "koramangala", label: "Astra Hotels & Suites" }] },
      { area: "Sarjapur", id: "sarja", branches: [{ id: "sarjapur", label: "Astra Hotels & Suites" }] },
    ],
  },
  {
    groups: [
      { area: "Marathahalli", id: "mara", branches: [{ id: "marathahalli", label: "Spice Garden Layout" }] },
      { area: "Whitefield", id: "white", branches: [{ id: "whitefield", label: "Astra Hotels & Suites" }] },
    ],
  },
]

const today = new Date().toISOString().split("T")[0]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quickProperty, setQuickProperty] = useState("")
  const [quickCheckIn, setQuickCheckIn] = useState("")
  const [quickCheckOut, setQuickCheckOut] = useState("")
  const [shakeField, setShakeField] = useState<string | null>(null)

  const megaLiRef = useRef<HTMLLIElement>(null)
  const megaPanelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)
  const mobileOverlayRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (megaOpen) { setMegaOpen(false); triggerRef.current?.focus() }
        if (mobileOpen) closeMobile()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [megaOpen, mobileOpen])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      setTimeout(() => firstMobileLinkRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  useEffect(() => {
    if (megaOpen) setTimeout(() => firstLinkRef.current?.focus(), 50)
  }, [megaOpen])

  function openMega() {
    clearTimeout(closeTimerRef.current)
    setMegaOpen(true)
  }

  function scheduleMegaClose() {
    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = setTimeout(() => setMegaOpen(false), 200)
  }

  function closeMobile() {
    setMobileOpen(false)
    setTimeout(() => hamburgerRef.current?.focus(), 50)
  }

  function handleMobileKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "Tab" || !mobileOverlayRef.current) return
    const focusable = Array.from(
      mobileOverlayRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  function triggerShake(field: string) {
    setShakeField(null)
    requestAnimationFrame(() => setShakeField(field))
  }

  function handleQuickBook(e: React.FormEvent) {
    e.preventDefault()
    if (!quickProperty) { triggerShake("property"); return }
    if (!quickCheckIn) { triggerShake("checkin"); return }
    if (!quickCheckOut) { triggerShake("checkout"); return }
    const params = new URLSearchParams()
    params.set("checkIn", quickCheckIn)
    params.set("checkOut", quickCheckOut)
    setMegaOpen(false)
    router.push(`/${quickProperty}?${params.toString()}#booking`)
  }

  const navTextColor = scrolled ? "#2d1b3d" : "white"

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          @keyframes megaFadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .mega-panel-enter {
            animation: megaFadeIn 0.25s ease both;
          }
        }
      `}</style>

      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
        )}
        style={{
          height: "72px",
          backgroundColor: scrolled ? "white" : "transparent",
          boxShadow: scrolled ? "0 2px 20px rgba(86,29,112,0.08)" : "none",
        }}
      >
        <div
          className="h-full flex items-center justify-between"
          style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 48px" }}
        >
          {/* Logo */}
          <Link href="/" aria-label="Astra Hotels & Suites — Home">
            <Image
              src="/media/astra-logo.png"
              alt=""
              width={140}
              height={48}
              style={{ objectFit: "contain", height: "auto" }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:flex">
            <ul className="flex items-center gap-10 list-none" role="list">

              {/* Hotels — hover + click trigger */}
              <li
                ref={megaLiRef}
                className="relative"
                onMouseEnter={openMega}
                onMouseLeave={scheduleMegaClose}
              >
                <button
                  ref={triggerRef}
                  aria-expanded={megaOpen}
                  aria-controls="mega-menu"
                  aria-haspopup="true"
                  onClick={() => megaOpen ? setMegaOpen(false) : openMega()}
                  onFocus={openMega}
                  onBlur={(e) => {
                    if (
                      !megaPanelRef.current?.contains(e.relatedTarget as Node) &&
                      !megaLiRef.current?.contains(e.relatedTarget as Node)
                    ) {
                      scheduleMegaClose()
                    }
                  }}
                  className="flex items-center gap-1.5 transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: megaOpen ? "#561d70" : navTextColor,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Hotels
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn("transition-transform duration-200", megaOpen && "rotate-180")}
                  />
                </button>
              </li>

              {(["About", "Locations", "Dining", "Contact"] as const).map(label => (
                <li key={label}>
                  <Link
                    href={`/#${label.toLowerCase()}`}
                    className="transition-colors duration-200 hover:text-[#561d70]"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "13px",
                      fontWeight: 500,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: navTextColor,
                      textDecoration: "none",
                    }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Book Now */}
          <div className="hidden md:block">
            <Link
              href="/#booking"
              className="inline-flex items-center transition-all duration-200"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "white",
                backgroundColor: "#561d70",
                padding: "12px 28px",
                borderRadius: "6px",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#7b3fa0"
                e.currentTarget.style.transform = "scale(1.02)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#561d70"
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              BOOK NOW
            </Link>
          </div>

          {/* Hamburger */}
          <button
            ref={hamburgerRef}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-overlay"
            onClick={() => mobileOpen ? closeMobile() : setMobileOpen(true)}
            className="md:hidden p-2 rounded-md"
            style={{ color: scrolled ? "#2d1b3d" : "white" }}
          >
            {mobileOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* MEGA MENU */}
      <div
        ref={megaPanelRef}
        id="mega-menu"
        className={megaOpen ? "mega-panel-enter" : ""}
        onMouseEnter={openMega}
        onMouseLeave={scheduleMegaClose}
        onBlur={(e) => {
          if (
            !megaPanelRef.current?.contains(e.relatedTarget as Node) &&
            !megaLiRef.current?.contains(e.relatedTarget as Node)
          ) {
            scheduleMegaClose()
          }
        }}
        style={{
          display: megaOpen ? "block" : "none",
          position: "fixed",
          top: "72px",
          left: 0,
          right: 0,
          zIndex: 999,
          background: "white",
          borderTop: "2px solid #561d70",
          boxShadow: "0 20px 60px rgba(86,29,112,0.12)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "48px 48px 0",
          }}
        >
          {/* 5-column grid: 4 location cols + quick book */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 280px",
              gap: "0 40px",
              alignItems: "start",
            }}
          >
            {/* Location columns */}
            {MEGA_COLS.map((col, ci) => (
              <div key={ci}>
                {col.groups.map((group, gi) => (
                  <div key={group.id} style={{ marginBottom: gi < col.groups.length - 1 ? "32px" : 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontWeight: 700,
                        fontSize: "10px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "#561d70",
                        paddingBottom: "10px",
                        borderBottom: "2px solid #561d70",
                        marginBottom: "12px",
                      }}
                    >
                      {group.area}
                    </span>
                    <ul className="list-none" role="list">
                      {group.branches.map((b, bi) => (
                        <li key={b.id}>
                          <Link
                            ref={ci === 0 && gi === 0 && bi === 0 ? firstLinkRef : undefined}
                            href={`/${b.id}`}
                            onClick={() => setMegaOpen(false)}
                            style={{
                              display: "block",
                              fontFamily: "var(--font-inter)",
                              fontWeight: 400,
                              fontSize: "15px",
                              color: "#2d1b3d",
                              textDecoration: "none",
                              padding: "10px 12px",
                              borderRadius: "6px",
                              transition: "background 0.18s ease, color 0.18s ease, padding-left 0.18s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f3eef7"
                              e.currentTarget.style.color = "#561d70"
                              e.currentTarget.style.paddingLeft = "20px"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent"
                              e.currentTarget.style.color = "#2d1b3d"
                              e.currentTarget.style.paddingLeft = "12px"
                            }}
                          >
                            {b.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}

            {/* Quick Book column */}
            <div style={{ paddingLeft: "40px", borderLeft: "1px solid #e8d5f0" }}>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 700,
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#561d70",
                  marginBottom: "20px",
                }}
              >
                QUICK BOOK
              </p>

              <form onSubmit={handleQuickBook} aria-label="Quick booking form" noValidate>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="mega-property"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontWeight: 500,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#561d70",
                      marginBottom: "6px",
                    }}
                  >
                    Property
                  </label>
                  <select
                    id="mega-property"
                    value={quickProperty}
                    onChange={e => { setQuickProperty(e.target.value); setShakeField(null) }}
                    aria-required="true"
                    className={cn("form-field", shakeField === "property" && "shake")}
                    style={{ height: "44px", padding: "0 16px" }}
                  >
                    <option value="" disabled>Select property</option>
                    {PROPERTIES.map(p => (
                      <option key={p.id} value={p.id}>{p.area}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="mega-checkin"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontWeight: 500,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#561d70",
                      marginBottom: "6px",
                    }}
                  >
                    Check-in
                  </label>
                  <input
                    id="mega-checkin"
                    type="date"
                    min={today}
                    value={quickCheckIn}
                    onChange={e => { setQuickCheckIn(e.target.value); setShakeField(null) }}
                    aria-required="true"
                    className={cn("form-field", shakeField === "checkin" && "shake")}
                    style={{ height: "44px" }}
                  />
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label
                    htmlFor="mega-checkout"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontWeight: 500,
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#561d70",
                      marginBottom: "6px",
                    }}
                  >
                    Check-out
                  </label>
                  <input
                    id="mega-checkout"
                    type="date"
                    min={quickCheckIn || today}
                    value={quickCheckOut}
                    onChange={e => { setQuickCheckOut(e.target.value); setShakeField(null) }}
                    aria-required="true"
                    className={cn("form-field", shakeField === "checkout" && "shake")}
                    style={{ height: "44px" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: "44px",
                    background: "#561d70",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontFamily: "var(--font-inter)",
                    fontWeight: 600,
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    marginTop: "8px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#7b3fa0" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#561d70" }}
                >
                  CHECK AVAILABILITY
                </button>
              </form>
            </div>
          </div>

          {/* Bottom strip */}
          <div
            style={{
              borderTop: "1px solid #f0e8f7",
              marginTop: "32px",
              paddingTop: "20px",
              paddingBottom: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Link
              href="/#properties"
              onClick={() => setMegaOpen(false)}
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 400,
                fontSize: "13px",
                color: "#561d70",
                textDecoration: "none",
              }}
            >
              Explore all 8 properties →
            </Link>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 300,
                fontSize: "12px",
                color: "#8a6a9a",
              }}
            >
              8 properties · Bangalore
            </span>
          </div>
        </div>
      </div>

      {/* Mobile overlay with focus trap */}
      {mobileOpen && (
        <div
          ref={mobileOverlayRef}
          id="mobile-nav-overlay"
          role="dialog"
          aria-label="Navigation menu"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex flex-col dark-bg"
          style={{ backgroundColor: "#561d70" }}
          onKeyDown={handleMobileKeyDown}
        >
          <div className="flex justify-end p-6">
            <button onClick={closeMobile} aria-label="Close navigation menu" className="p-2 text-white rounded-md">
              <X size={28} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="flex-1 flex flex-col justify-center px-10 overflow-y-auto">
            <ul className="flex flex-col gap-5 list-none" role="list">
              <li>
                <Link
                  ref={firstMobileLinkRef}
                  href="/"
                  onClick={closeMobile}
                  className="block text-white hover:text-[#c084c8] transition-colors"
                  style={{ fontFamily: "var(--font-cormorant)", fontSize: "2rem", fontWeight: 300 }}
                >
                  Home
                </Link>
              </li>
              {PROPERTIES.map(p => (
                <li key={p.id}>
                  <Link
                    href={`/${p.id}`}
                    onClick={closeMobile}
                    className="block text-white hover:text-[#c084c8] transition-colors"
                    style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.5rem", fontWeight: 300 }}
                  >
                    {p.area}
                  </Link>
                </li>
              ))}
              <li className="mt-4">
                <Link
                  href="/#booking"
                  onClick={closeMobile}
                  className="inline-flex items-center px-8 py-3 rounded-md text-sm font-medium text-[#561d70] bg-white"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  BOOK NOW
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  )
}
