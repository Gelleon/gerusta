'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Wow3DCard } from '@/components/ui/3d/Wow3DCard'
import { ParallaxLayer } from '@/components/ui/3d/ParallaxLayer'
import { PerspectiveSection } from '@/components/ui/3d/PerspectiveSection'
import { Floating3DBackground } from '@/components/ui/3d/Floating3DBackground'
import { Bot, Zap, Sparkles, Shield, MousePointer2, Layers, Cpu, Globe, Rocket } from 'lucide-react'
import Link from 'next/link'

/**
 * AnimationsPage Showcase
 * 
 * This page demonstrates 6+ types of high-performance 3D animations 
 * used throughout the Gerusta project.
 * 
 * Features demonstrated:
 * 1. Interactive 3D Tilt with Glare (Wow3DCard)
 * 2. Multi-layer Parallax (ParallaxLayer)
 * 3. Perspective Section Transitions (PerspectiveSection)
 * 4. Layered 3D Pop-out Effects (preserve-3d + translateZ)
 * 5. Floating 3D Background (Floating3DBackground)
 * 6. Procedural 3D Motion (motion.div)
 */

export default function AnimationsPage() {
  return (
    <Floating3DBackground intensity={1.5} density={15}>
      <main className="min-h-screen py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-6xl font-black mb-6 text-[#222222] tracking-tight">
                3D Animation <span className="text-tg-blue">Showcase</span>
              </h1>
              <p className="text-xl text-[#707579] font-medium leading-relaxed">
                Демонстрация передовых 3D-эффектов, реализованных для проекта Gerusta. 
                Все анимации оптимизированы для 60fps и имеют мобильные fallback-режимы.
              </p>
            </motion.div>
          </div>

          <div className="space-y-40">
            {/* 1. Interactive 3D Tilt with Glare */}
            <section>
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                <div>
                  <h2 className="text-3xl font-black flex items-center gap-4 text-[#222222]">
                    <div className="w-12 h-12 bg-tg-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-tg-blue/20">1</div>
                    Interactive 3D Tilt & Glare
                  </h2>
                  <p className="text-[#707579] font-medium mt-2 ml-16 max-w-xl">
                    Использование `Wow3DCard` для создания эффекта наклона и реалистичного блика, 
                    который следует за курсором.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-tg-blue uppercase tracking-widest bg-tg-blue/5 px-4 py-2 rounded-full">
                  <MousePointer2 size={14} /> Hover to interact
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-10">
                {[
                  { icon: <Bot size={32} />, title: "AI Integration", color: "from-blue-500/10 to-cyan-500/10" },
                  { icon: <Zap size={32} />, title: "Fast Performance", color: "from-amber-500/10 to-orange-500/10" },
                  { icon: <Sparkles size={32} />, title: "Premium Design", color: "from-purple-500/10 to-pink-500/10" }
                ].map((item, i) => (
                  <Wow3DCard key={i} maxTilt={15} scale={1.05} className="rounded-[2.5rem]">
                    <div className={`w-full h-80 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center p-10 text-center group bg-gradient-to-br ${item.color}`}>
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-tg-blue mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                        {item.icon}
                      </div>
                      <h3 className="text-2xl font-black text-[#222222]">{item.title}</h3>
                      <p className="text-[#707579] mt-3 font-medium leading-snug">
                        Hardware accelerated 3D transform with dynamic glare effect.
                      </p>
                    </div>
                  </Wow3DCard>
                ))}
              </div>
            </section>

            {/* 2. Layered 3D Pop-out */}
            <section>
              <div className="mb-12">
                <h2 className="text-3xl font-black flex items-center gap-4 text-[#222222]">
                  <div className="w-12 h-12 bg-tg-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-tg-blue/20">2</div>
                  Layered 3D Pop-out
                </h2>
                <p className="text-[#707579] font-medium mt-2 ml-16 max-w-xl">
                  Использование `transform-style: preserve-3d` и `translateZ` для создания 
                  реальной глубины между элементами внутри карты.
                </p>
              </div>

              <div className="flex justify-center">
                <Wow3DCard maxTilt={12} scale={1.02} className="w-full max-w-2xl">
                  <div className="w-full aspect-video bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 relative overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                    {/* Background decoration with Z-depth */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-tg-blue/5 rounded-full blur-3xl" style={{ transform: 'translateZ(-20px)' }} />
                    
                    <div className="relative z-10 h-full flex flex-col justify-between" style={{ transformStyle: 'preserve-3d' }}>
                      <div style={{ transform: 'translateZ(50px)' }}>
                        <div className="w-16 h-16 bg-tg-blue rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl shadow-tg-blue/30">
                          <Layers size={32} />
                        </div>
                        <h3 className="text-4xl font-black text-[#222222] mb-4">Depth Layers</h3>
                        <p className="text-xl text-[#707579] font-medium max-w-md">
                          Notice how the elements move at different speeds relative to the background.
                        </p>
                      </div>

                      <div className="flex gap-4 self-end" style={{ transformStyle: 'preserve-3d' }}>
                        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100" style={{ transform: 'translateZ(80px)' }}>
                          <div className="text-xs font-black text-tg-blue uppercase tracking-widest mb-1">Layer 1</div>
                          <div className="text-lg font-black text-[#222222]">Z: 80px</div>
                        </div>
                        <div className="bg-tg-blue p-6 rounded-3xl shadow-xl text-white" style={{ transform: 'translateZ(120px)' }}>
                          <div className="text-xs font-black opacity-70 uppercase tracking-widest mb-1">Layer 2</div>
                          <div className="text-lg font-black">Z: 120px</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Wow3DCard>
              </div>
            </section>

            {/* 3. Perspective Section Transition */}
            <section>
              <div className="mb-12">
                <h2 className="text-3xl font-black flex items-center gap-4 text-[#222222]">
                  <div className="w-12 h-12 bg-tg-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-tg-blue/20">3</div>
                  Perspective Scroll Transition
                </h2>
                <p className="text-[#707579] font-medium mt-2 ml-16 max-w-xl">
                  Секции плавно наклоняются при скролле, создавая эффект &quot;пролета&quot; через контент.
                </p>
              </div>

              <PerspectiveSection rotationIntensity={10} scaleIntensity={0.95} className="h-[500px]">
                <div className="w-full h-full bg-gradient-to-br from-[#222222] to-[#444444] rounded-[4rem] shadow-2xl flex flex-col items-center justify-center text-white p-12 text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="grid grid-cols-8 gap-4 rotate-12 scale-150">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="aspect-square border border-white/20 rounded-lg" />
                      ))}
                    </div>
                  </div>
                  
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="mb-8 text-tg-blue"
                  >
                    <Cpu size={80} strokeWidth={1} />
                  </motion.div>
                  
                  <h3 className="text-5xl font-black mb-6">Scroll Reactive 3D</h3>
                  <p className="text-xl opacity-70 max-w-2xl font-medium leading-relaxed">
                    Эта технология позволяет динамически изменять перспективу всей секции 
                    в зависимости от положения скролла пользователя.
                  </p>
                </div>
              </PerspectiveSection>
            </section>

            {/* 4. Multi-layer Parallax (Scroll) */}
            <section>
              <div className="mb-12">
                <h2 className="text-3xl font-black flex items-center gap-4 text-[#222222]">
                  <div className="w-12 h-12 bg-tg-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-tg-blue/20">4</div>
                  Multi-layer Parallax
                </h2>
                <p className="text-[#707579] font-medium mt-2 ml-16 max-w-xl">
                  Классический параллакс с несколькими слоями, движущимися с разной скоростью.
                </p>
              </div>

              <div className="relative h-[500px] bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
                {/* Background layers */}
                <ParallaxLayer speed={-0.3} offset={50} className="absolute left-20 top-20 opacity-20">
                  <Globe size={200} className="text-tg-blue" />
                </ParallaxLayer>
                
                <ParallaxLayer speed={-0.1} offset={100} className="absolute right-20 bottom-10 opacity-10">
                  <Bot size={300} className="text-[#222222]" />
                </ParallaxLayer>

                {/* Content layers */}
                <div className="relative z-20 flex flex-col items-center">
                  <ParallaxLayer speed={0.4} offset={150}>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-50 flex items-center gap-6 max-w-md">
                      <div className="w-16 h-16 bg-tg-blue rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Rocket size={32} />
                      </div>
                      <div>
                        <div className="text-2xl font-black text-[#222222]">Foreground</div>
                        <div className="text-[#707579] font-medium">Fastest movement (speed: 0.4)</div>
                      </div>
                    </div>
                  </ParallaxLayer>

                  <div className="mt-8">
                    <ParallaxLayer speed={0.15} offset={50}>
                      <div className="bg-slate-50 px-8 py-4 rounded-2xl border border-slate-100 text-lg font-bold text-[#707579]">
                        Middle Ground (speed: 0.15)
                      </div>
                    </ParallaxLayer>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Floating 3D Background */}
            <section>
              <div className="mb-12">
                <h2 className="text-3xl font-black flex items-center gap-4 text-[#222222]">
                  <div className="w-12 h-12 bg-tg-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-tg-blue/20">5</div>
                  Floating 3D Background
                </h2>
                <p className="text-[#707579] font-medium mt-2 ml-16 max-w-xl">
                  Интеллектуальный фон с плавающими 3D-иконками, которые реагируют на скролл 
                  и имеют процедурную анимацию.
                </p>
              </div>

              <div className="p-20 bg-slate-900 rounded-[4rem] text-center text-white relative overflow-hidden group">
                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                  {/* Procedural icons inside a contained space */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      style={{
                        position: 'absolute',
                        left: `${(i * 15) + 5}%`,
                        top: `${(i % 3) * 30 + 10}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 0.9, 1]
                      }}
                      transition={{
                        duration: 5 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.4
                      }}
                    >
                      <Bot size={40 + i * 5} className="text-tg-blue opacity-20" />
                    </motion.div>
                  ))}
                </div>

                <div className="relative z-10">
                  <h3 className="text-4xl font-black mb-6">Interactive Environment</h3>
                  <p className="text-xl opacity-60 max-w-xl mx-auto font-medium mb-10">
                    Background elements are deterministic but feel organic through 
                    varying animation timings and scroll offsets.
                  </p>
                  <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 font-black uppercase tracking-widest text-sm">
                    <Sparkles size={18} className="text-tg-blue" /> Dynamic Scene
                  </div>
                </div>
              </div>
            </section>

            {/* 6. Performance & Optimization */}
            <section className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-xl">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-4xl font-black text-[#222222] mb-8 leading-tight">
                    Technical <br /><span className="text-tg-blue">Excellence</span>
                  </h2>
                  <div className="space-y-6">
                    {[
                      { title: "Hardware Acceleration", desc: "Использование GPU через `will-change: transform` для плавности 60fps." },
                      { title: "Mobile Optimized", desc: "Автоматическое отключение тяжелых 3D-эффектов на мобильных устройствах." },
                      { title: "Spring Physics", desc: "Плавные инерционные движения через `framer-motion` spring-анимации." },
                      { title: "Semantic HTML", desc: "Анимации не нарушают структуру и SEO доступность контента." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-tg-blue/10 flex items-center justify-center shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-tg-blue" />
                        </div>
                        <div>
                          <div className="font-black text-[#222222] mb-1">{item.title}</div>
                          <div className="text-[#707579] text-sm font-medium">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-slate-50 rounded-[3rem] flex items-center justify-center border border-slate-100 overflow-hidden">
                    <motion.div
                      animate={{ 
                        rotateY: [0, 360],
                        rotateX: [0, 10, -10, 0]
                      }}
                      transition={{ 
                        duration: 10, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                      className="text-tg-blue"
                    >
                      <Shield size={160} strokeWidth={1} />
                    </motion.div>
                  </div>
                  {/* Decorative badges */}
                  <div className="absolute -top-4 -right-4 bg-tg-blue text-white px-6 py-3 rounded-2xl font-black shadow-xl rotate-12">
                    60 FPS
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-[#222222] text-white px-6 py-3 rounded-2xl font-black shadow-xl -rotate-6">
                    WEBGL-LIKE
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-40 text-center pb-20">
            <Link 
              href="/blog"
              className="group inline-flex items-center gap-4 bg-[#222222] text-white px-12 py-5 rounded-[2rem] text-xl font-black hover:bg-tg-blue transition-colors duration-300 shadow-2xl"
            >
              Перейти в Блог <Rocket className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </main>
    </Floating3DBackground>
  )
}
