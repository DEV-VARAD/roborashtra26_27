'use client'

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

function YouTubeIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedInIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64c-.88 0-1.6.72-1.6 1.6s.72 1.6 1.6 1.6 1.6-.72 1.6-1.6-.72-1.6-1.6-1.6Z" />
    </svg>
  )
}

function MailIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

// Preload the custom GLTF model asset
useGLTF.preload('/models/3d-metal-robot.glb')

// Responsive Rig for Canvas
function ResponsiveRig({ children }) {
  const { viewport } = useThree()
  const scale = Math.min(1.15, Math.max(0.7, viewport.width / 4.2))
  return <group scale={scale}>{children}</group>
}

// GLTF 3D Custom Metal Robot Model Component
function CustomGLTFModel({ scrollProgress, onInteractiveClick }) {
  const { scene } = useGLTF('/models/3d-metal-robot.glb')
  const robotGroup = useRef()
  const clickSpinRef = useRef(0)

  // Clone scene so transformations and shadows apply cleanly
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material.needsUpdate = true
        }
      }
    })
    return clone
  }, [scene])

  // Center model bounding box automatically and normalize height
  const { centeredOffset, baseScale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)

    const maxDim = Math.max(size.x, size.y, size.z)
    const desiredHeight = 2.4 * 0.6
    const baseScaleFactor = maxDim > 0 ? desiredHeight / maxDim : 1
    const scaleFactor = baseScaleFactor * 1.3 // Slightly larger presence

    return {
      centeredOffset: [-center.x * scaleFactor, -center.y * scaleFactor, -center.z * scaleFactor],
      baseScale: scaleFactor,
    }
  }, [clonedScene])

  useFrame((state, delta) => {
    if (!robotGroup.current) return
    const dt = Math.min(delta, 0.08)
    const t = state.clock.getElapsedTime()

    // Smooth floating animation
    const floatY = Math.sin(t * 2.2) * 0.08

    // Cursor tracking physics
    const mouseX = state.pointer.x
    const mouseY = state.pointer.y

    const targetBodyX = mouseX * 0.4
    const targetBodyRotY = Math.PI + mouseX * 0.35 + clickSpinRef.current
    const targetBodyRotX = -mouseY * 0.18
    const targetBodyRotZ = -mouseX * 0.08

    // Fixed scale (no scroll parallax scaling)
    const targetScale = baseScale
    const targetY = -0.15 + floatY

    robotGroup.current.scale.setScalar(THREE.MathUtils.lerp(robotGroup.current.scale.x, targetScale, 5.0 * dt))
    robotGroup.current.position.y = THREE.MathUtils.lerp(robotGroup.current.position.y, targetY, 5.0 * dt)
    robotGroup.current.position.x = THREE.MathUtils.lerp(robotGroup.current.position.x, targetBodyX, 4.5 * dt)

    robotGroup.current.rotation.y = THREE.MathUtils.lerp(robotGroup.current.rotation.y, targetBodyRotY, 5.0 * dt)
    robotGroup.current.rotation.x = THREE.MathUtils.lerp(robotGroup.current.rotation.x, targetBodyRotX, 4.5 * dt)
    robotGroup.current.rotation.z = THREE.MathUtils.lerp(robotGroup.current.rotation.z, targetBodyRotZ, 4.5 * dt)
  })

  const handleClick = (e) => {
    e.stopPropagation()
    clickSpinRef.current += Math.PI * 2 // 360 degree spin surge on click
    if (onInteractiveClick) onInteractiveClick()
  }

  return (
    <group
      ref={robotGroup}
      position={[0, -0.15, 0]}
      rotation={[0, Math.PI, 0]}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <primitive object={clonedScene} position={centeredOffset} />
    </group>
  )
}

// Fallback procedural visual while GLTF model is loading
function LoadingFallback() {
  const meshRef = useRef()
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 1.5
  })
  return (
    <group ref={meshRef} position={[0, 0, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 0.4, 16, 16]} />
        <meshStandardMaterial color="#f8f6f0" roughness={0.2} metalness={0.8} wireframe />
      </mesh>
    </group>
  )
}

