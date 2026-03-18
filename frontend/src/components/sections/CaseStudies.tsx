'use client'

import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight, TrendingUp, Users, Target } from 'lucide-react'

const cases = [
  {
    title: 'CryptoTrade Bot',
    category: 'Финтех',
    description: 'Торговый бот с интеграцией Binance API и системой уведомлений о сигналах.',
    image: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    stats: { label: 'Прибыль', value: '+45%' },
    tags: ['Trading', 'Binance', 'Nest.js'],
  },
  {
    title: 'FoodFlow App',
    category: 'E-commerce',
    description: 'Mini App для заказа еды с корзиной, оплатой и отслеживанием курьера.',
    image: 'bg-gradient-to-br from-violet-500 to-purple-600',
    stats: { label: 'Заказы', value: '1500+' },
    tags: ['TWA', 'Payments', 'Next.js'],
  },
  {
    title: 'SupportAI',
    category: 'Автоматизация',
    description: 'Умная поддержка на базе GPT-4, сократившая нагрузку на операторов на 80%.',
    image: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    stats: { label: 'Экономия', value: '80%' },
    tags: ['AI', 'GPT-4', 'Automation'],
  },
]

export default function CaseStudies() {
  return (
    <section id="cases" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-black mb-6 text-[#222222]"
            >
              Наши <span className="gradient-text">Кейсы</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#707579] font-medium"
            >
              Посмотрите на реальные примеры того, как наши решения помогают бизнесу 
              расти и автоматизировать рутинные процессы.
            </motion.p>
          </div>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-tg-blue font-black hover:gap-3 transition-all uppercase tracking-widest text-sm"
          >
            Все проекты <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {cases.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="sky-card group overflow-hidden rounded-3xl"
            >
              {/* Mockup Image Area */}
              <div className={`h-64 ${project.image} relative flex items-center justify-center p-8`}>
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                <div className="w-full h-full bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {project.title}
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-tg-blue px-3 py-1 bg-tg-blue/5 rounded-full uppercase tracking-widest">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                    <TrendingUp className="w-4 h-4" />
                    {project.stats.value}
                  </div>
                </div>
                
                <h3 className="text-2xl font-black mb-3 group-hover:text-tg-blue transition-colors text-[#222222]">
                  {project.title}
                </h3>
                <p className="text-sm text-[#707579] mb-6 line-clamp-2 font-medium">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tIndex) => (
                    <span key={tIndex} className="text-[10px] font-bold text-[#707579] bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
