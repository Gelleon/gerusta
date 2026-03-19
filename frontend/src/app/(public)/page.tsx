import type { Metadata } from "next"
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Process from '@/components/sections/Process'
import CaseStudies from '@/components/sections/CaseStudies'
import Reviews from '@/components/sections/Reviews'
import Contact from '@/components/sections/Contact'
import { PerspectiveSection } from '@/components/ui/3d/PerspectiveSection'

export const metadata: Metadata = {
  title: "Разработка Telegram-ботов под ключ для бизнеса",
  description:
    "Разработка Telegram-ботов и Mini Apps под ключ для бизнеса: автоматизация, интеграции, поддержка 24/7 и запуск за 3–7 дней.",
  alternates: { canonical: "/" },
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <Hero />
      <PerspectiveSection rotationIntensity={5} scaleIntensity={0.98} className="w-full">
        <Services />
      </PerspectiveSection>
      <Process />
      <PerspectiveSection rotationIntensity={5} scaleIntensity={0.98} className="w-full">
        <CaseStudies />
      </PerspectiveSection>
      <Reviews />
      <Contact />
    </main>
  )
}
