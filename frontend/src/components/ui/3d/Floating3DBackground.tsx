'use client'

import React, { useRef, useMemo, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { Bot, Zap, Sparkles, MessageSquare, Shield, Smartphone, LucideIcon } from 'lucide-react'

/**
 * Floating3DBackground Component
 * 
 * A background component with 3D floating elements that react to mouse and scroll.
 * 
 * Props:
 * - children: The content to be rendered on top of the background.
 * - intensity: Movement intensity (default: 1.0).
 * - density: Number of floating elements (default: 10).
 */

const iconList = [Bot, Zap, Sparkles, MessageSquare, Shield, Smartphone]

interface FloatingElementData {
  id: number
  Icon: LucideIcon
  size: number
  initialX: number
  initialY: number
  duration: number
  delay: number
  speed: number
  rotateSpeed: number
}

interface Floating3DBackgroundProps {
  children: React.ReactNode
  intensity?: number
  density?: number
}

interface FloatingElementProps {
  el: FloatingElementData
  scrollYProgress: MotionValue<number>
}

const FloatingElement: React.FC<FloatingElementProps> = ({ el, scrollYProgress }) => {
  // Use numeric pixels instead of percentage strings for y transform to be safer
  const yTransform = useTransform(scrollYProgress, [0, 1], [0, el.speed * 400])
  const rotateTransform = useTransform(scrollYProgress, [0, 1], [0, el.rotateSpeed])

  const IconComponent = el.Icon

  if (!IconComponent) return null

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${el.initialX}%`,
        top: `${el.initialY}%`,
        y: yTransform,
        rotate: rotateTransform,
        opacity: 0.05,
        willChange: 'transform',
      }}
      animate={{
        x: [0, 20, -20, 0],
        y: [0, -30, 30, 0],
        rotateZ: [0, 10, -10, 0],
      }}
      transition={{
        duration: el.duration * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: el.delay,
      }}
    >
      <IconComponent size={el.size} />
    </motion.div>
  )
}

export const Floating3DBackground: React.FC<Floating3DBackgroundProps> = ({
  children,
  intensity = 1.0,
  density = 10,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Generate deterministic positions and animations for icons
  const elements = useMemo(() => {
    return Array.from({ length: density }).map((_, i) => {
      const Icon = iconList[i % iconList.length]
      const size = Math.floor(Math.random() * 20) + 20
      const initialX = Math.floor(Math.random() * 100)
      const initialY = Math.floor(Math.random() * 100)
      const duration = Math.random() * 5 + 5
      const delay = Math.random() * 5
      const speed = (Math.random() - 0.5) * 2 * intensity
      const rotateSpeed = (Math.random() - 0.5) * 360

      return {
        id: i,
        Icon,
        size,
        initialX,
        initialY,
        duration,
        delay,
        speed,
        rotateSpeed,
      } as FloatingElementData
    })
  }, [density, intensity])

  return (
    <div ref={containerRef} className="relative w-full min-h-screen overflow-hidden bg-[#F4F4F5]">
      {/* Floating Elements Layer - Render only after mounting to avoid hydration/ref errors */}
      {isMounted && !isMobile && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {elements.map((el) => (
            <FloatingElement key={el.id} el={el} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
