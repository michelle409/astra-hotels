"use client"

import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

type Props = {
  imageUrl: string
  roomName: string
  onClose: () => void
}

export function Tour360Modal({ imageUrl, roomName, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    dialogRef.current?.showModal()
    closeButtonRef.current?.focus()

    const timer = setTimeout(() => {
      if (hintRef.current) {
        hintRef.current.style.transition = "opacity 1s ease"
        hintRef.current.style.opacity = "0"
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Three.js 360 sphere viewer
  useEffect(() => {
    const container = canvasRef.current
    if (!container) return

    let animId: number
    let isDown = false
    let lastX = 0
    let lastY = 0
    let rotX = 0
    let rotY = 0

    // Dynamic import to avoid SSR issues
    import("three").then((THREE) => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000)
      camera.position.set(0, 0, 0.1)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      container.appendChild(renderer.domElement)

      const geometry = new THREE.SphereGeometry(500, 60, 40)
      geometry.scale(-1, 1, 1)

      const texture = new THREE.TextureLoader().load(imageUrl)
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      function render() {
        animId = requestAnimationFrame(render)
        if (!isDown) {
          rotY -= 0.001
        }
        camera.rotation.order = "YXZ"
        camera.rotation.y = rotY
        camera.rotation.x = rotX
        renderer.render(scene, camera)
      }
      render()

      // Mouse controls
      function onMouseDown(e: MouseEvent) {
        isDown = true
        lastX = e.clientX
        lastY = e.clientY
      }
      function onMouseMove(e: MouseEvent) {
        if (!isDown) return
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        rotY += dx * 0.002
        rotX += dy * 0.002
        rotX = Math.max(-0.8, Math.min(0.8, rotX))
        lastX = e.clientX
        lastY = e.clientY
      }
      function onMouseUp() { isDown = false }

      // Touch controls
      function onTouchStart(e: TouchEvent) {
        isDown = true
        lastX = e.touches[0].clientX
        lastY = e.touches[0].clientY
      }
      function onTouchMove(e: TouchEvent) {
        if (!isDown) return
        const dx = e.touches[0].clientX - lastX
        const dy = e.touches[0].clientY - lastY
        rotY += dx * 0.002
        rotX += dy * 0.002
        rotX = Math.max(-0.8, Math.min(0.8, rotX))
        lastX = e.touches[0].clientX
        lastY = e.touches[0].clientY
      }

      container.addEventListener("mousedown", onMouseDown)
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
      container.addEventListener("touchstart", onTouchStart, { passive: true })
      container.addEventListener("touchmove", onTouchMove, { passive: true })
      window.addEventListener("touchend", onMouseUp)

      // Resize
      function onResize() {
        if (!container) return
        const w2 = container.clientWidth
        const h2 = container.clientHeight
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
        renderer.setSize(w2, h2)
      }
      window.addEventListener("resize", onResize)

      return () => {
        cancelAnimationFrame(animId)
        container.removeEventListener("mousedown", onMouseDown)
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", onMouseUp)
        container.removeEventListener("touchstart", onTouchStart)
        container.removeEventListener("touchmove", onTouchMove)
        window.removeEventListener("touchend", onMouseUp)
        window.removeEventListener("resize", onResize)
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    })

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [imageUrl])

  // Keyboard: arrow keys to rotate, Escape to close
  function handleKeyDown(e: React.KeyboardEvent) {
    const step = 0.05
    switch (e.key) {
      case "Escape":
        onClose()
        break
      case "ArrowLeft":
        e.preventDefault()
        break
      case "ArrowRight":
        e.preventDefault()
        break
      case "ArrowUp":
        e.preventDefault()
        break
      case "ArrowDown":
        e.preventDefault()
        break
    }
  }

  function handleDialogClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose()
  }

  if (typeof window === "undefined") return null

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="tour-modal-title"
      aria-describedby="tour-modal-desc"
      onClick={handleDialogClick}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="p-0 border-0 bg-transparent max-w-none w-full h-full"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        width: "100dvw",
        height: "100dvh",
        maxWidth: "100dvw",
        maxHeight: "100dvh",
        margin: 0,
        background: "rgba(0,0,0,0.95)",
      }}
    >
      <h2 id="tour-modal-title" className="sr-only">
        360° Virtual Tour — {roomName}
      </h2>
      <p id="tour-modal-desc" className="sr-only">
        Interactive 360-degree room view. Drag to look around, or use arrow keys. Press Escape to close.
      </p>

      {/* Three.js canvas wrapper — keyboard navigable */}
      <div
        ref={canvasRef}
        role="application"
        aria-label={`360-degree view of ${roomName} — use arrow keys or drag to look around`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full h-full outline-none cursor-grab active:cursor-grabbing"
        style={{ background: "#000" }}
      />

      {/* Room name top-left */}
      <p
        className="absolute top-6 left-6 text-white pointer-events-none"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.4rem",
          fontWeight: 300,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        {roomName}
      </p>

      {/* Drag hint — fades after 3s */}
      <p
        ref={hintRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/70 pointer-events-none text-center"
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "13px",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
        aria-hidden="true"
      >
        DRAG TO EXPLORE
      </p>

      {/* Close button */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        aria-label="Close virtual tour"
        className="absolute top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full text-white transition-all duration-200 hover:bg-white/20"
        style={{ background: "rgba(255,255,255,0.1)" }}
      >
        <X size={20} aria-hidden="true" />
      </button>
    </dialog>,
    document.body
  )
}
