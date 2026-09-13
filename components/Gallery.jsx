'use client'

import { useState, useRef, useEffect } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import GalleryScene from './gallery/GalleryScene'
import GalleryControls from './gallery/GalleryControls'
import ExpandedPhoto from './gallery/ExpandedPhoto'
import { galleryPhotos } from '@/data/galleryPhotos'

/**
 * Gallery - Production-quality messy 3D ring photo gallery with pinned sticky scroll.
 * Features:
 * - Pinned sticky scroll track (~300vh / 2-3 full page scrolls of pinned interaction)
 * - Chaotic organic 3D ring arrangement with controlled deterministic noise
 * - Real 3D physics drag with momentum inertia and damping
 * - Scroll-driven orbit rotation synchronized with manual drag
 * - Subtle camera parallax and continuous breathing float
 * - Spotlight modal with rich metadata and keyboard navigation
 * - prefers-reduced-motion accessibility support
 * - Mobile auto-scroll button for hands-free gallery browsing
 */
export default function Gallery() {
    const containerRef = useRef(null)
    const [selectedPhoto, setSelectedPhoto] = useState(null)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [reducedMotion, setReducedMotion] = useState(false)

    // Track sticky scroll through the 300vh track (start start -> end end)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    })

    const [scrollProgress, setScrollProgress] = useState(0)

    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        setScrollProgress(v)
    })

    // Check prefers-reduced-motion
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setReducedMotion(mediaQuery.matches)

        const handleChange = (e) => setReducedMotion(e.matches)
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    const handleUserInteracted = () => {
        if (!hasInteracted) {
            setHasInteracted(true)
        }
    }

    const handleSelectPhoto = (photo) => {
        handleUserInteracted()
        setSelectedPhoto(photo)
    }


    return (
        <section
            id="gallery"
            ref={containerRef}
            className="relative w-full h-[280vh] sm:h-[300vh] bg-[#070b14] select-none"
        >
            {/* Sticky Fullscreen 3D Stage — Holds in place for 2-3 scrolls */}
            <div className="sticky top-0 h-screen w-full overflow-hidden border-y border-grid bg-[#070b14]">
                {/* Background Gradients & Vignette */}
                <div className="absolute inset-0 bg-blueprintGrid bg-grid opacity-30 pointer-events-none" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070b14]/60 to-[#070b14] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#070b14] to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#070b14] to-transparent pointer-events-none" />

                {/* 3D Scene Layer */}
                <div className="absolute inset-0 z-0">
                    <GalleryScene
                        photos={galleryPhotos}
                        selectedPhoto={selectedPhoto}
                        onSelectPhoto={handleSelectPhoto}
                        onUserInteracted={handleUserInteracted}
                        scrollProgress={scrollProgress}
                        reducedMotion={reducedMotion}
                    />
                </div>

                {/* Editorial HUD Overlay with Orbit Scrub Timeline */}
                <GalleryControls
                    hasInteracted={hasInteracted}
                    totalPhotos={galleryPhotos.length}
                    scrollProgress={scrollProgress}
                />

                {/* Spotlight Expanded Photo Modal */}
                <ExpandedPhoto
                    photo={selectedPhoto}
                    photos={galleryPhotos}
                    onClose={() => setSelectedPhoto(null)}
                    onNavigate={(photo) => setSelectedPhoto(photo)}
                />

                {/* ── Mobile Scroll Arrow — right side, mobile only ── */}
                <div className="sm:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto">
                    <button
                        onClick={() => {
                            if (!containerRef.current) return
                            const sectionTop = containerRef.current.offsetTop
                            const sectionEnd = sectionTop + containerRef.current.offsetHeight - window.innerHeight
                            // Scroll down by 30% of the gallery track per tap, clamped to section end
                            const step = containerRef.current.offsetHeight * 0.30
                            const target = Math.min(window.scrollY + step, sectionEnd)
                            window.scrollTo({ top: target, behavior: 'smooth' })
                        }}
                        aria-label="Scroll gallery"
                        className="flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 active:scale-90"
                        style={{
                            background: 'rgba(7,11,20,0.75)',
                            border: '1px solid rgba(255,255,255,0.20)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.55)',
                        }}
                    >
                        {/* Down chevron */}
                        <svg
                            width="18" height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <polyline
                                points="4,7 9,12 14,7"
                                stroke="rgba(255,255,255,0.85)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}