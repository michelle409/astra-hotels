"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const PROPERTY_GROUPS = [
  {
    area: "ELECTRONIC CITY",
    properties: [{ id: "electronic-city", label: "Astra Hotels & Suites, Electronic City" }],
  },
  {
    area: "HSR LAYOUT",
    properties: [
      { id: "hsr-sector-1", label: "Astra Hotels & Suites, HSR Sector 1" },
      { id: "hsr-sector-7", label: "Astra Hotels & Suites, HSR Sector 7" },
    ],
  },
  {
    area: "KADUBEESANAHALLI",
    properties: [{ id: "kadubeesanahalli", label: "Astra Hotels and Suites, Kadubeesanahalli" }],
  },
  {
    area: "KORAMANGALA",
    properties: [{ id: "koramangala", label: "Astra Hotels & Suites, Koramangala" }],
  },
  {
    area: "MARATHAHALLI",
    properties: [{ id: "marathahalli", label: "Astra Hotels & Suites, Spice Garden Layout" }],
  },
  {
    area: "SARJAPURA",
    properties: [{ id: "sarjapur", label: "Astra Hotels & Suites, Sarjapura" }],
  },
  {
    area: "WHITEFIELD",
    properties: [{ id: "whitefield", label: "Astra Hotels & Suites, Whitefield" }],
  },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const mobileOverlayRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const firstMobileLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [])

  // Escape key closes dropdown and mobile overlay
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (dropdownOpen) setDropdownOpen(false)
        if (mobileOpen) closeMobileMenu()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [dropdownOpen, mobileOpen])

  // Focus trap in mobile overlay
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
      firstMobileLinkRef.current?.focus()
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  function closeMobileMenu() {
    setMobileOpen(false)
    // Return focus to hamburger
    setTimeout(() => hamburgerRef.current?.focus(), 50)
  }

  return (
    <>
      <header
        role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-[70px] transition-all duration-300",
          scrolled
            ? "bg-white shadow-[0_2px_20px_rgba(86,29,112,0.12)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
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
              {/* Hotels dropdown */}
              <li ref={dropdownRef} className="relative">
                <button
                  aria-expanded={dropdownOpen}
                  aria-controls="hotels-dropdown"
                  aria-haspopup="true"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-1 text-[13px] font-medium tracking-wider uppercase transition-colors duration-200",
                    scrolled ? "text-[#2d1b3d]" : "text-white",
                    "hover:text-[#c084c8]"
                  )}
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  Hotels
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className={cn(
                      "transition-transform duration-200",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown panel */}
                <ul
                  id="hotels-dropdown"
                  role="list"
                  hidden={!dropdownOpen}
                  className={cn(
                    "absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-xl overflow-hidden shadow-2xl z-10",
                    "bg-[#561d70] text-white",
                    dropdownOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2",
                    "transition-all duration-200"
                  )}
                  style={{ display: dropdownOpen ? undefined : "none" }}
                >
                  {PROPERTY_GROUPS.map((group) => (
                    <li key={group.area}>
                      <p
                        className="px-4 pt-3 pb-1 text-[10px] font-medium tracking-[0.18em] text-[#c084c8]"
                        style={{ fontFamily: "var(--font-inter)" }}
                        aria-hidden="true"
                      >
                        {group.area}
                      </p>
                      <ul role="list">
                        {group.properties.map((p) => (
                          <li key={p.id}>
                            <Link
                              href={`/${p.id}`}
                              onClick={() => setDropdownOpen(false)}
                              className="block px-4 py-2 text-[13px] text-white hover:bg-[#7b3fa0] transition-colors duration-150"
                              style={{ fontFamily: "var(--font-inter)" }}
                            >
                              {p.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>

              {(["About", "Locations", "Dining", "Contact"] as const).map((label) => (
                <li key={label}>
                  <Link
                    href={`/#${label.toLowerCase()}`}
                    className={cn(
                      "text-[13px] font-medium tracking-wider uppercase transition-colors duration-200",
                      scrolled ? "text-[#2d1b3d]" : "text-white",
                      "hover:text-[#c084c8]"
                    )}
                    style={{ fontFamily: "var(--font-inter)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Book Now CTA */}
          <div className="hidden md:block">
            <Link
              href="/#booking"
              className="inline-flex items-center px-6 py-[10px] rounded-md text-[14px] font-medium text-white transition-all duration-300"
              style={{
                fontFamily: "var(--font-inter)",
                backgroundColor: "#561d70",
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

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-overlay"
            onClick={() => (mobileOpen ? closeMobileMenu() : setMobileOpen(true))}
            className="md:hidden p-2 rounded-md"
            style={{ color: scrolled ? "#2d1b3d" : "white" }}
          >
            {mobileOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      {mobileOpen && (
        <div
          id="mobile-nav-overlay"
          ref={mobileOverlayRef}
          role="dialog"
          aria-label="Navigation menu"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex flex-col dark-bg"
          style={{ backgroundColor: "#561d70" }}
        >
          {/* Close button inside overlay */}
          <div className="flex justify-end p-6">
            <button
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="p-2 text-white rounded-md"
            >
              <X size={28} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="flex-1 flex flex-col justify-center px-10">
            <ul className="flex flex-col gap-6 list-none" role="list">
              <li>
                <Link
                  ref={firstMobileLinkRef}
                  href="/"
                  onClick={closeMobileMenu}
                  className="block text-white hover:text-[#c084c8] transition-colors"
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontSize: "2rem",
                    fontWeight: 300,
                  }}
                >
                  Home
                </Link>
              </li>
              {PROPERTY_GROUPS.map((group) =>
                group.properties.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/${p.id}`}
                      onClick={closeMobileMenu}
                      className="block text-white hover:text-[#c084c8] transition-colors"
                      style={{
                        fontFamily: "var(--font-cormorant)",
                        fontSize: "1.6rem",
                        fontWeight: 300,
                      }}
                    >
                      {p.label}
                    </Link>
                  </li>
                ))
              )}
              <li>
                <Link
                  href="/#booking"
                  onClick={closeMobileMenu}
                  className="inline-flex items-center mt-4 px-8 py-3 rounded-md text-[14px] font-medium text-[#561d70] bg-white"
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
