'use client'

import { motion } from 'framer-motion'
import { Send, Check, Shield, Zap, Bot, MessageSquare, Sparkles } from 'lucide-react'
import { TiltCard } from '@/components/ui/3d/TiltCard'
import { ParallaxLayer } from '@/components/ui/3d/ParallaxLayer'
import HeroScene from '@/components/3d/HeroScene'

const stats = [
  { value: '100+', label: 'Проектов', icon: Bot },
  { value: '50+', label: 'Клиентов', icon: Zap },
  { value: '24/7', label: 'Поддержка', icon: Shield },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col justify-center overflow-hidden bg-[#F4F4F5]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-tg-blue rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-tg-light-blue rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-8 border border-slate-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-600 tracking-wide uppercase">
                Telegram Bot Studio
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 text-[#222222]">
              Ваш бизнес в <br />
              <span className="text-tg-blue">Telegram</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-[#707579] mb-10 max-w-lg leading-relaxed font-medium">
              Создаем профессиональные решения: от простых ботов-визиток 
              до сложных Mini Apps и AI-консультантов. 
              Масштабируйте продажи прямо в мессенджере.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-tg px-10 py-4 text-lg hover:shadow-lg hover:shadow-tg-blue/20 transition-all">
                <Send className="w-5 h-5 -rotate-12" />
                Начать проект
              </button>
              <button className="btn-tg-outline px-10 py-4 text-lg hover:bg-white transition-all">
                Наши кейсы
              </button>
            </div>
          </motion.div>

          {/* Right: Telegram UI Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <TiltCard className="relative z-10" maxTilt={10} scale={1.02}>
              <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-4 shadow-2xl h-[560px] flex flex-col overflow-hidden">
                {/* Phone Status Bar */}
                <div className="flex justify-between items-center px-8 pt-4 mb-8">
                  <span className="font-bold text-sm text-[#222222]">9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                    <div className="w-4 h-2 bg-slate-400 rounded-full" />
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-grow flex flex-col gap-4 px-4 overflow-hidden">
                  <ParallaxLayer speed={0.1} offset={20}>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="tg-bubble tg-bubble-in self-start shadow-sm"
                    >
                      <p className="text-sm font-medium text-[#222222]">Здравствуйте! 👋 Мне нужен бот для автоматизации записи на услуги.</p>
                      <span className="text-[10px] text-[#707579] mt-1 block text-right">10:02</span>
                    </motion.div>
                  </ParallaxLayer>

                  <ParallaxLayer speed={0.2} offset={40}>
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.8 }}
                      className="tg-bubble tg-bubble-out self-end shadow-sm"
                    >
                      <p className="text-sm font-medium">Привет! Конечно, мы можем реализовать это через Telegram Mini App с календарем и оплатой. 🚀</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-60 block">10:03</span>
                        <Check className="w-3 h-3 text-tg-blue" />
                      </div>
                    </motion.div>
                  </ParallaxLayer>

                  <ParallaxLayer speed={0.3} offset={60}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.5 }}
                      className="mt-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-lg"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-tg-blue rounded-xl flex items-center justify-center text-white shadow-md">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#222222]">Mini App Preview</h4>
                          <p className="text-xs text-[#707579]">Booking System v2.0</p>
                        </div>
                      </div>
                      <div className="h-24 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                        Интерфейс приложения
                      </div>
                    </motion.div>
                  </ParallaxLayer>
                </div>

                {/* Bottom Input Area */}
                <div className="p-4 mt-auto">
                  <div className="bg-slate-100/80 rounded-2xl p-3 flex items-center justify-between text-[#707579]">
                    <span className="text-sm ml-2 font-medium">Сообщение...</span>
                    <div className="w-8 h-8 bg-tg-blue rounded-full flex items-center justify-center text-white shadow-md">
                      <Send className="w-4 h-4 -rotate-12" />
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Floating Icons around the phone */}
            <ParallaxLayer speed={-0.2} offset={100} className="absolute -top-10 -right-6 z-20">
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50"
              >
                <Zap className="w-10 h-10 text-amber-400" />
              </motion.div>
            </ParallaxLayer>

            <ParallaxLayer speed={0.4} offset={80} className="absolute top-1/2 -left-12 z-20">
              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50"
              >
                <MessageSquare className="w-8 h-8 text-tg-blue" />
              </motion.div>
            </ParallaxLayer>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="mt-24 pt-12 border-t border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-3 mb-2">
                  <stat.icon className="w-6 h-6 text-tg-blue" />
                  <span className="text-4xl font-black text-[#222222]">{stat.value}</span>
                </div>
                <span className="text-sm font-bold text-[#707579] uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