import RightNav from './RightNav'

export default function Hero() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section
      id="hero"
      className="relative h-[100svh] min-h-[640px] w-full bg-[#F1EDE3] text-textDark select-none overflow-hidden border-b border-black/10 flex flex-col justify-between"
    >
      {/* Subtle Editorial Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:44px_44px] pointer-events-none" />

      {/* Soft Ambient Radial Warm Tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(200, 75, 39, 0.08), transparent 65%), radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.03), transparent 65%)',
        }}
      />

      {/* 3D GLTF Metal Robot Scene*/}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto will-change-transform">
        {mounted && (
          <Canvas
            shadows={!isMobile}
            camera={{ position: [0, 0.7, 5.8], fov: 20, near: 0.5 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              precision: isMobile ? 'mediump' : 'highp',
            }}
            dpr={isMobile ? [1, 1] : [1, 1.5]}
          >
            <ambientLight intensity={1.4} />
            <directionalLight position={[4, 8, 5]} intensity={9.0} color="#ffffff" castShadow={!isMobile} />
            <directionalLight position={[-4, -2, -3]} intensity={2} color="#c84b27" />

            <ResponsiveRig>
              <group position={[0, -0.3, 0]}>
                <ContactShadows
                  position={[0, -0.75, 0]}
                  opacity={isMobile ? 0.25 : 0.4}
                  scale={7}
                  blur={1.6}
                  far={2.5}
                  resolution={isMobile ? 128 : 256}
                  color="#000000"
                />
                <Suspense fallback={<LoadingFallback />}>
                  <CustomGLTFModel />
                </Suspense>
              </group>
            </ResponsiveRig>
          </Canvas>
        )}
      </div>

      {/* Viewport UI Overlay: Top Eyebrow, Left Identity, Right Portals, and Bottom Strip (z-20) */}
      <div className="relative z-20 h-full flex flex-col justify-between px-5 sm:px-8 md:px-12 pt-20 sm:pt-24 md:pt-28 pb-6 md:pb-8 pointer-events-none">
        {/* Top Eyebrow Tag */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-mono text-[9px] sm:text-[11px] font-bold tracking-widest2 uppercase text-rust"
          >
            FLAGSHIP ROBOTICS CHAMPIONSHIP · 2026-2027
          </motion.div>
        </div>

        {/* Mid-Row: Left Division Identity & Right Section Portals */}
        <div className="flex-1 flex items-center justify-between my-auto">
          {/* Left Brand Identity Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="hidden lg:block w-full max-w-[260px] space-y-2 pointer-events-auto select-none"
          >
            <span className="font-mono text-[9px] tracking-widest2 uppercase text-rust font-bold block">
              [ DIVISION 01 // GROUND ARENA ]
            </span>
            <div className="p-1 bg-black/5 rounded-[1.1rem] border border-black/10 shadow-sm">
              <div className="bg-white/85 backdrop-blur-md p-3.5 rounded-[0.9rem] space-y-1 border border-white/60">
                <span className="font-mono text-[10px] tracking-widest2 uppercase text-textDark font-bold block">
                  AUTONOMOUS COMBAT RIG
                </span>
              </div>
            </div>
          </motion.div>

          <div className="flex-1" />

          {/* Right-Side Vertical Section Navigation (Portals) */}
          <div className="pointer-events-auto self-end lg:self-center">
            <RightNav />
          </div>
        </div>

        {/* Bottom Minimal Footer Strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 font-mono text-[10px] sm:text-[11px] tracking-widest2 uppercase text-textDark/80 border-t border-black/10 pt-4"
        >
          <div>
            <p className="font-semibold text-textDark">ROBORASHTRA ARENA</p>
          </div>
          <div className="text-left sm:text-right text-textMuted text-[9px]">
            <span>Social Links</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
