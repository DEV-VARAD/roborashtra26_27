'use client'

import { useRef, useState } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion'
import { events } from '../../data/events'

/*
 * ==========================================================
 * COMBINED ARTWORK
 * ==========================================================
 *
 * This single image is used for the entire front side.
 *
 * The three cards each display one third of this same image.
 */

const COMBINED_IMAGE = '/problem-combined.png'

export default function PSComing() {
  const sectionRef = useRef(null)

  const [hoveredCard, setHoveredCard] = useState(null)
  const words = ['The', 'Problem', 'Statements', 'Will', 'Come', 'Soon.']
  const reducedMotion = false
  const textTiltX = 0
  const textTiltY = 0
  const textShiftX = 0
  const textShiftY = 0

  /*
   * ==========================================================
   * SCROLL
   * ==========================================================
   */

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 25,
    mass: 0.8,
  })

  /*
   * ==========================================================
   * CARD SPLIT
   * ==========================================================
   *
   * The artwork stays exactly the same.
   *
   * Only the physical cards move apart.
   *
   * LEFT   → left
   * MIDDLE → stays
   * RIGHT  → right
   */

  const leftX = useTransform(
    progress,
    [0, 0.35, 0.7],
    ['0%', '-4%', '-8%']
  )

  const middleX = useTransform(
    progress,
    [0, 0.7],
    ['0%', '0%']
  )

  const rightX = useTransform(
    progress,
    [0, 0.35, 0.7],
    ['0%', '4%', '8%']
  )

  /*
   * Small outward tilt.
   */

  const leftRotate = useTransform(
    progress,
    [0, 0.7],
    [0, -1.5]
  )

  const middleRotate = useTransform(
    progress,
    [0, 0.7],
    [0, 0]
  )

  const rightRotate = useTransform(
    progress,
    [0, 0.7],
    [0, 1.5]
  )

  /*
   * Slight scale reduction while opening.
   */

  const cardScale = useTransform(
    progress,
    [0, 0.7],
    [1, 0.94]
  )

  /*
   * ==========================================================
   * FLIP
   * ==========================================================
   *
   * Cards remain the SAME combined artwork until the flip.
   *
   * 0.68 → beginning of flip
   * 0.84 → fully flipped
   */

  const cardFlipY = useTransform(
    progress,
    [0.68, 0.84],
    [0, 180]
  )

  /*
   * ==========================================================
   * INFORMATION REVEAL
   * ==========================================================
   *
   * Starts after the cards have flipped.
   */

  const backMetaOpacity = useTransform(
    progress,
    [0.82, 0.90],
    [0, 1]
  )

  const backInfoOpacity = useTransform(
    progress,
    [0.86, 0.97],
    [0, 1]
  )

  const backInfoY = useTransform(
    progress,
    [0.86, 0.97],
    [24, 0]
  )

  /*
   * ==========================================================
   * SCROLL HINT
   * ==========================================================
   */

  const instructionOpacity = useTransform(
    progress,
    [0, 0.25],
    [1, 0]
  )

  return (
    <main
      ref={sectionRef}
      className="relative h-[250vh] w-full bg-[#020817] text-white"
    >

      {/* ======================================================
          STICKY ARENA
      ====================================================== */}

      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ====================================================
            BACKGROUND ATMOSPHERE
        ==================================================== */}

        <div className="pointer-events-none absolute inset-0">

          <div className="absolute left-[-15%] top-[-15%] h-[600px] w-[600px] rounded-full bg-blue-600/[0.08] blur-[140px]" />

          <div className="absolute bottom-[-20%] right-[-10%] h-[650px] w-[650px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: `
                linear-gradient(
                  rgba(56,189,248,0.18) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  90deg,
                  rgba(56,189,248,0.18) 1px,
                  transparent 1px
                )
              `,
              backgroundSize: '70px 70px',
              maskImage:
                'radial-gradient(circle at center, black 25%, transparent 85%)',
              WebkitMaskImage:
                'radial-gradient(circle at center, black 25%, transparent 85%)',
            }}
          />

          <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/[0.05]" />

          <div className="absolute left-1/2 top-1/2 h-[980px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/[0.035]" />

          <div className="absolute left-[12%] top-[28%] h-1 w-1 rounded-full bg-cyan-300/40" />

          <div className="absolute right-[18%] top-[25%] h-1 w-1 rounded-full bg-cyan-300/30" />

          <div className="absolute bottom-[20%] left-[24%] h-1 w-1 rounded-full bg-blue-300/30" />

        </div>

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="absolute left-4 right-5 top-5 z-50 flex items-start justify-between sm:left-6 sm:right-8 lg:left-8 lg:right-10">

          <div>

            <div className="mb-1.5 flex items-center gap-2">

              <span className="h-px w-5 bg-cyan-300/70" />

              <span className="font-mono text-[8px] tracking-[0.28em] text-cyan-300/70">
                MISSION ARCHIVE // 03
              </span>

            </div>

            <h1 className="font-orbitron text-xl font-medium tracking-[-0.04em] text-white sm:text-2xl lg:text-3xl">
              The Arena
            </h1>

            <p className="mt-1 text-[10px] text-blue-100/45">
              Three challenges. One engineering spirit.
            </p>

          </div>

          <div className="hidden text-right sm:block">

            <div className="font-mono text-[8px] tracking-[0.25em] text-blue-200/40">
              PROBLEM STATEMENTS
            </div>

            <div className="mt-1 font-mono text-[10px] tracking-[0.18em] text-cyan-300/65">
              2026 — 2027
            </div>

          </div>

        </header>

        {/* ====================================================
            DESKTOP
        ==================================================== */}

        <div className="hidden h-full items-center justify-center px-5 pt-8 md:flex">

          {/* ==================================================
              SCROLL HINT
          ================================================== */}

          <motion.div
            style={{
              opacity: instructionOpacity,
            }}
            className="pointer-events-none absolute bottom-[10%] left-1/2 z-30 -translate-x-1/2 text-center"
          >

            <div className="font-mono text-[8px] tracking-[0.28em] text-cyan-300/55">
              SCROLL TO OPEN
            </div>

            <div className="mx-auto mt-3 h-8 w-px bg-gradient-to-b from-cyan-300/50 to-transparent" />

          </motion.div>

          {/* ==================================================
              THREE PHYSICAL PANELS
          ================================================== */}

          <div
            className="flex w-full max-w-[1120px] items-center justify-center gap-0"
            style={{
              perspective: '1600px',
            }}
          >

      {/* ── 2. INTERACTIVE FOREGROUND CONTENT ── */}
      <motion.div
        style={{
          rotateX: reducedMotion ? 0 : textTiltX,
          rotateY: reducedMotion ? 0 : textTiltY,
          x: reducedMotion ? 0 : textShiftX,
          y: reducedMotion ? 0 : textShiftY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center"
      >
        {/* ── Staggered Interactive 3D Typography ── */}
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
                delayChildren: 0.15,
              },
            },
          }}
          className="font-mono font-black text-3xl min-[380px]:text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-[0.08em] uppercase leading-[1.08] text-white"
          style={{ transform: 'translateZ(40px)' }}
        >
          {words.map((word, i) => {
            const isSoon = word.toLowerCase().includes('soon')
            return (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: {
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                whileHover={{
                  scale: 1.08,
                  y: -8,
                  color: isSoon ? '#FFB84D' : '#4FC3FF',
                  textShadow: '0 0 25px rgba(79,195,255,0.75)',
                  transition: { duration: 0.2 },
                }}
                className={`inline-block mr-[0.25em] last:mr-0 cursor-pointer transition-colors duration-200 ${
                  isSoon
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#4FC3FF] via-[#7DD3FC] to-[#FF9F1C] drop-shadow-[0_0_20px_rgba(79,195,255,0.35)]'
                    : ''
                }`}
              >
                {word}
              </motion.span>
            )
          })}
        </motion.h2>
      </motion.div>
          </div>
        </div>
      </div>
    </main>
  )
}

/*
 * ==========================================================
 * COMPATIBILITY EXPORT
 * ==========================================================
 */

export function ProblemStatementComing() {
  return <PSComing />
}