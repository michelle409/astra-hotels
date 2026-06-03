import Link from "next/link"
import Image from "next/image"
import { PROPERTIES } from "@/lib/data"

export function Footer() {
  return (
    <footer role="contentinfo" style={{ backgroundColor: "#1a0a24" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Logo + tagline + socials */}
          <div>
            <Link href="/" aria-label="Astra Hotels & Suites — Home">
              <Image
                src="/media/astra-logo.png"
                alt="Astra Hotels & Suites"
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
                marginTop: "1rem",
                lineHeight: 1.6,
              }}
            >
              8 premium properties across Bangalore. Business, leisure, family — every stay, exceptional.
            </p>

            {/* Social links */}
            <nav aria-label="Social media links" className="mt-4">
              <ul className="flex gap-4 list-none" role="list">
                {[
                  { label: "Instagram", href: "https://instagram.com/astrahotels", icon: "IG" },
                  { label: "Facebook", href: "https://facebook.com/astrahotels", icon: "FB" },
                  { label: "Twitter", href: "https://twitter.com/astrahotels", icon: "TW" },
                ].map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      aria-label={`Astra Hotels on ${s.label}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-medium transition-all duration-200 hover:bg-[#561d70]"
                      style={{
                        fontFamily: "var(--font-inter)",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
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
              className="label-caps mb-5"
              style={{ color: "#c084c8" }}
            >
              Our Properties
            </h3>
            <ul className="flex flex-col gap-2.5 list-none" role="list">
              {PROPERTIES.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/${p.id}`}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                    className="hover:text-[#c084c8] hover:translate-x-1 transition-all duration-200 inline-block"
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
              className="label-caps mb-5"
              style={{ color: "#c084c8" }}
            >
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 list-none" role="list">
              {[
                { label: "About", href: "/#about" },
                { label: "Room Types", href: "/#rooms" },
                { label: "Dining", href: "/#dining" },
                { label: "Book Now", href: "/#booking" },
                { label: "Contact", href: "/#contact" },
                { label: "Careers", href: "/careers" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "14px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                    className="hover:text-[#c084c8] hover:translate-x-1 transition-all duration-200 inline-block"
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
              className="label-caps mb-5"
              style={{ color: "#c084c8" }}
            >
              Contact Us
            </h3>
            <address
              style={{ fontStyle: "normal" }}
              className="flex flex-col gap-3"
            >
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.5,
                }}
              >
                Spice Garden Layout,<br />
                Marathahalli,<br />
                Bengaluru — 560037
              </p>
              <a
                href="tel:+918XXXXXXXX"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                }}
                className="hover:text-white transition-colors"
              >
                +91 80 XXXX XXXX
              </a>
              <a
                href="mailto:reservations@astrahotels.in"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontWeight: 300,
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.65)",
                }}
                className="hover:text-white transition-colors"
              >
                reservations@astrahotels.in
              </a>
            </address>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 300,
              fontSize: "13px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            © 2025 Astra Hotels & Suites. All rights reserved.
          </p>
          <nav aria-label="Legal links">
            <ul className="flex gap-4 list-none" role="list">
              {["Privacy Policy", "Terms of Service"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 300,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                    className="hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
