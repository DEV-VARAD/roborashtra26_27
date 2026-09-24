'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * Single Flip Card Half Panel (Top or Bottom)
 */
function CardHalf({ value, position, isDays = false, dark = false }) {
  const formatted = String(value).padStart(2, '0')
  const isTop = position === 'top'
  const isThreeDigits = isDays && formatted.length >= 3

  return (
    <div
      className={`relative w-full h-1/2 overflow-hidden select-none ${
        dark
          ? isTop
            ? 'rounded-t-lg sm:rounded-t-2xl border-b border-black/70 bg-gradient-to-b from-[#131E35] to-[#0D1526]'
            : 'rounded-b-lg sm:rounded-b-2xl border-t border-white/5 bg-gradient-to-b from-[#0A111E] to-[#070C16]'
          : isTop
            ? 'rounded-t-lg sm:rounded-t-2xl border-b border-black/10 bg-white'
            : 'rounded-b-lg sm:rounded-b-2xl border-t border-black/10 bg-white'
      }`}
      style={{
        boxShadow: dark
          ? isTop
            ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 2px 6px rgba(0,0,0,0.6)'
            : 'inset 0 -1px 0 rgba(0,0,0,0.5), 0 6px 16px rgba(0,0,0,0.7)'
          : isTop
            ? 'inset 0 1px 0 rgba(255,255,255,1), 0 2px 4px rgba(0,0,0,0.02)'
            : 'inset 0 -1px 0 rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Number Container - 200% height card centered vertically across the split line */}
      <div
        className="absolute left-0 right-0 w-full flex items-center justify-center px-1"
        style={{
          height: '200%',
          top: isTop ? '0%' : '-100%',
        }}
      >
        <span
          className={`font-tech font-bold leading-none select-none ${
            dark ? 'text-[#F8FAFC] drop-shadow-[0_2px_10px_rgba(51,204,221,0.15)]' : 'text-[#111111]'
          } ${
            isThreeDigits
              ? 'text-2xl min-[350px]:text-3xl min-[390px]:text-4xl min-[480px]:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[8rem] tracking-tight'
              : 'text-3.5xl min-[350px]:text-4xl min-[390px]:text-4.5xl min-[480px]:text-5.5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[9.5rem] tracking-tight'
          }`}
          style={{
            fontVariantNumeric: 'tabular-nums lining-nums',
            transform: 'translateY(1.5%)',
          }}
        >
          {formatted}
        </span>
      </div>
    </div>
  )
}

/**
 * Mechanical Flip Clock Unit (DAYS / HOURS / MINUTES / SECONDS)
 */
export default function FlipUnit({ value, label, isDays = false, dark = false }) {
  const formattedValue = String(value).padStart(2, '0')
  const [currentVal, setCurrentVal] = useState(formattedValue)
  const [nextVal, setNextVal] = useState(formattedValue)
  const [isFlipping, setIsFlipping] = useState(false)
  const prevValueRef = useRef(formattedValue)

  useEffect(() => {
    if (formattedValue !== prevValueRef.current) {
      setNextVal(formattedValue)
      setIsFlipping(true)

      const timer = setTimeout(() => {
        setCurrentVal(formattedValue)
        setIsFlipping(false)
        prevValueRef.current = formattedValue
      }, 480)

      return () => clearTimeout(timer)
    }
  }, [formattedValue])

  const isDaysUnit = isDays || label === 'DAYS'

  return (
    <div className="flex flex-col items-center select-none flex-shrink">
      {/* Physical Mechanical Flip-Card Housing */}
      <div
        className={`relative ${
          isDaysUnit
            ? 'w-[84px] min-[350px]:w-[94px] min-[390px]:w-[106px] min-[480px]:w-[136px] sm:w-[180px] md:w-[220px] lg:w-[265px] xl:w-[300px]'
            : 'w-[72px] min-[350px]:w-[80px] min-[390px]:w-[90px] min-[480px]:w-[114px] sm:w-[148px] md:w-[182px] lg:w-[222px] xl:w-[248px]'
        } h-[82px] min-[350px]:h-[92px] min-[390px]:h-[102px] min-[480px]:h-[130px] sm:h-[175px] md:h-[215px] lg:h-[260px] xl:h-[285px] rounded-lg sm:rounded-2xl ${
          dark
            ? 'border border-cyan-500/25 bg-[#090F1C]/90 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_24px_rgba(51,204,221,0.08)] backdrop-blur-md'
            : 'border border-black/10 bg-[#FAF9F5] shadow-[0_6px_20px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.03)]'
        } p-0.5 sm:p-1.5`}
        style={{ perspective: '1200px' }}
      >
        {/* Left Mechanical Pin/Hinge */}
        <div
          className={`absolute -left-1 sm:-left-1.5 top-1/2 -translate-y-1/2 w-1 sm:w-2.5 h-2.5 sm:h-5 ${
            dark
              ? 'bg-[#1E293B] border border-cyan-400/40 shadow-[0_0_8px_rgba(51,204,221,0.25)]'
              : 'bg-[#D8D4C9] border border-black/15 shadow-xs'
          } rounded-xs sm:rounded-sm z-30`}
        />
        
        {/* Right Mechanical Pin/Hinge */}
        <div
          className={`absolute -right-1 sm:-right-1.5 top-1/2 -translate-y-1/2 w-1 sm:w-2.5 h-2.5 sm:h-5 ${
            dark
              ? 'bg-[#1E293B] border border-cyan-400/40 shadow-[0_0_8px_rgba(51,204,221,0.25)]'
              : 'bg-[#D8D4C9] border border-black/15 shadow-xs'
          } rounded-xs sm:rounded-sm z-30`}
        />

        {/* Card Inner Stage */}
        <div
          className={`relative w-full h-full rounded-md sm:rounded-xl overflow-hidden flex flex-col ${
            dark ? 'bg-[#0A101D]' : 'bg-white'
          }`}
        >
          {/* STATIC BACKGROUND LAYER */}
          {/* Static Top Half: Displays the NEXT number */}
          <CardHalf
            value={isFlipping ? nextVal : currentVal}
            position="top"
            isDays={isDaysUnit}
            dark={dark}
          />

          {/* Static Bottom Half: Displays the CURRENT number until covered */}
          <CardHalf
            value={currentVal}
            position="bottom"
            isDays={isDaysUnit}
            dark={dark}
          />

          {/* DYNAMIC FLIPPING LAYERS */}
          {isFlipping && (
            <>
              {/* FLIP 1: Top Half Flipping Downward (0deg -> -90deg) */}
              <motion.div
                key={`flip-top-${nextVal}`}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -90 }}
                transition={{ duration: 0.22, ease: 'easeIn' }}
                style={{
                  transformOrigin: 'bottom center',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                }}
                className="absolute top-0 left-0 w-full h-1/2 z-20"
              >
                <CardHalf
                  value={currentVal}
                  position="top"
                  isDays={isDaysUnit}
                  dark={dark}
                />
              </motion.div>

              {/* FLIP 2: Bottom Half Flipping Downward (90deg -> 0deg) */}
              <motion.div
                key={`flip-bot-${nextVal}`}
                initial={{ rotateX: 90 }}
                animate={{ rotateX: 0 }}
                transition={{ duration: 0.22, delay: 0.22, ease: 'easeOut' }}
                style={{
                  transformOrigin: 'top center',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                }}
                className="absolute bottom-0 left-0 w-full h-1/2 z-20"
              >
                <CardHalf
                  value={nextVal}
                  position="bottom"
                  isDays={isDaysUnit}
                  dark={dark}
                />
              </motion.div>
            </>
          )}

          {/* Center Mechanical Split Groove & Horizontal Line */}
          <div
            className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] sm:h-[1.5px] ${
              dark
                ? 'bg-[#020509] shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
                : 'bg-black/15 shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
            } z-25 pointer-events-none`}
          />
        </div>
      </div>

      {/* Label */}
      <span
        className={`font-mono text-[9px] min-[350px]:text-[10px] min-[480px]:text-xs sm:text-xs md:text-sm tracking-[0.24em] ${
          dark ? 'text-cyan-400 font-bold drop-shadow-[0_0_8px_rgba(51,204,221,0.3)]' : 'text-[#444444] font-bold'
        } uppercase mt-2.5 sm:mt-4`}
      >
        {label}
      </span>
    </div>
  )
}
