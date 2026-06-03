"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { PROPERTIES } from "@/lib/data"

const COLS = [
  [
    { area: "Electronic City", id: "electronic-city", branches: [{ id: "electronic-city", label: "Astra Hotels & Suites" }] },
    { area: "HSR Layout", id: "hsr-layout", branches: [
      { id: "hsr-sector-1", label: "HSR Sector 1" },
      { id: "hsr-sector-7", label: "HSR Sector 7" },
    ]},
    { area: "Kadubeesanahalli", id: "kadubeesanahalli", branches: [{ id: "kadubeesanahalli", label: "Astra Hotels and Suites" }] },
    { area: "Koramangala", id: "koramangala", branches: [{ id: "koramangala", label: "Astra Hotels & Suites" }] },
  ],
  [
    { area: "Marathahalli", id: "marathahalli", branches: [{ id: "marathahalli", label: "Spice Garden Layout" }] },
    { area: "Sarjapur", id: "sarjapur", branches: [{ id: "sarjapur", label: "Astra Hotels & Suites" }] },
    { area: "Whitefield", id: "whitefield", branches: [{ id: "whitefield", label: "Astra Hotels & Suites" }] },
  ],
]

const today = new Date().toISOString().split("T")[0]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quickProperty, setQuickProperty] = useState("")
  const [quickCheckIn, setQuickCheckIn] = useState("")
  const [quickCheckOut, setQuickCheckOut] = useState("")
  const megaRef = useRef<HTMLLIElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close mega on outside click
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [])

  // Keyboard handlers
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

  // Mobile overlay focus management
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      setTimeout(() => firstMobileLinkRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  // Move focus into mega on open
  useEffect(() => {
    if (megaOpen) setTimeout(() => firstLinkRef.current?.focus(), 50)
  }, [megaOpen])

  function closeMobile() {
    setMobileOpen(false)
    setTimeout(() => hamburgerRef.current?.focus(), 50)
  }

  function handleQuickBook(e: React.FormEvent) {
    e.preventDefault()
    if (!quickProperty) return
    const params = new URLSearchParams()
    if (quickCheckIn) params.set("checkIn", quickCheckIn)
    if (quickCheckOut) params.set("checkOut", quickCheckOut)
    setMegaOpen(false)
    router.push(`/${quickProperty}${params.toString() ? "?" + params.toString() : ""}#booking`)
  }

  const navTextColor = scrolled ? "#2d1b3d" : "white"
  const navHoverStyle = "hover:text-[#c084c8] relative after:absolute after:bottom-[-3px] after:left-0 after:h-[1.5px] after:w-0 after:bg-[#c084c8] after:transition-all after:duration-200 hover:after:w-full"

  return (
    <>
      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-[70px] transition-all duration-300",
          scrolled ? "bg-white shadow-[0_2px_20px_rgba(86,29,112,0.12)]" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" aria-label="Astra Hotels & Suites — Home">
            <Image
              src="/media/astra-logo.png"
              alt="Astra Hotels & Suites"
              width={140}
              height={48}
              style={{ objectFit: "contain", height: "auto" }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden md:block">
            <ul className="flex items-center gap-8 list-none" role="list">
              <li ref={megaRef} className="relative">
                <button
                  ref={triggerRef}
                  aria-expanded={megaOpen}
                  aria-controls="mega-menu"
                  aria-haspopup="true"
                  onClick={() => setMegaOpen(v => !v)}
                  className={cn(
                    "flex items-center gap-1 text-[13px] font-medium tracking-wider uppercase transition-colors duration-200",
                    navHoverStyle
                  )}
                  style={{ color: navTextColor, fontFamily: "var(--font-inter)" }}
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
                    className={cn("text-[13px] font-medium tracking-wider uppercase transition-colors duration-200", navHoverStyle)}
                    style={{ color: navTextColor, fontFamily: "var(--font-inter)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden md:block">
            <Link
              href="/#booking"
              className="inline-flex items-center px-6 py-[10px] rounded-md text-[14px] font-medium text-white transition-all duration-250 hover:scale-[1.02] hover:bg-[#7b3fa0]"
              style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
            >
              BOOK NOW
            </Link>
          </div>

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

      {/* ── MEGA MENU ── */}
      <div
        id="mega-menu"
        hidden={!megaOpen}
        style={{
          display: megaOpen ? "block" : "none",
          position: "fixed",
          top: "70px",
          left: 0,
          right: 0,
          zIndex: 49,
          background: "white",
          borderBottom: "1px solid #e8d5f0",
          boxShadow: "0 20px 60px rgba(86,29,112,0.15)",
          animation: megaOpen ? "megaFadeIn 0.3s ease both" : undefined,
        }}
      >
        <style>{`
          @keyframes megaFadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-10 py-10 flex gap-8">
          {/* Location columns — 80% width */}
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-8 mb-8">
              {/* Row 1 — 4 columns */}
              {COLS[0].map((loc, i) => (
                <LocationColumn
                  key={loc.id}
                  loc={loc}
                  linkRef={i === 0 ? firstLinkRef : undefined}
                  onNavigate={() => setMegaOpen(false)}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-8">
              {/* Row 2 — 3 columns */}
              {COLS[1].map(loc => (
                <LocationColumn
                  key={loc.id}
                  loc={loc}
                  onNavigate={() => setMegaOpen(false)}
                />
              ))}
            </div>

            {/* Bottom link */}
            <div className="mt-8 pt-5 border-t border-[#e8d5f0]">
              <Link
                href="/#properties"
                onClick={() => setMegaOpen(false)}
                className="inline-flex items-center gap-2 text-[13px] text-[#561d70] hover:text-[#7b3fa0] transition-colors"
                style={{ fontFamily: "var(--font-inter)", fontWeight: 300 }}
              >
                Explore all 8 properties across Bangalore
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right panel — quick book, ~20% width */}
          <div className="w-64 flex-shrink-0 pl-8 border-l border-[#e8d5f0]">
            <p
              className="label-caps mb-5"
              style={{ color: "#561d70", fontSize: "11px" }}
            >
              QUICK BOOK
            </p>
            <form onSubmit={handleQuickBook} aria-label="Quick booking form">
              <div className="flex flex-col gap-3">
                <div>
                  <label
                    htmlFor="mega-property"
                    className="block text-[11px] font-medium mb-1 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a" }}
                  >
                    Property
                  </label>
                  <select
                    id="mega-property"
                    value={quickProperty}
                    onChange={e => setQuickProperty(e.target.value)}
                    className="form-field text-[13px] py-2"
                    style={{ fontSize: "13px" }}
                  >
                    <option value="">Select property</option>
                    {PROPERTIES.map(p => (
                      <option key={p.id} value={p.id}>{p.area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="mega-checkin"
                    className="block text-[11px] font-medium mb-1 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a" }}
                  >
                    Check-in
                  </label>
                  <input
                    id="mega-checkin"
                    type="date"
                    min={today}
                    value={quickCheckIn}
                    onChange={e => setQuickCheckIn(e.target.value)}
                    className="form-field text-[13px] py-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mega-checkout"
                    className="block text-[11px] font-medium mb-1 uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-inter)", color: "#5a4a6a" }}
                  >
                    Check-out
                  </label>
                  <input
                    id="mega-checkout"
                    type="date"
                    min={quickCheckIn || today}
                    value={quickCheckOut}
                    onChange={e => setQuickCheckOut(e.target.value)}
                    className="form-field text-[13px] py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-md text-white text-[13px] font-medium transition-all duration-200 hover:bg-[#7b3fa0] mt-1"
                  style={{ fontFamily: "var(--font-inter)", backgroundColor: "#561d70" }}
                >
                  CHECK AVAILABILITY
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          id="mobile-nav-overlay"
          role="dialog"
          aria-label="Navigation menu"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex flex-col dark-bg"
          style={{ backgroundColor: "#561d70" }}
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

type ColProps = {
  loc: { area: string; id: string; branches: { id: string; label: string }[] }
  linkRef?: React.Ref<HTMLAnchorElement>
  onNavigate: () => void
}

function LocationColumn({ loc, linkRef, onNavigate }: ColProps) {
  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-3 pl-3"
        style={{
          fontFamily: "var(--font-inter)",
          color: "#561d70",
          borderLeft: "2px solid #561d70",
        }}
      >
        {loc.area}
      </p>
      <ul className="flex flex-col gap-1 list-none" role="list">
        {loc.branches.map((b, i) => (
          <li key={b.id}>
            <Link
              ref={i === 0 && linkRef ? linkRef : undefined}
              href={`/${b.id}`}
              onClick={onNavigate}
              className="group flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] transition-all duration-200 hover:bg-[#f3eef7] hover:text-[#561d70] hover:pl-6"
              style={{ fontFamily: "var(--font-inter)", color: "#2d1b3d" }}
            >
              {b.label}
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#561d70]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
