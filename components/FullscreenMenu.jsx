'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight, X } from 'lucide-react'
import LunarParticles from './LunarParticles'

const links = [
  { label: 'HOME', href: '/' },
  { label: 'GALLERY', href: '/gallery' },
  { label: 'PROBLEM STATEMENTS', href: '/event' },
  { label: 'SPONSOR', href: '/sponsor' },
  { label: 'TEAM', href: '/team' },
  { label: 'ROADMAP', href: '/roadmap' },
  { label: 'COUNTDOWN', href: '/countdown' },
  { label: 'REGISTER', href: 'https://unstop.com/' },
]

const listVariants = {
  hidden: {},

  show: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.18,
    },
  },
}

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -24,
  },

  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export default function FullscreenMenu({
  open,
  onClose,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[90] overflow-hidden bg-black text-ivory"
        >
          {/* =====================================================
              BACKGROUND ATMOSPHERE
          ====================================================== */}

          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.68)_100%)]" />
          </div>

          {/* =====================================================
              PARTICLES
          ====================================================== */}

          <div className="pointer-events-none absolute inset-0 z-10">
            <LunarParticles />
          </div>

          {/* =====================================================
              HEADER
          ====================================================== */}

          <div className="relative z-30 flex h-16 items-center justify-between px-5 sm:h-20 md:px-12">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-rust shadow-[0_0_12px_rgba(180,75,45,0.55)]" />

              <span className="font-serifEd text-lg tracking-wide sm:text-xl">
                Roborashtra
              </span>
            </div>

            <button
              onClick={onClose}
              aria-label="Close menu"
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 transition-all duration-300 hover:border-rust hover:bg-rust hover:text-black"
            >
              <X
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </button>
          </div>

          {/* =====================================================
              MAIN CONTENT
          ====================================================== */}

          <div className="relative z-20 flex h-[calc(100vh-9rem)] flex-col lg:flex-row">

            {/* ===================================================
                LEFT — NAVIGATION
            ==================================================== */}

            <motion.nav
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="flex w-full flex-1 flex-col justify-center px-5 md:px-12 lg:w-1/2 lg:flex-none lg:pr-10"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-ivory/35">
                  Navigation
                </span>

                <span className="h-px w-12 bg-ivory/15 sm:w-16" />

                <span className="font-mono text-[8px] tracking-[0.25em] text-ivory/20">
                  08 MODULES
                </span>
              </div>

              <div className="w-full max-w-3xl">
                {links.map((link, index) => {
                  const content = (
                    <>
                      <span className="w-7 shrink-0 font-mono text-[9px] tracking-[0.2em] text-ivory/25 transition-colors duration-300 group-hover:text-rust sm:w-9 sm:text-xs">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="mr-3 h-px w-6 shrink-0 bg-ivory/15 transition-all duration-500 group-hover:w-10 group-hover:bg-rust sm:mr-5 sm:w-10 sm:group-hover:w-16" />

                      <span className="font-serifEd text-[1.65rem] leading-none tracking-wide transition-all duration-300 group-hover:translate-x-2 group-hover:text-rust min-[380px]:text-[1.9rem] sm:text-3xl md:text-4xl xl:text-[2.7rem]">
                        {link.label}
                      </span>

                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.5}
                        className="ml-auto opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100 sm:ml-4"
                      />
                    </>
                  )

                  return (
                    <motion.div
                      key={link.label}
                      variants={itemVariants}
                      className="group"
                    >
                      {link.href.startsWith('http') ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={onClose}
                          className="flex items-center border-b border-ivory/[0.08] py-2.5 transition-colors duration-300 hover:border-rust/30 sm:py-3"
                        >
                          {content}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className="flex items-center border-b border-ivory/[0.08] py-2.5 transition-colors duration-300 hover:border-rust/30 sm:py-3"
                        >
                          {content}
                        </Link>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.nav>

            {/* ===================================================
                RIGHT — LARGE CENTERED EAGLE / LOGO
            ==================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                x: 30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                x: 0,
              }}
              transition={{
                duration: 1,
                delay: 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative hidden w-1/2 items-center justify-center lg:flex"
            >
              {/* Subtle logo glow */}

              <div className="pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-rust/[0.025] blur-[120px]" />

              {/* =================================================
                  CLICKABLE EAGLE
                  Opens RoboHawk Instagram
              ================================================== */}

              <a
                href="https://www.instagram.com/robohawk.pccoer/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="RoboHawk Instagram"
                className="relative z-10 block"
              >
                <motion.img
                  src="/logo-b.png"
                  alt="RoboRashtra"
                  initial={{
                    opacity: 0,
                    scale: 0.94,
                  }}
                  animate={{
                    opacity: 0.72,
                    scale: 1,
                  }}
                  whileHover={{
                    scale: 1.06,
                    opacity: 1,
                    filter:
                      'drop-shadow(0 0 25px rgba(180, 75, 45, 0.35))',
                  }}
                  transition={{
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-auto w-[440px] cursor-pointer object-contain xl:w-[520px] 2xl:w-[600px]"
                />
              </a>
            </motion.div>
          </div>

          {/* =====================================================
              MOBILE LOGO
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            className="pointer-events-none absolute bottom-20 right-4 z-20 lg:hidden"
          >
            <img
              src="/logo-b.png"
              alt=""
              className="h-auto w-[100px] object-contain opacity-60 sm:w-[130px]"
            />
          </motion.div>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.6,
              duration: 0.5,
            }}
            className="absolute bottom-0 left-0 right-0 z-30 flex flex-col gap-2 px-6 pb-5 font-mono text-[8px] uppercase tracking-[0.25em] text-ivory/30 sm:flex-row sm:items-center sm:justify-between md:px-12 md:pb-6"
          >
            <span></span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}