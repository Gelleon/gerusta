'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Send, Bot } from 'lucide-react'
import Link from 'next/link'

const navLinks = [
  { name: 'Услуги', href: '/#services' },
  { name: 'Процесс', href: '/#process' },
  { name: 'Кейсы', href: '/#cases' },
  { name: 'Блог', href: '/blog' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    handleScroll() // Initial check
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-tg-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-tg-blue/20 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#222222]">
              GERUSTA<span className="text-tg-blue">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-bold text-[#707579] hover:text-tg-blue transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a 
              href="https://t.me/ar_semenov23" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-tg px-6 py-2.5 text-sm shadow-md shadow-tg-blue/10 flex items-center gap-2"
            >
              <Send className="w-4 h-4 -rotate-12" />
              Обсудить проект
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[#222222]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-[#222222]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <a 
                href="https://t.me/ar_semenov23"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tg w-full py-4 text-base flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5 -rotate-12" />
                Обсудить проект
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
