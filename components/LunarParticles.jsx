'use client'

import { useEffect, useRef } from 'react'

export default function LunarParticles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame
    let particles = []

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    }

    const isTouch =
      window.matchMedia('(hover: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches

    const settings = isTouch
      ? {
          count: 120,
          mouseRadius: 100,
        }
      : {
          count: 350,
          mouseRadius: 170,
        }

    function resize() {
      const width = window.innerWidth
      const height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr

      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      createParticles(width, height)
    }

    function createParticles(width, height) {
      particles = []

      for (let i = 0; i < settings.count; i++) {
        const larger = Math.random() < 0.1

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,

          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,

          size: larger
            ? Math.random() * 1.5 + 1
            : Math.random() * 0.9 + 0.5,

          opacity: larger
            ? Math.random() * 0.25 + 0.55
            : Math.random() * 0.2 + 0.35,

          pulse: Math.random() * Math.PI * 2,

          pulseSpeed:
            Math.random() * 0.01 + 0.003,
        })
      }
    }

    function updateParticle(
      particle,
      width,
      height
    ) {
      particle.pulse += particle.pulseSpeed

      particle.x += particle.vx
      particle.y += particle.vy

      // Cursor repulsion
      if (mouse.active) {
        const dx = particle.x - mouse.x
        const dy = particle.y - mouse.y

        const distance = Math.sqrt(
          dx * dx + dy * dy
        )

        if (
          distance < settings.mouseRadius &&
          distance > 0
        ) {
          const force =
            (settings.mouseRadius - distance) /
            settings.mouseRadius

          const angle = Math.atan2(dy, dx)

          particle.x +=
            Math.cos(angle) *
            force *
            1.5

          particle.y +=
            Math.sin(angle) *
            force *
            1.5
        }
      }

      // Wrap around
      if (particle.x < 0) {
        particle.x = width
      }

      if (particle.x > width) {
        particle.x = 0
      }

      if (particle.y < 0) {
        particle.y = height
      }

      if (particle.y > height) {
        particle.y = 0
      }
    }

    function drawParticle(particle) {
      const pulse =
        0.9 +
        Math.sin(particle.pulse) * 0.1

      ctx.beginPath()

      ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      )

      ctx.fillStyle = `rgba(245, 240, 230, ${
        particle.opacity * pulse
      })`

      ctx.fill()
    }

    function drawMouseGlow() {
      if (!mouse.active || isTouch) return

      const gradient =
        ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          settings.mouseRadius
        )

      gradient.addColorStop(
        0,
        'rgba(180, 75, 45, 0.08)'
      )

      gradient.addColorStop(
        0.4,
        'rgba(180, 75, 45, 0.03)'
      )

      gradient.addColorStop(
        1,
        'rgba(180, 75, 45, 0)'
      )

      ctx.fillStyle = gradient

      ctx.fillRect(
        mouse.x - settings.mouseRadius,
        mouse.y - settings.mouseRadius,
        settings.mouseRadius * 2,
        settings.mouseRadius * 2
      )
    }

    function animate() {
      const width = window.innerWidth
      const height = window.innerHeight

      ctx.clearRect(
        0,
        0,
        width,
        height
      )

      for (const particle of particles) {
        updateParticle(
          particle,
          width,
          height
        )

        drawParticle(particle)
      }

      drawMouseGlow()

      animationFrame =
        requestAnimationFrame(animate)
    }

    function handleMouseMove(event) {
      mouse.x = event.clientX
      mouse.y = event.clientY
      mouse.active = true
    }

    function handleMouseLeave() {
      mouse.active = false
    }

    resize()

    window.addEventListener(
      'resize',
      resize
    )

    window.addEventListener(
      'mousemove',
      handleMouseMove
    )

    window.addEventListener(
      'mouseleave',
      handleMouseLeave
    )

    animate()

    return () => {
      cancelAnimationFrame(
        animationFrame
      )

      window.removeEventListener(
        'resize',
        resize
      )

      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      window.removeEventListener(
        'mouseleave',
        handleMouseLeave
      )
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    />
  )
}