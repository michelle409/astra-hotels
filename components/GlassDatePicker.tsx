"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

// ── Public type ──────────────────────────────────────────────────────────────

export type DateSelection = {
  checkIn: Date
  checkOut: Date
  rooms: number
  adults: number
  children: number
}

type Props = {
  propertyName: string
  propertyLocation: string
  heroImage: string
  isOpen: boolean
  onConfirm: (s: DateSelection) => void
  onClose: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

// ── Calendar pure helpers ────────────────────────────────────────────────────

function sod(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function sameDay(a: Date, b: Date) { return sod(a).getTime() === sod(b).getTime() }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function addMonths(d: Date, n: number) { const r = new Date(d); r.setMonth(r.getMonth() + n); return r }
function nightsBetween(a: Date, b: Date) { return Math.round((sod(b).getTime() - sod(a).getTime()) / 86_400_000) }
function toISO(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
function pad(n: number) { return String(n).padStart(2, "0") }

function getMonthGrid(y: number, m: number): { date: Date; inMonth: boolean }[][] {
  const firstDow = new Date(y, m, 1).getDay()
  const lastDate = new Date(y, m + 1, 0)
  const rows: { date: Date; inMonth: boolean }[][] = []
  let cur = new Date(y, m, 1 - firstDow)
  while (rows.length < 6) {
    const row: { date: Date; inMonth: boolean }[] = []
    for (let c = 0; c < 7; c++) {
      row.push({ date: new Date(cur), inMonth: cur.getMonth() === m })
      cur = addDays(cur, 1)
    }
    rows.push(row)
    if (rows.length >= 4 && cur > lastDate) break
  }
  return rows
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DOW_ABBR = ["Su","Mo","Tu","We","Th","Fr","Sa"]
const DOW_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const DOW_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

function fmtFull(d: Date) { return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
function fmtShort(d: Date) { return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}` }
function fmtDow(d: Date) { return DOW_SHORT[d.getDay()] }

// ── Portal wrapper (guards against SSR) ─────────────────────────────────────

export function GlassDatePicker(props: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted || !props.isOpen) return null
  return createPortal(<DatePickerInner {...props} />, document.body)
}

// ── Inner component ──────────────────────────────────────────────────────────

function DatePickerInner({ propertyName, propertyLocation, heroImage, isOpen, onConfirm, onClose, triggerRef }: Props) {
  const today = useMemo(() => sod(new Date()), [])
  const maxDate = useMemo(() => addDays(today, 90), [today])

  const [baseDate, setBaseDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [monthDir, setMonthDir] = useState<1 | -1>(1)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [focusedDate, setFocusedDate] = useState<Date>(() => sod(new Date()))

  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const [isShaking, setIsShaking] = useState(false)
  const [selStatus, setSelStatus] = useState("")
  const [rangePreview, setRangePreview] = useState("")

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const month2 = useMemo(() => addMonths(baseDate, 1), [baseDate])
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  // ── Focus trap via inert ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return
    let appRoot: Element | null = dialogRef.current
    while (appRoot && appRoot.parentElement !== document.body) {
      appRoot = appRoot.parentElement
    }
    const siblings = Array.from(document.body.children).filter(el => el !== appRoot)
    siblings.forEach(el => el.setAttribute("inert", ""))
    document.body.style.overflow = "hidden"
    setTimeout(() => closeBtnRef.current?.focus(), 60)
    return () => {
      siblings.forEach(el => el.removeAttribute("inert"))
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // ── Escape key ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); triggerRef?.current?.focus() }
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [isOpen, onClose, triggerRef])

  // ── Date state helpers ──────────────────────────────────────────────────

  function isPast(d: Date) { return sod(d) < today }
  function isTooFar(d: Date) { return sod(d) > maxDate }

  const inRange = useCallback((d: Date) => {
    if (!checkIn || !checkOut) return false
    return sod(d) > sod(checkIn) && sod(d) < sod(checkOut)
  }, [checkIn, checkOut])

  const inPreviewRange = useCallback((d: Date) => {
    if (!checkIn || checkOut || !hoveredDate) return false
    if (sod(hoveredDate) <= sod(checkIn)) return false
    return sod(d) > sod(checkIn) && sod(d) < sod(hoveredDate)
  }, [checkIn, checkOut, hoveredDate])

  const isHoverEnd = useCallback((d: Date) => {
    if (!checkIn || checkOut || !hoveredDate) return false
    return sameDay(d, hoveredDate) && sod(hoveredDate) > sod(checkIn)
  }, [checkIn, checkOut, hoveredDate])

  const hasRange = useCallback(() => {
    return !!(checkIn && (checkOut || (hoveredDate && sod(hoveredDate) > sod(checkIn))))
  }, [checkIn, checkOut, hoveredDate])

  // ── Date click ──────────────────────────────────────────────────────────

  function handleDateClick(date: Date) {
    const d = sod(date)
    if (isPast(d)) {
      setSelStatus("That date is in the past. Please choose a different date.")
      return
    }
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d); setCheckOut(null); setHoveredDate(null)
      setSelStatus(`Check-in: ${fmtFull(d)}. Now select a check-out date.`)
    } else {
      if (sameDay(d, checkIn) || d < checkIn) {
        setCheckIn(d); setCheckOut(null)
        setSelStatus(`Check-in: ${fmtFull(d)}. Now select a check-out date.`)
      } else {
        const n = nightsBetween(checkIn, d)
        const actualOut = n > 30 ? addDays(checkIn, 30) : d
        const actualN = n > 30 ? 30 : n
        setCheckOut(actualOut)
        setSelStatus(`Check-out: ${fmtFull(actualOut)}. Stay is ${actualN} night${actualN !== 1 ? "s" : ""}.`)
      }
    }
  }

  // ── Hover (debounced 500ms for announcements) ───────────────────────────

  function handleHover(date: Date) {
    const d = sod(date)
    if (!isPast(d)) setHoveredDate(d)
    if (checkIn && !checkOut && !isPast(d) && sod(d) > sod(checkIn)) {
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      hoverTimer.current = setTimeout(() => {
        const n = nightsBetween(checkIn, d)
        setRangePreview(`${fmtFull(checkIn)} to ${fmtFull(d)} — ${n} night${n !== 1 ? "s" : ""}`)
      }, 500)
    }
  }

  function handleLeave() {
    setHoveredDate(null)
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
  }

  // ── Month nav ───────────────────────────────────────────────────────────

  function prevMonth() {
    const prev = addMonths(baseDate, -1)
    if (prev < new Date(today.getFullYear(), today.getMonth(), 1)) return
    setMonthDir(-1)
    setBaseDate(prev)
  }

  function nextMonth() { setMonthDir(1); setBaseDate(addMonths(baseDate, 1)) }

  // ── Keyboard nav inside grid ────────────────────────────────────────────

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, date: Date) => {
    let next: Date | null = null
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); next = addDays(date, 1); break
      case "ArrowLeft":  e.preventDefault(); next = addDays(date, -1); break
      case "ArrowDown":  e.preventDefault(); next = addDays(date, 7); break
      case "ArrowUp":    e.preventDefault(); next = addDays(date, -7); break
      case "PageDown":   e.preventDefault(); next = addMonths(date, 1); break
      case "PageUp":     e.preventDefault(); next = addMonths(date, -1); break
      case "Home":       e.preventDefault(); next = addDays(date, -date.getDay()); break
      case "End":        e.preventDefault(); next = addDays(date, 6 - date.getDay()); break
      case "Enter": case " ": e.preventDefault(); handleDateClick(date); return
      default: return
    }
    if (next) {
      const n = sod(next)
      setFocusedDate(n)
      if (n < new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)) {
        setMonthDir(-1)
        setBaseDate(new Date(n.getFullYear(), n.getMonth(), 1))
      } else if (n >= new Date(month2.getFullYear(), month2.getMonth() + 1, 1)) {
        setMonthDir(1)
        setBaseDate(new Date(n.getFullYear(), n.getMonth() - 1, 1))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseDate, month2, checkIn, checkOut])

  // ── Focus cell when focusedDate changes ────────────────────────────────

  useEffect(() => {
    if (!isOpen) return
    const el = dialogRef.current?.querySelector(`[data-date="${toISO(focusedDate)}"]`) as HTMLElement | null
    el?.focus({ preventScroll: true })
  }, [focusedDate, isOpen, baseDate])

  // ── CTA ─────────────────────────────────────────────────────────────────

  function handleConfirm() {
    if (!checkIn || !checkOut) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600)
      setSelStatus("Please select both check-in and check-out dates to continue.")
      return
    }
    onConfirm({ checkIn, checkOut, rooms, adults, children })
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
    >
      {/* Blurred hero */}
      <div
        aria-hidden="true"
        onClick={() => { onClose(); triggerRef?.current?.focus() }}
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "blur(20px)", transform: "scale(1.08)", cursor: "pointer",
        }}
      />
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "rgba(86,29,112,0.45)" }} />

      {/* Live regions — mounted at render time so screen readers register them */}
      <div id="dp-sel-status" role="status" aria-live="polite" aria-atomic="true" className="sr-only">{selStatus}</div>
      <div id="dp-range-preview" role="status" aria-live="polite" aria-atomic="false" className="sr-only">{rangePreview}</div>

      {/* Dialog */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dp-title"
        id="date-picker-dialog"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
          maxWidth: "860px", width: "100%", maxHeight: "90vh", overflowY: "auto",
          padding: "clamp(20px,4vw,40px)",
        }}
      >
        {/* Close */}
        <button
          ref={closeBtnRef}
          aria-label="Close date picker"
          onClick={() => { onClose(); triggerRef?.current?.focus() }}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "50%", width: "36px", height: "36px",
            color: "white", fontSize: "18px", lineHeight: 1,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.22)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          ×
        </button>

        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2
            id="dp-title"
            style={{
              fontFamily: "var(--font-cormorant)", fontWeight: 300,
              fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "white",
              letterSpacing: "0.02em", marginBottom: "6px",
            }}
          >
            Select Your Stay
          </h2>
          <p style={{ fontFamily: "var(--font-inter)", fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            {propertyName} — {propertyLocation}
          </p>
          <div aria-hidden="true" style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "16px 0 0" }} />
        </header>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", gap: "8px" }}>
          <button aria-label="Go to previous month" onClick={prevMonth} style={navBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.28)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >←</button>
          <div style={{ display: "flex", gap: "clamp(16px,4vw,64px)", flex: 1, justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px", color: "white" }}>
              {MONTHS[baseDate.getMonth()]} {baseDate.getFullYear()}
            </span>
            <span className="dp-m2-lbl" style={{ fontFamily: "var(--font-inter)", fontWeight: 500, fontSize: "14px", color: "white" }}>
              {MONTHS[month2.getMonth()]} {month2.getFullYear()}
            </span>
          </div>
          <button aria-label="Go to next month" onClick={nextMonth} style={navBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 12px rgba(255,255,255,0.28)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >→</button>
        </div>

        {/* Dual-month calendar */}
        <div role="group" aria-label="Date range selector">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${baseDate.getFullYear()}-${baseDate.getMonth()}`}
              initial={{ x: monthDir * 56, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: monthDir * -56, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="dp-calendars"
              style={{ display: "flex", gap: "clamp(12px,3vw,28px)", alignItems: "flex-start", justifyContent: "center" }}
            >
              <CalendarMonth
                year={baseDate.getFullYear()} month={baseDate.getMonth()}
                checkIn={checkIn} checkOut={checkOut}
                focusedDate={focusedDate} today={today}
                inRange={inRange} inPreviewRange={inPreviewRange}
                isHoverEnd={isHoverEnd} hasRange={hasRange()}
                isPast={isPast} isTooFar={isTooFar}
                onDateClick={handleDateClick} onDateHover={handleHover} onDateLeave={handleLeave}
                onCellKeyDown={handleCellKeyDown}
              />
              <div aria-hidden="true" className="dp-div" style={{ width: "1px", alignSelf: "stretch", background: "rgba(255,255,255,0.15)", minHeight: "200px" }} />
              <CalendarMonth
                year={month2.getFullYear()} month={month2.getMonth()}
                checkIn={checkIn} checkOut={checkOut}
                focusedDate={focusedDate} today={today}
                inRange={inRange} inPreviewRange={inPreviewRange}
                isHoverEnd={isHoverEnd} hasRange={hasRange()}
                isPast={isPast} isTooFar={isTooFar}
                onDateClick={handleDateClick} onDateHover={handleHover} onDateLeave={handleLeave}
                onCellKeyDown={handleCellKeyDown}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stay summary */}
        <AnimatePresence>
          {checkIn && checkOut && (
            <motion.section
              aria-label="Stay summary"
              aria-live="polite"
              aria-atomic="true"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{
                marginTop: "24px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
              }}
              className="dp-summary"
            >
              <div>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "10px", color: "#c9a84c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Check-in</p>
                <time dateTime={toISO(checkIn)} style={{ fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: 500, color: "white", display: "block" }}>
                  {fmtDow(checkIn)}, {fmtShort(checkIn)}, {checkIn.getFullYear()}
                </time>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>12:00 PM</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <span aria-hidden="true" style={{ fontSize: "18px", display: "block" }}>🌙</span>
                <motion.p
                  key={nights}
                  initial={{ scale: 1.25 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.22 }}
                  aria-label={`${nights} night${nights !== 1 ? "s" : ""}`}
                  style={{ fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "18px", color: "white", lineHeight: 1, margin: "2px 0" }}
                >{nights}</motion.p>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>Night{nights !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "10px", color: "#c9a84c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Check-out</p>
                <time dateTime={toISO(checkOut)} style={{ fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: 500, color: "white", display: "block" }}>
                  {fmtDow(checkOut)}, {fmtShort(checkOut)}, {checkOut.getFullYear()}
                </time>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>11:00 AM</p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Rooms + Guests steppers */}
        <div className="dp-controls" style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <Stepper label="Rooms" value={rooms} min={1} max={4}
            onDec={() => setRooms(v => Math.max(1, v - 1))}
            onInc={() => setRooms(v => Math.min(4, v + 1))}
            unit="room" />
          <Stepper label="Adults" value={adults} min={1} max={8}
            onDec={() => setAdults(v => Math.max(1, v - 1))}
            onInc={() => setAdults(v => Math.min(8, v + 1))}
            unit="adult" />
          <Stepper label="Children" value={children} min={0} max={4}
            onDec={() => setChildren(v => Math.max(0, v - 1))}
            onInc={() => setChildren(v => Math.min(4, v + 1))}
            unit="child" unitPlural="children" />
        </div>

        {/* CTA */}
        <div style={{ marginTop: "20px" }}>
          <p id="dp-cta-hint" className="sr-only">Select both check-in and check-out dates to continue.</p>
          <motion.button
            aria-label={
              checkIn && checkOut
                ? `Check availability for ${nights} night${nights !== 1 ? "s" : ""} starting ${fmtFull(checkIn)}`
                : "Check availability — please select your dates first"
            }
            aria-describedby={!checkIn || !checkOut ? "dp-cta-hint" : undefined}
            disabled={!checkIn || !checkOut}
            onClick={handleConfirm}
            animate={isShaking ? { x: [-10, 10, -7, 7, -4, 4, 0] } : { x: 0 }}
            transition={{ duration: 0.45 }}
            style={{
              width: "100%", padding: "16px 48px", borderRadius: "12px",
              background: checkIn && checkOut ? "#561d70" : "rgba(86,29,112,0.25)",
              color: checkIn && checkOut ? "white" : "rgba(255,255,255,0.35)",
              border: `1.5px solid ${checkIn && checkOut ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
              fontFamily: "var(--font-inter)", fontWeight: 700, fontSize: "14px",
              letterSpacing: "0.07em", textTransform: "uppercase" as const,
              cursor: checkIn && checkOut ? "pointer" : "not-allowed",
              transition: "box-shadow 0.3s, border-color 0.3s",
            }}
            onMouseEnter={e => {
              if (!checkIn || !checkOut) return
              e.currentTarget.style.boxShadow = "0 0 28px rgba(201,168,76,0.4)"
              e.currentTarget.style.borderColor = "#c9a84c"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = "none"
              e.currentTarget.style.borderColor = checkIn && checkOut ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"
            }}
          >
            Check Availability →
          </motion.button>
        </div>

        {/* Responsive + interaction styles */}
        <style>{`
          .dp-m2-lbl, .dp-div { display: inline-block; }
          .dp-calendars > div:nth-child(3) { display: table; }
          @media (max-width: 620px) {
            .dp-m2-lbl { display: none !important; }
            .dp-div    { display: none !important; }
            .dp-calendars > div:nth-child(3) { display: none !important; }
            .dp-controls { flex-wrap: wrap; }
            .dp-controls > div { flex: 1 1 calc(50% - 6px); }
            .dp-summary { flex-direction: column !important; align-items: center !important; }
            .dp-summary > div:last-child { text-align: center !important; }
          }
          @media (max-width: 620px) {
            [data-date] { min-width: 40px; min-height: 40px; }
          }
          .dp-cell:hover > span { background: rgba(255,255,255,0.16) !important; transform: scale(1.1); box-shadow: 0 0 12px rgba(255,255,255,0.18) !important; }
          .dp-cell[aria-selected="true"]:hover > span { transform: scale(1.06); }
          .dp-cell[aria-disabled="true"]:hover > span { background: transparent !important; transform: none !important; box-shadow: none !important; }
          .dp-cell:focus-visible { outline: 2px solid #c9a84c; outline-offset: -2px; border-radius: 4px; }
        `}</style>
      </motion.div>
    </div>
  )
}

// ── CalendarMonth ────────────────────────────────────────────────────────────

type CMProps = {
  year: number; month: number
  checkIn: Date | null; checkOut: Date | null
  focusedDate: Date; today: Date
  inRange: (d: Date) => boolean
  inPreviewRange: (d: Date) => boolean
  isHoverEnd: (d: Date) => boolean
  hasRange: boolean
  isPast: (d: Date) => boolean
  isTooFar: (d: Date) => boolean
  onDateClick: (d: Date) => void
  onDateHover: (d: Date) => void
  onDateLeave: () => void
  onCellKeyDown: (e: React.KeyboardEvent, d: Date) => void
}

function CalendarMonth({
  year, month, checkIn, checkOut, focusedDate, today,
  inRange, inPreviewRange, isHoverEnd, hasRange,
  isPast, isTooFar,
  onDateClick, onDateHover, onDateLeave, onCellKeyDown,
}: CMProps) {
  const weeks = useMemo(() => getMonthGrid(year, month), [year, month])
  const captionId = `dp-cap-${year}-${month}`

  return (
    <table
      role="grid"
      aria-labelledby={captionId}
      style={{ borderCollapse: "collapse", tableLayout: "fixed", minWidth: "252px" }}
    >
      <caption id={captionId} style={{ display: "none" }}>{MONTHS[month]} {year}</caption>
      <thead>
        <tr>
          {DOW_ABBR.map((a, i) => (
            <th key={a} scope="col" abbr={DOW_FULL[i]} style={{
              fontFamily: "var(--font-inter)", fontSize: "10px", fontWeight: 500,
              color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em",
              padding: "0 0 10px", textAlign: "center", width: "36px",
            }}>
              {a}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week, wi) => (
          <tr key={wi}>
            {week.map(({ date, inMonth }) => {
              const d = sod(date)
              const past = isPast(d)
              const tooFar = isTooFar(d)
              const isCI = checkIn ? sameDay(d, checkIn) : false
              const isCO = checkOut ? sameDay(d, checkOut) : false
              const rang = inRange(d)
              const prev = inPreviewRange(d)
              const hEnd = isHoverEnd(d)
              const isFocused = sameDay(d, focusedDate)
              const isT = sameDay(d, today)
              const disabled = past || !inMonth

              // Accessible label
              let label = `${MONTHS[month]} ${date.getDate()}, ${year}`
              if (isT) label += ", today"
              if (isCI) label += ", check-in date selected"
              if (isCO) label += ", check-out date selected"
              if (rang) label += ", within selected stay"
              if (past && inMonth) label += ", past date, not available"
              if (!inMonth) label += ", outside current month"

              // Range band on td background (produces the continuous band effect)
              const bandColor = rang ? "rgba(86,29,112,0.28)" : prev ? "rgba(86,29,112,0.14)" : ""
              let tdBg = "transparent"
              if (bandColor && hasRange) {
                if (isCI) tdBg = `linear-gradient(to right, transparent 50%, ${bandColor} 50%)`
                else if (isCO || (hEnd && !checkOut)) tdBg = `linear-gradient(to left, transparent 50%, ${bandColor} 50%)`
                else tdBg = bandColor
              }

              // Circle on inner span
              let circBg = "transparent"
              let circShadow = "none"
              let circBorder = "none"
              let fw: React.CSSProperties["fontWeight"] = 400

              if (isCI || isCO) {
                circBg = "#561d70"; circShadow = "0 0 20px rgba(86,29,112,0.65)"; fw = 600
              } else if (hEnd) {
                circBg = "rgba(86,29,112,0.65)"; circShadow = "0 0 12px rgba(86,29,112,0.4)"; fw = 500
              } else if (isT && inMonth) {
                circBorder = "2px solid #c9a84c"
              }

              return (
                <td
                  key={d.toISOString()}
                  role="gridcell"
                  aria-selected={isCI || isCO ? true : false}
                  aria-disabled={disabled ? true : undefined}
                  aria-hidden={!inMonth ? true : undefined}
                  aria-label={inMonth ? label : undefined}
                  data-date={inMonth ? toISO(d) : undefined}
                  tabIndex={isFocused && inMonth && !disabled ? 0 : -1}
                  className="dp-cell"
                  onClick={() => { if (!disabled) onDateClick(d) }}
                  onKeyDown={e => onCellKeyDown(e, d)}
                  onMouseEnter={() => { if (inMonth && !disabled) onDateHover(d) }}
                  onMouseLeave={onDateLeave}
                  style={{
                    width: "36px", height: "36px", padding: 0,
                    textAlign: "center",
                    cursor: disabled ? "not-allowed" : "pointer",
                    background: inMonth ? tdBg : "transparent",
                    opacity: !inMonth ? 0.12 : past ? 0.25 : tooFar ? 0.5 : 1,
                    position: "relative",
                    transition: "background 0.15s",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "32px", height: "32px", margin: "2px auto",
                      borderRadius: "50%",
                      background: circBg,
                      boxShadow: circShadow,
                      border: circBorder,
                      color: "white",
                      fontFamily: "var(--font-inter)", fontSize: "13px", fontWeight: fw,
                      transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
                    }}
                  >
                    {date.getDate()}
                  </span>
                  {(isCI || isCO) && inMonth && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)",
                        fontFamily: "var(--font-inter)", fontSize: "7px", fontWeight: 700,
                        color: "#c9a84c", textTransform: "uppercase", letterSpacing: "0.04em",
                        whiteSpace: "nowrap", pointerEvents: "none",
                      }}
                    >
                      {isCI ? "IN" : "OUT"}
                    </span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  label, value, min, max, onDec, onInc, unit, unitPlural,
}: {
  label: string; value: number; min: number; max: number
  onDec: () => void; onInc: () => void; unit: string; unitPlural?: string
}) {
  const plural = unitPlural || `${unit}s`
  const labelId = `dp-slbl-${unit}`
  const outId = `dp-sout-${unit}`
  return (
    <div role="group" aria-labelledby={labelId} style={{
      flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: "12px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px",
    }}>
      <span id={labelId} style={{ fontFamily: "var(--font-inter)", fontSize: "10px", color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
        <button
          aria-label={`Remove one ${unit}`}
          aria-controls={outId}
          disabled={value <= min}
          onClick={onDec}
          style={stepBtnStyle}
        >−</button>
        <output
          id={outId}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`${value} ${value !== 1 ? plural : unit} selected`}
          style={{ fontFamily: "var(--font-inter)", fontWeight: 600, fontSize: "17px", color: "white", minWidth: "20px", textAlign: "center" }}
        >
          {value}
        </output>
        <button
          aria-label={`Add one ${unit}`}
          aria-controls={outId}
          disabled={value >= max}
          onClick={onInc}
          style={stepBtnStyle}
        >+</button>
      </div>
    </div>
  )
}

// ── Shared micro-styles ──────────────────────────────────────────────────────

const navBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "50%", width: "36px", height: "36px",
  color: "white", fontSize: "15px",
  cursor: "pointer", flexShrink: 0,
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "box-shadow 0.2s, background 0.2s",
}

const stepBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "50%", width: "30px", height: "30px",
  color: "white", fontSize: "16px",
  cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background 0.15s",
}
