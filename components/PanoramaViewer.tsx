// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Scene {
  id: string;
  label: string;
  icon: string;
  file: string;
}

interface PanoramaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scenes: Scene[];
}

export default function PanoramaViewer({ isOpen, onClose, title, scenes }: PanoramaViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState(scenes[0]?.id || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const threeRef = useRef<any>(null);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(onClose).catch(onClose);
    } else {
      onClose();
    }
  }, [onClose]);

  const handleFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      const requestFS = el.requestFullscreen || (el as any).webkitRequestFullscreen || (el as any).msRequestFullscreen;
      if (requestFS) {
        requestFS.call(el).catch(() => {});
      }
    }
  }, []);

  // Focus trap + Escape key
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => closeBtnRef.current?.focus(), 50);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, handleClose]);

  // Track fullscreen state for button label toggle
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const loadScene = useCallback(async (sceneFile: string, sceneLabel?: string) => {
    if (!threeRef.current) return;
    const { material, THREE } = threeRef.current;

    setLoading(true);
    setProgress(0);
    setError(null);
    setLoadStatus('');

    try {
      const loader = new THREE.TextureLoader();

      const texture = await new Promise<any>((resolve, reject) => {
        loader.load(
          sceneFile,
          (tex: any) => resolve(tex),
          (xhr: any) => {
            if (xhr.total > 0) setProgress(Math.round((xhr.loaded / xhr.total) * 100));
          },
          (err: any) => {
            console.error('360 LOAD ERROR:', err);
            console.error('Attempted file:', sceneFile);
            reject(new Error('Load failed: ' + sceneFile));
          }
        );
      });

      if (material.map) {
        material.map.dispose();
      }

      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.needsUpdate = true;
      setLoading(false);
      setLoadStatus(`${sceneLabel ?? '360° tour'} loaded`);
    } catch (e) {
      console.error('Texture load failed:', e);
      setError('Failed to load 360° tour. File: ' + sceneFile);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    let animationId: number;
    let disposed = false;

    const init = async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

      if (disposed || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1100);
      camera.position.set(0, 0, 0.1);

      // Sphere
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Controls
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.enablePan = false;
      controls.enableZoom = true;
      controls.minDistance = 0.1;
      controls.maxDistance = 0.1;
      controls.rotateSpeed = -0.3;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };

      // Store refs
      threeRef.current = { renderer, scene, camera, controls, geometry, material, mesh, THREE };

      // Animation loop
      const animate = () => {
        if (disposed) return;
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Resize + fullscreen change handler
      const onResize = () => {
        if (disposed) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const onFullscreenChange = () => {
        if (disposed) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      window.addEventListener('resize', onResize);
      document.addEventListener('fullscreenchange', onFullscreenChange);
      document.addEventListener('webkitfullscreenchange', onFullscreenChange);

      threeRef.current.cleanup = () => {
        window.removeEventListener('resize', onResize);
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      };

      // Load first scene
      const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
      if (activeScene) {
        loadScene(activeScene.file, activeScene.label);
      }
    };

    init();

    document.body.style.overflow = 'hidden';

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      document.body.style.overflow = '';

      if (threeRef.current) {
        const { renderer, geometry, material, cleanup } = threeRef.current;
        if (material.map) material.map.dispose();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (cleanup) cleanup();
        threeRef.current = null;
      }
    };
  }, [isOpen]);

  const handleSceneSwitch = (sceneId: string) => {
    setActiveSceneId(sceneId);
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) loadScene(scene.file, scene.label);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panorama-title"
      className="dark-bg"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        background: '#000'
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
      />

      {/* Polite live region — announces load completion */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
      >
        {loadStatus}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div
          role="status"
          aria-label={`Loading 360° tour, ${progress}%`}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a0a24',
            zIndex: 10
          }}
        >
          <div aria-hidden="true" style={{ color: '#c9a84c', fontSize: '24px', fontWeight: 700, letterSpacing: '4px', marginBottom: '24px' }}>
            ASTRA
          </div>
          <div aria-hidden="true" style={{ width: '200px', height: '3px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#c9a84c', transition: 'width 0.3s' }} />
          </div>
          <div aria-hidden="true" style={{ color: '#bbb', fontSize: '13px', marginTop: '12px' }}>
            Loading 360° Tour... {progress}%
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#1a0a24',
            zIndex: 10
          }}
        >
          <div style={{ color: '#ff4444', fontSize: '16px', marginBottom: '16px' }}>{error}</div>
          <button
            onClick={handleClose}
            style={{ padding: '10px 24px', minHeight: '44px', background: '#561d70', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      )}

      {/* Top bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)',
        zIndex: 5,
        pointerEvents: 'none'
      }}>
        <div id="panorama-title" style={{ color: 'white', fontSize: '16px', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          {title}
        </div>
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <button
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={handleFullscreen}
            style={{
              width: '44px', height: '44px', minWidth: '44px', minHeight: '44px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.4)', color: 'white',
              fontSize: '18px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span aria-hidden="true">⛶</span>
          </button>
          <button
            ref={closeBtnRef}
            aria-label="Close 360° tour"
            onClick={handleClose}
            style={{
              width: '44px', height: '44px', minWidth: '44px', minHeight: '44px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.4)', color: 'white',
              fontSize: '20px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {/* Bottom scene switcher */}
      {scenes.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 5
        }}>
          {scenes.map(s => (
            <button
              key={s.id}
              aria-pressed={activeSceneId === s.id}
              onClick={() => handleSceneSwitch(s.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.3)',
                background: activeSceneId === s.id ? '#561d70' : 'rgba(0,0,0,0.55)',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s'
              }}
            >
              <span aria-hidden="true">{s.icon} </span>{s.label}
            </button>
          ))}
        </div>
      )}

      {/* Controls hint */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: scenes.length > 1 ? '72px' : '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '12px',
          zIndex: 5,
          pointerEvents: 'none'
        }}
      >
        Drag · Arrow keys · Scroll to zoom
      </div>
    </div>
  );
}
