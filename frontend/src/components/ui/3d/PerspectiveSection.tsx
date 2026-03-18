'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface PerspectiveSectionProps {
  children: React.ReactNode
  className?: string
  rotationIntensity?: number
  scaleIntensity?: number
}

export const PerspectiveSection: React.FC<PerspectiveSectionProps> = ({
  children,
  className = '',
  rotationIntensity = 10,
  scaleIntensity = 0.95,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [rotationIntensity, 0, -rotationIntensity])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [scaleIntensity, 1, scaleIntensity])

  const rotateXSpring = useSpring(rotateX, { stiffness: 100, damping: 30 })
  const scaleSpring = useSpring(scale, { stiffness: 100, damping: 30 })

  return (
    <div ref={containerRef} className={`perspective-[2000px] overflow-visible ${className}`}>
      <motion.div
        style={{
          rotateX: rotateXSpring,
          scale: scaleSpring,
          transformStyle: 'preserve-3d',
        }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  )
}
