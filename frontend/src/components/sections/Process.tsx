'use client'

import { motion } from 'framer-motion'
import { MessageSquare, FileText, Code, Rocket, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    title: 'Обсуждение идеи',
    description: 'Анализируем ваши бизнес-процессы и предлагаем оптимальное решение для Telegram.',
    icon: MessageSquare,
  },
  {
    title: 'Техническое задание',
    description: 'Детально описываем функционал, логику работы бота и интерфейс Mini App.',
    icon: FileText,
  },
  {
    title: 'Разработка и тесты',
    description: 'Пишем чистый код, подключаем API и проводим тщательное тестирование.',
    icon: Code,
  },
  {
    title: 'Запуск и поддержка',
    description: 'Деплоим проект, настраиваем серверы и обеспечиваем стабильную работу 24/7.',
    icon: Rocket,
  },
]

export default function Process() {
  return (
    <section id="process" className="py-24 bg-[#F4F4F5] relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tg-blue/5 text-tg-blue text-xs font-bold uppercase tracking-wider mb-4"
          >
            <CheckCircle2 className="w-3 h-3" />
            Как мы работаем
          </motion.div>
          <h2 className="text-4xl lg:text-5xl font-black mb-6 text-[#222222]">
            Путь к вашему проекту
          </h2>
          <p className="text-lg text-[#707579] font-medium">
            Прозрачный процесс разработки от первого сообщения до готового продукта
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Hidden on mobile) */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 hidden lg:block" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  <step.icon className="w-8 h-8 text-tg-blue" />
                </div>
                
                {index < steps.length - 1 && (
                  <div className="absolute top-8 -right-4 hidden lg:block text-slate-300">
                    {/* Placeholder for visual link */}
                  </div>
                )}

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm w-full h-full flex flex-col items-center">
                  <div className="text-xs font-black text-tg-blue uppercase tracking-widest mb-2">Шаг 0{index + 1}</div>
                  <h3 className="text-xl font-black mb-3 text-[#222222] leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#707579] leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
