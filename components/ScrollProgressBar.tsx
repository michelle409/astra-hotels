"use client"

import { useEffect, useState } from "react"

export function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  return (
    <div
      aria-hidden="true"
      role="presentation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "3px",
        width: `${progress}%`,
        background: "linear-gradient(to right, #561d70, #c084c8)",
        zIndex: 10000,
        transition: "width 0.1s linear",
        pointerEvents: "none",
      }}
    />
  )
}
