'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

interface ParallaxLayerProps {
  children: React.ReactNode
  offset?: number
  className?: string
  speed?: number
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  offset = 0,
  className = '',
  speed = 0.5,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [-offset * speed, offset * speed])
  const ySpring = useSpring(y, { stiffness: 100, damping: 30 })

  return (
    <motion.div
      ref={ref}
      style={{ y: ySpring }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}
