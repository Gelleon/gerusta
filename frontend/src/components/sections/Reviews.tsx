'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Андрей, e-commerce',
    text: 'Запустили Telegram-бота для интернет-магазина и получили заметный рост повторных заказов уже в первый месяц. Команда быстро включилась и довела проект до результата.',
  },
  {
    name: 'Марина, сеть студий',
    text: 'Бот для записи клиентов сократил нагрузку на администраторов и уменьшил количество пропусков. Особенно понравился понятный процесс и поддержка после релиза.',
  },
  {
    name: 'Дмитрий, SaaS-компания',
    text: 'Интеграция Telegram-бота с CRM ускорила квалификацию лидов и повысила конверсию. Все этапы были прозрачными, а решения — ориентированными на метрики.',
  },
]

export default function Reviews() {
  return (
    <section id="reviews" className="py-24 bg-[#F4F4F5]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-4xl lg:text-5xl font-black text-[#222222] mb-5">
            Отзывы <span className="text-tg-blue">клиентов</span>
          </h2>
          <p className="text-lg text-[#707579] font-medium">
            Реальные оценки проектов по разработке Telegram-ботов, автоматизации и поддержке.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-7">
          {reviews.map((review, index) => (
            <motion.article
              key={review.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-3xl border border-slate-200 bg-white p-7"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <Quote className="h-5 w-5 text-tg-blue" />
              </div>
              <p className="text-[#222222] font-medium leading-7 mb-5">{review.text}</p>
              <p className="text-sm font-black text-[#707579] uppercase tracking-widest">{review.name}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
