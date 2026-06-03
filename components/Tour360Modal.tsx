"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { type Room, type Tour360Scene } from "@/lib/data"

type Props = {
  room: Room
  onClose: () => void
}

const HOTSPOTS = [
  { id: "h1", x: 62, y: 38, label: "King-size bed with premium linens" },
  { id: "h2", x: 30, y: 55, label: "Smart TV with streaming apps" },
  { id: "h3", x: 80, y: 60, label: "Work desk with ergonomic chair" },
]

export function Tour360Modal({ room, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)
  const [activeScene, setActiveScene] = useState<Tour360Scene>(room.tour360Scenes[0])
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [sceneTransition, setSceneTransition] = useState(false)

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

  function switchScene(scene: Tour360Scene) {
    if (scene.id === activeScene.id) return
    setSceneTransition(true)
    setTimeout(() => {
      setActiveScene(scene)
      setSceneTransition(false)
    }, 300)
  }

  // Three.js 360 sphere viewer — re-runs when scene changes
  useEffect(() => {
    const container = canvasRef.current
    if (!container) return

    let animId: number
    let isDown = false
    let lastX = 0
    let lastY = 0
    let rotX = 0
    let rotY = 0
    let cleanupFn: (() => void) | undefined

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

      const texture = new THREE.TextureLoader().load(activeScene.image)
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      function render() {
        animId = requestAnimationFrame(render)
        if (!isDown) rotY -= 0.001
        camera.rotation.order = "YXZ"
        camera.rotation.y = rotY
        camera.rotation.x = rotX
        renderer.render(scene, camera)
      }
      render()

      function onMouseDown(e: MouseEvent) { isDown = true; lastX = e.clientX; lastY = e.clientY }
      function onMouseMove(e: MouseEvent) {
        if (!isDown) return
        rotY += (e.clientX - lastX) * 0.002
        rotX += (e.clientY - lastY) * 0.002
        rotX = Math.max(-0.8, Math.min(0.8, rotX))
        lastX = e.clientX; lastY = e.clientY
      }
      function onMouseUp() { isDown = false }

      function onTouchStart(e: TouchEvent) { isDown = true; lastX = e.touches[0].clientX; lastY = e.touches[0].clientY }
      function onTouchMove(e: TouchEvent) {
        if (!isDown) return
        rotY += (e.touches[0].clientX - lastX) * 0.002
        rotX += (e.touches[0].clientY - lastY) * 0.002
        rotX = Math.max(-0.8, Math.min(0.8, rotX))
        lastX = e.touches[0].clientX; lastY = e.touches[0].clientY
      }

      function onResize() {
        if (!container) return
        const w2 = container.clientWidth
        const h2 = container.clientHeight
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
        renderer.setSize(w2, h2)
      }

      container.addEventListener("mousedown", onMouseDown)
      window.addEventListener("mousemove", onMouseMove)
      window.addEventListener("mouseup", onMouseUp)
      container.addEventListener("touchstart", onTouchStart, { passive: true })
      container.addEventListener("touchmove", onTouchMove, { passive: true })
      window.addEventListener("touchend", onMouseUp)
      window.addEventListener("resize", onResize)

      cleanupFn = () => {
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
      cleanupFn?.()
    }
  }, [activeScene.image])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose()
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault()
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
        360° Virtual Tour — {room.name}
      </h2>
      <p id="tour-modal-desc" className="sr-only">
        Interactive 360-degree room view. Drag to look around, or use arrow keys. Use the scene tabs to switch between rooms. Press Escape to close.
      </p>

      {/* Three.js canvas wrapper */}
      <div
        ref={canvasRef}
        role="application"
        aria-label={`360-degree view of ${room.name} — ${activeScene.label} — use arrow keys or drag to look around`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="w-full h-full outline-none cursor-grab active:cursor-grabbing"
        style={{
          background: "#000",
          opacity: sceneTransition ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Hotspots */}
      {HOTSPOTS.map((hotspot) => (
        <div
          key={hotspot.id}
          style={{ position: "absolute", left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        >
          <button
            onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
            aria-label={`Info: ${hotspot.label}`}
            aria-expanded={activeHotspot === hotspot.id}
            aria-describedby={`tooltip-${hotspot.id}`}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold transition-transform duration-200 hover:scale-125 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            style={{
              background: "rgba(86,29,112,0.85)",
              border: "2px solid rgba(192,132,200,0.8)",
              boxShadow: "0 0 0 4px rgba(192,132,200,0.25)",
              transform: "translate(-50%, -50%)",
            }}
          >
            i
          </button>
          <div
            id={`tooltip-${hotspot.id}`}
            role="tooltip"
            style={{
              visibility: activeHotspot === hotspot.id ? "visible" : "hidden",
              position: "absolute",
              bottom: "calc(100% + 10px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(26,10,36,0.95)",
              border: "1px solid rgba(192,132,200,0.4)",
              borderRadius: "8px",
              padding: "8px 14px",
              whiteSpace: "nowrap",
              fontFamily: "var(--font-inter)",
              fontSize: "12px",
              color: "white",
              pointerEvents: "none",
            }}
          >
            {hotspot.label}
          </div>
        </div>
      ))}

      {/* Room name */}
      <p
        className="absolute top-6 left-6 text-white pointer-events-none"
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "1.4rem",
          fontWeight: 300,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        {room.name} — {activeScene.label}
      </p>

      {/* Scene switcher tabs */}
      <div
        role="tablist"
        aria-label="Room scenes"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
      >
        {room.tour360Scenes.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={activeScene.id === s.id}
            aria-label={`View ${s.label}`}
            onClick={() => switchScene(s)}
            className="px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-200"
            style={{
              fontFamily: "var(--font-inter)",
              letterSpacing: "0.08em",
              background: activeScene.id === s.id ? "#561d70" : "rgba(255,255,255,0.15)",
              color: activeScene.id === s.id ? "white" : "rgba(255,255,255,0.7)",
              border: activeScene.id === s.id ? "1.5px solid #c084c8" : "1.5px solid rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Drag hint */}
      <p
        ref={hintRef}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/70 pointer-events-none text-center"
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

      {/* Close */}
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
