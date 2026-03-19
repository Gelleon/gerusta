'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bot, Smartphone, Headset, Check, Zap } from 'lucide-react'
import { TiltCard } from '@/components/ui/3d/TiltCard'

const services = [
  {
    title: 'Разработка ботов в Telegram',
    description: 'Создаем Telegram-ботов для продаж, поддержки клиентов и автоматизации бизнес-процессов',
    icon: Bot,
    features: [
      'Готовое решение за 3-7 дней',
      'Нативный, вписывается в мессенджер',
      'Гибкая настройка под задачи',
      'от 10 000',
    ],
    href: '/razrabotka-telegram-botov',
    buttonText: 'Подробнее',
    isPopular: false,
  },
  {
    title: 'Разработка WebApp в Telegram',
    description: 'Создаем мини-приложения прямо в Telegram: магазины, сервисы, игры и полноценные платформы',
    icon: Smartphone,
    features: [
      'Отдельное приложение внутри Telegram',
      'Идеально для большого функционала',
      'Без ограничений по дизайну',
      'От 30 000 ₽ и 3 дней',
    ],
    href: '/telegram-web-app-razrabotka',
    buttonText: 'Подробнее',
    isPopular: true,
  },
  {
    title: 'Поддержка и обслуживание',
    description: 'Полное техническое сопровождение, обновления и доработки ваших ботов',
    icon: Headset,
    features: [
      '24/7 мониторинг',
      'Быстрое реагирование на критические ситуации',
      'Регулярные обновления',
      'От 5 000 ₽ в месяц',
    ],
    href: '/podderzhka-telegram-botov',
    buttonText: 'Подробнее',
    isPopular: false,
  },
]

export default function Services() {
  return (
    <section id="services" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tg-blue/5 text-tg-blue text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Zap className="w-3 h-3" />
            Наши возможности
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black mb-6 text-[#222222]"
          >
            Что мы умеем
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-[#707579] font-medium"
          >
            Комплексные решения для автоматизации вашего бизнеса в экосистеме Telegram
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {services.map((service, index) => (
            <TiltCard
              key={index}
              maxTilt={10}
              scale={1.03}
              className="flex"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative tg-card flex flex-col w-full h-full ${
                  service.isPopular ? 'ring-2 ring-tg-blue border-transparent' : 'border border-slate-100'
                }`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {service.isPopular && (
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tg-blue text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    Популярно
                  </div>
                )}

                <div className="mb-8" style={{ transform: 'translateZ(30px)' }}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                    service.isPopular ? 'bg-tg-blue text-white' : 'bg-slate-50 text-tg-blue'
                  }`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-[#222222]">{service.title}</h3>
                  <p className="text-[#707579] font-medium leading-relaxed">{service.description}</p>
                </div>

                <div className="space-y-4 mb-8 flex-grow" style={{ transform: 'translateZ(20px)' }}>
                  {service.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        service.isPopular ? 'bg-tg-blue/10 text-tg-blue' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <Check className="w-3 h-3 font-bold" />
                      </div>
                      <span className="text-sm font-bold text-[#222222]">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-3" style={{ transform: 'translateZ(40px)' }}>
                  <Link
                    href={service.href}
                    className={`w-full py-4 rounded-2xl font-black transition-all shadow-sm active:scale-[0.98] flex items-center justify-center ${
                      service.isPopular
                        ? 'bg-tg-blue text-white hover:bg-tg-blue/90 hover:shadow-lg hover:shadow-tg-blue/20'
                        : 'bg-slate-50 text-[#222222] hover:bg-slate-100'
                    }`}
                  >
                    {service.buttonText}
                  </Link>
                  <a
                    href="https://t.me/ar_semenov23"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-4 rounded-2xl font-black transition-all shadow-sm active:scale-[0.98] flex items-center justify-center ${
                    service.isPopular 
                        ? 'bg-white text-tg-blue hover:bg-slate-100'
                        : 'bg-tg-blue text-white hover:bg-tg-blue/90'
                  }`}
                >
                    Заказать в Telegram
                  </a>
                </div>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
