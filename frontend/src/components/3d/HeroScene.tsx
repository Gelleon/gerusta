'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Particles() {
  const ref = useRef<THREE.Points>(null!)
  const stride = 3
  const count = 2000
  const positions = useMemo(() => {
    const arr = new Float32Array(count * stride)
    const rnd = mulberry32(123456789)

    for (let i = 0; i < count; i++) {
      arr[i * stride] = (rnd() - 0.5) * 15
      arr[i * stride + 1] = (rnd() - 0.5) * 15
      arr[i * stride + 2] = (rnd() - 0.5) * 15
    }
    return arr
  }, [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.02
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={stride} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6366F1"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.4}
      />
    </Points>
  )
}

function FloatingOrb() {
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere args={[1.2, 100, 100]}>
        <MeshDistortMaterial
          color="#6366F1"
          attach="material"
          distort={0.3}
          speed={1}
          roughness={0.1}
          metalness={0.2}
          transparent
          opacity={0.15}
        />
      </Sphere>
    </Float>
  )
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#6366F1" />
        <FloatingOrb />
        <Particles />
      </Canvas>
    </div>
  )
}
