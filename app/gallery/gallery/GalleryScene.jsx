'use client'

import { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import PhotoRing from './PhotoRing'

// Ambient floating particles for volumetric atmospheric depth
function AtmosphericParticles({ count = 80, radius = 9 }) {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 2.5 + Math.random() * radius
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 6
      pos[i * 3] = Math.cos(theta) * r
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(theta) * r
    }
    return pos
  }, [count, radius])

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ff9f1c"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Camera controller with subtle cinematic drift (no initial zoom-in lerp)
function CinematicCamera({ isMobile, isTablet }) {
  const camRef = useRef()

  const baseCamZ = isMobile ? 10.5 : isTablet ? 12.0 : 11.5
  const baseCamY = isMobile ? 0.8 : 1.5

  useFrame((state) => {
    if (!camRef.current) return
    const time = state.clock.getElapsedTime()

    const driftY = Math.sin(time * 0.4) * 0.04
    const driftX = Math.cos(time * 0.3) * 0.04

    // Set position directly with gentle float; no lerping from origin/back
    camRef.current.position.y = baseCamY + driftY
    camRef.current.position.x = driftX
    camRef.current.position.z = baseCamZ

    camRef.current.lookAt(0, -0.05, 0)
  })

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      position={[0, baseCamY, baseCamZ]}
      fov={isMobile ? 62 : 45}
      near={0.1}
      far={100}
    />
  )
}

/**
 * GalleryScene - The Three.js canvas container.
 */
export default function GalleryScene({
  photos = [],
  selectedPhoto = null,
  onSelectPhoto,
  onUserInteracted,
  reducedMotion = false,
  ringControlRef = null,
}) {
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') {
      return { isMobile: false, isTablet: false }
    }
    const w = window.innerWidth
    return {
      isMobile: w < 640,
      isTablet: w >= 640 && w < 1024,
    }
  })

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth

      setScreenSize({
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
      })
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { visiblePhotos, radius } = useMemo(() => {
    if (screenSize.isMobile) {
      return {
        visiblePhotos: photos.slice(0, 12),
        radius: 4.2,
      }
    }

    if (screenSize.isTablet) {
      return {
        visiblePhotos: photos.slice(0, 18),
        radius: 5.8,
      }
    }

    return {
      visiblePhotos: photos.slice(0, 22),
      radius: 6.4,
    }
  }, [photos, screenSize])

  const initialCamZ = screenSize.isMobile ? 10.5 : screenSize.isTablet ? 12.0 : 11.5
  const initialCamY = screenSize.isMobile ? 0.8 : 1.5
  const initialFov = screenSize.isMobile ? 62 : 45

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        className="touch-none cursor-grab active:cursor-grabbing"
        dpr={[1, 1.5]}
        camera={{
          position: [0, initialCamY, initialCamZ],
          fov: initialFov,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <CinematicCamera
          isMobile={screenSize.isMobile}
          isTablet={screenSize.isTablet}
        />

        {/* Studio Lighting Setup */}
        <ambientLight intensity={0.65} />

        <directionalLight
          position={[8, 10, 6]}
          intensity={1.4}
          color="#fff6eb"
        />

        <directionalLight
          position={[-9, -4, -6]}
          intensity={0.85}
          color="#3a6ea5"
        />

        <pointLight
          position={[0, 0, 0]}
          intensity={1.8}
          distance={10}
          color="#ffecd1"
        />

        <directionalLight
          position={[0, 12, 0]}
          intensity={0.4}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <AtmosphericParticles
            count={
              screenSize.isMobile
                ? 35
                : 70
            }
            radius={8.5}
          />

          <PhotoRing
            photos={visiblePhotos}
            radius={radius}
            selectedPhoto={selectedPhoto}
            onSelectPhoto={onSelectPhoto}
            onUserInteracted={onUserInteracted}
            reducedMotion={reducedMotion}
            ringControlRef={ringControlRef}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}