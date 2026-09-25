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

            {events.map((event, index) => {

              const isHovered =
                hoveredCard === event.id

              const x =
                index === 0
                  ? leftX
                  : index === 1
                    ? middleX
                    : rightX

              const rotate =
                index === 0
                  ? leftRotate
                  : index === 1
                    ? middleRotate
                    : rightRotate

              /*
               * Each card receives one third of the same
               * combined artwork.
               *
               * Because the cards have zero gap and zero
               * border initially, they appear as ONE image.
               */

              const combinedPosition =
                index === 0
                  ? '0% 50%'
                  : index === 1
                    ? '50% 50%'
                    : '100% 50%'

              return (
                <motion.div
                  key={event.id}
                  className="relative h-[500px] min-w-0 flex-1"
                  style={{
                    x,
                    rotate,
                    scale: cardScale,
                    zIndex:
                      isHovered
                        ? 30
                        : 10,
                  }}
                  onMouseEnter={() =>
                    setHoveredCard(event.id)
                  }
                  onMouseLeave={() =>
                    setHoveredCard(null)
                  }
                >

                  {/* ==================================================
                      CARD
                  ================================================== */}

                  <motion.div
                    className="relative h-full w-full"
                    animate={{
                      y:
                        isHovered
                          ? -7
                          : 0,

                      scale:
                        isHovered
                          ? 1.035
                          : 1,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: [
                        0.22,
                        1,
                        0.36,
                        1,
                      ],
                    }}
                    style={{
                      rotateY: cardFlipY,
                      transformStyle:
                        'preserve-3d',
                    }}
                  >

                    {/* ==================================================
                        FRONT
                    ================================================== */}

                    <div
                      className="absolute inset-0 overflow-hidden bg-transparent"
                      style={{
                        /*
                         * IMPORTANT:
                         *
                         * NO BORDER.
                         *
                         * At the beginning these three panels
                         * must visually become one single image.
                         */
                        backfaceVisibility:
                          'hidden',

                        WebkitBackfaceVisibility:
                          'hidden',
                      }}
                    >

                      {/* ==================================================
                          ONE COMBINED IMAGE
                      ================================================== */}

                      <div
                        className="absolute inset-0 bg-no-repeat"
                        style={{
                          backgroundImage:
                            `url(${COMBINED_IMAGE})`,

                          /*
                           * The source image spans the width
                           * of all three cards combined.
                           */

                          backgroundSize:
                            '300% 100%',

                          /*
                           * Each panel shows its respective
                           * third of the same image.
                           */

                          backgroundPosition:
                            combinedPosition,
                        }}
                      />

                      {/* Very subtle atmospheric darkening */}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#020817]/35 via-transparent to-transparent" />

                    </div>

                    {/* ==================================================
                        BACK
                    ================================================== */}

                    <div
                      className="absolute inset-0 overflow-hidden rounded-[4px] border border-cyan-300/20 bg-[#071426] p-6 lg:p-8"
                      style={{
                        backfaceVisibility:
                          'hidden',

                        WebkitBackfaceVisibility:
                          'hidden',

                        transform:
                          'rotateY(180deg)',
                      }}
                    >

                      <motion.div
                        className="flex h-full flex-col"
                        style={{
                          opacity:
                            backInfoOpacity,

                          y:
                            backInfoY,
                        }}
                      >

                        {/* ==============================================
                            BACK HEADER
                        ============================================== */}

                        <motion.div
                          className="flex items-center justify-between"
                          style={{
                            opacity:
                              backMetaOpacity,
                          }}
                        >

                          <span className="font-mono text-[11px] tracking-[0.22em] text-cyan-300/75">
                            {event.code}
                          </span>

                          <span className="font-mono text-[9px] tracking-[0.16em] text-white/40">
                            MISSION BRIEF
                          </span>

                        </motion.div>

                        {/* ==============================================
                            INFORMATION
                        ============================================== */}

                        <div className="mt-8">

                          <div className="mb-4 h-px w-10 bg-cyan-300/60" />

                          <h2 className="font-orbitron text-2xl font-semibold tracking-tight text-white lg:text-[28px]">
                            {event.title}
                          </h2>

                          <p className="mt-3 font-mono text-[11px] leading-relaxed tracking-[0.12em] text-cyan-200/70">
                            {event.tagline}
                          </p>

                          <p className="mt-5 text-[13px] leading-[1.75] text-blue-100/75 lg:text-[14px]">
                            {event.description}
                          </p>

                        </div>

                        {/* ==============================================
                            RULEBOOK
                        ============================================== */}

                        <div className="mt-auto">

                          <div className="mb-3 font-mono text-[9px] tracking-[0.2em] text-white/40">
                            OFFICIAL RULEBOOK
                          </div>

                          {event.rulebook ? (

                            <a
                              href={event.rulebook}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-11 items-center justify-between border border-cyan-300/30 px-4 font-mono text-[9px] tracking-[0.15em] text-cyan-200 transition-colors hover:border-cyan-300/60 hover:bg-cyan-300/[0.04]"
                            >

                              <span>
                                VIEW RULEBOOK
                              </span>

                              <span>
                                ↗
                              </span>

                            </a>

                          ) : (

                            <div className="flex h-11 items-center justify-between border border-white/[0.08] px-4 font-mono text-[9px] tracking-[0.1em] text-white/45">

                              <span>
                                AVAILABLE{' '}
                                {event.availableFrom}
                              </span>

                              <span>
                                LOCKED
                              </span>

                            </div>

                          )}

                          <div className="mt-3 w-full py-2 text-center font-mono text-[9px] tracking-[0.18em] text-white/25">
                            SCROLL TO RETURN
                          </div>

                        </div>

                      </motion.div>

                    </div>

                  </motion.div>

                </motion.div>
              )
            })}

          </div>

        </div>

        {/* ====================================================
            MOBILE
        ==================================================== */}

        <div className="flex h-full flex-col justify-center gap-3 px-5 pb-10 pt-28 md:hidden">

          {events.map((event, index) => (

            <div
              key={event.id}
              className="relative h-[185px] w-full"
            >

              <div className="absolute inset-0 overflow-hidden rounded-[4px] border border-white/10">

                <img
                  src={[
                    '/card1.png',
                    '/card2.png',
                    '/card3.png',
                  ][index]}
                  alt={event.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020817] to-transparent" />

                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">

                  <span className="font-mono text-[10px] tracking-[0.2em] text-cyan-200/70">
                    {event.code}
                  </span>

                  <span className="font-mono text-[8px] tracking-[0.12em] text-white/30">
                    OPENING
                  </span>

                </div>

                <div className="absolute bottom-0 p-4">

                  <h2 className="font-orbitron text-xl font-semibold text-white">
                    {event.title}
                  </h2>

                  <p className="mt-2 font-mono text-[10px] leading-relaxed text-cyan-100/70">
                    {event.tagline}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="absolute bottom-5 left-5 right-5 z-50 flex items-center justify-between">

          <span className="font-mono text-[8px] tracking-[0.2em] text-white/25">
            ROBORASHTRA 2026 — 2027
          </span>

          <span className="hidden font-mono text-[8px] tracking-[0.2em] text-cyan-300/35 sm:block">
            ENGINEERING / ROBOTICS / INNOVATION
          </span>

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