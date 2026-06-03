"use client"

import Link from "next/link"
import Image from "next/image"
import { PROPERTIES } from "@/lib/data"

export function Footer() {
  return (
    <footer role="contentinfo" style={{ backgroundColor: "#1a0a24" }}>
      <div
        className="site-container"
        style={{ paddingTop: "80px", paddingBottom: "0" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "48px",
          }}
        >
          {/* Col 1: Logo + tagline + socials */}
          <div>
            <Link href="/" aria-label="Astra Hotels & Suites — Home">
              <Image
                src="/media/astra-logo.png"
                alt=""
                width={120}
                height={40}
                style={{ objectFit: "contain", height: "auto" }}
              />
            </Link>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 300,
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                marginTop: "16px",
                lineHeight: 1.6,
              }}
            >
              8 premium properties across Bangalore. Business, leisure, family — every stay, exceptional.
            </p>

            <nav aria-label="Social media links" style={{ marginTop: "16px" }}>
              <ul style={{ display: "flex", gap: "16px", listStyle: "none", padding: 0, margin: 0 }} role="list">
                {[
                  { label: "Instagram", href: "https://instagram.com/astrahotels", icon: "IG" },
                  { label: "Facebook", href: "https://facebook.com/astrahotels", icon: "FB" },
                  { label: "Twitter", href: "https://twitter.com/astrahotels", icon: "TW" },
                ].map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={`Astra Hotels on ${s.label} (opens in new tab)`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                        fontFamily: "var(--font-inter)",
                        fontSize: "11px",
                        fontWeight: 500,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#561d70"; e.currentTarget.style.borderColor = "#561d70" }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)" }}
                    >
                      <span aria-hidden="true">{s.icon}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Col 2: Properties */}
          <nav aria-label="Our properties">
            <h3
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "24px",
              }}
            >
              Our Properties
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} role="list">
              {PROPERTIES.map((p) => (
                <li key={p.id} style={{ marginBottom: "12px" }}>
                  <Link
                    href={`/${p.id}`}
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#c084c8"
                      e.currentTarget.style.transform = "translateX(4px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)"
                      e.currentTarget.style.transform = "translateX(0)"
                    }}
                  >
                    {p.area}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 3: Quick links */}
          <nav aria-label="Quick links">
            <h3
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "24px",
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }} role="list">
              {[
                { label: "About", href: "/#about" },
                { label: "Room Types", href: "/#rooms" },
                { label: "Dining", href: "/#dining" },
                { label: "Book Now", href: "/#booking" },
                { label: "Contact", href: "/#contact" },
                { label: "Careers", href: "/careers" },
              ].map((l) => (
                <li key={l.label} style={{ marginBottom: "12px" }}>
                  <Link
                    href={l.href}
                    style={{
                      display: "inline-block",
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#c084c8"
                      e.currentTarget.style.transform = "translateX(4px)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)"
                      e.currentTarget.style.transform = "translateX(0)"
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Col 4: Contact */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-inter)",
                fontWeight: 700,
                fontSize: "11px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: "24px",
              }}
            >
              Contact Us
            </h3>
            <address style={{ fontStyle: "normal" }}>
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                  marginBottom: "12px",
                }}
              >
                Spice Garden Layout,<br />
                Marathahalli,<br />
                Bengaluru — 560037
              </p>
              <a
                href="tel:+918XXXXXXXX"
                style={{
                  display: "block",
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  marginBottom: "12px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "white" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)" }}
              >
                +91 80 XXXX XXXX
              </a>
              <a
                href="mailto:reservations@astrahotels.in"
                style={{
                  display: "block",
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "white" }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.65)" }}
              >
                reservations@astrahotels.in
              </a>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            marginTop: "60px",
            paddingTop: "32px",
            paddingBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "12px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2025 Astra Hotels & Suites. All rights reserved.
          </p>
          <nav aria-label="Legal links">
            <ul style={{ display: "flex", gap: "16px", listStyle: "none", padding: 0, margin: 0 }} role="list">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((label) => (
                <li key={label.label}>
                  <a
                    href={label.href}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "none",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "white" }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}
                  >
                    {label.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          footer .site-container > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          footer .site-container > div:last-child {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          footer .site-container > div:first-child {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  )
}
