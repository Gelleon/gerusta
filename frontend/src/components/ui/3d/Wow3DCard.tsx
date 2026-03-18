'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

/**
 * Wow3DCard Component Documentation
 * 
 * A high-performance 3D card component with multi-layer parallax support.
 * 
 * Props:
 * - children: The content of the card.
 * - className: Custom classes for the container.
 * - maxTilt: Maximum rotation in degrees (default: 15).
 * - scale: Scale factor on hover (default: 1.05).
 * - perspective: CSS perspective value (default: 1000).
 * - glareEnabled: Whether to show a glare effect (default: true).
 * - layers: Optional array of layers with different Z-depths.
 * 
 * Usage for Layered Effect:
 * <Wow3DCard>
 *   <div style={{ transform: 'translateZ(20px)' }}>Background</div>
 *   <div style={{ transform: 'translateZ(50px)' }}>Foreground</div>
 * </Wow3DCard>
 * 
 * Optimization: Uses hardware acceleration via will-change and framer-motion's optimized transforms.
 */

interface Wow3DCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  scale?: number
  perspective?: number
  glareEnabled?: boolean
}

export const Wow3DCard: React.FC<Wow3DCardProps> = ({
  children,
  className = '',
  maxTilt = 12,
  scale = 1.02,
  perspective = 1200,
  glareEnabled = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile to disable tilt for performance and UX
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt])
  
  // Glare effect transforms
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%'])
  const glareOpacity = useTransform(
    [mouseXSpring, mouseYSpring],
    ([xVal, yVal]) => {
      const distance = Math.sqrt(Math.pow(xVal as number, 2) + Math.pow(yVal as number, 2))
      return Math.min(distance * 0.6, 0.3)
    }
  )

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return

    const rect = cardRef.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }, [x, y, isMobile])

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isMobile ? 0 : rotateX,
        rotateY: isMobile ? 0 : rotateY,
        transformStyle: 'preserve-3d',
        perspective: `${perspective}px`,
      }}
      whileHover={{ scale: isMobile ? 1 : scale }}
      className={`relative group will-change-transform transition-shadow duration-500 ${
        isHovered ? 'shadow-2xl' : 'shadow-sm'
      } ${className}`}
    >
      {/* Glare Effect */}
      {glareEnabled && !isMobile && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8) 0%, transparent 80%)`,
            opacity: glareOpacity,
            zIndex: 50,
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {children}
      </div>

      {/* Shadow Fallback / Depth Indicator */}
      <div 
        className="absolute inset-0 bg-black/5 blur-xl -z-10 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{ transform: 'translateZ(-20px)' }}
      />
    </motion.div>
  )
}
