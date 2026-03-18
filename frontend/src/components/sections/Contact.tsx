'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Check, MessageCircle, Bot, Zap, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'

const formSchema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  telegram: z.string().min(2, 'Укажите ваш @username'),
  project: z.string().min(10, 'Опишите проект подробнее'),
})

type FormData = z.infer<typeof formSchema>

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  const { register, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange'
  })

  const formValues = watch()

  const onSubmit = async (data: FormData) => {
    // Construct the Telegram message
    const message = `
👋 Новая заявка с сайта!

👤 Имя: ${data.name}
📱 Telegram: ${data.telegram}
📝 Задача:
${data.project}
    `.trim()

    // Encode the message for the URL
    const encodedMessage = encodeURIComponent(message)
    
    // Redirect to Telegram with the pre-filled message
    window.open(`https://t.me/ar_semenov23?text=${encodedMessage}`, '_blank')
    
    // Reset form
    reset()
    setStatus('success')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Info */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tg-blue/5 text-tg-blue text-xs font-bold uppercase tracking-wider mb-4">
                  <MessageCircle className="w-3 h-3" />
                  Свяжитесь с нами
                </div>
                <h2 className="text-4xl lg:text-5xl font-black mb-6 text-[#222222]">
                  Готовы запустить <br />
                  <span className="text-tg-blue">ваш проект?</span>
                </h2>
                <p className="text-lg text-[#707579] font-medium mb-10">
                  Заполните форму, и мы свяжемся с вами в течение часа для обсуждения деталей.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Zap, text: 'Быстрый ответ в Telegram' },
                    { icon: Shield, text: 'Гарантия конфиденциальности' },
                    { icon: Bot, text: 'Бесплатная консультация' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-tg-blue/5 text-tg-blue flex items-center justify-center">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[#222222]">{item.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Telegram-style Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#F4F4F5] p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-[#222222] mb-2 uppercase tracking-widest opacity-60">Как вас зовут?</label>
                  <input
                    {...register('name')}
                    placeholder="Иван Иванов"
                    className={`w-full bg-white border-2 px-5 py-4 rounded-2xl outline-none transition-all font-medium ${
                      errors.name ? 'border-red-400' : 'border-transparent focus:border-tg-blue'
                    }`}
                    disabled={status === 'loading' || status === 'success'}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500 font-bold">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black text-[#222222] mb-2 uppercase tracking-widest opacity-60">Ваш Telegram @username</label>
                  <input
                    {...register('telegram')}
                    placeholder="@username"
                    className={`w-full bg-white border-2 px-5 py-4 rounded-2xl outline-none transition-all font-medium ${
                      errors.telegram ? 'border-red-400' : 'border-transparent focus:border-tg-blue'
                    }`}
                    disabled={status === 'loading' || status === 'success'}
                  />
                  {errors.telegram && <p className="mt-1 text-xs text-red-500 font-bold">{errors.telegram.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-black text-[#222222] mb-2 uppercase tracking-widest opacity-60">Опишите задачу</label>
                  <textarea
                    {...register('project')}
                    rows={4}
                    placeholder="Мне нужен Mini App для..."
                    className={`w-full bg-white border-2 px-5 py-4 rounded-2xl outline-none transition-all font-medium resize-none ${
                      errors.project ? 'border-red-400' : 'border-transparent focus:border-tg-blue'
                    }`}
                    disabled={status === 'loading' || status === 'success'}
                  />
                  {errors.project && <p className="mt-1 text-xs text-red-500 font-bold">{errors.project.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!isValid || status === 'loading' || status === 'success'}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                    status === 'success' 
                      ? 'bg-emerald-500 text-white cursor-default' 
                      : 'btn-tg hover:shadow-xl hover:shadow-tg-blue/20 active:scale-[0.98]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {status === 'success' ? (
                    <>
                      <Check className="w-6 h-6" />
                      Отправлено!
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 -rotate-12" />
                      Обсудить проект
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
