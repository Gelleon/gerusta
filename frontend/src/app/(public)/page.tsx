import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import Process from '@/components/sections/Process'
import CaseStudies from '@/components/sections/CaseStudies'
import Contact from '@/components/sections/Contact'
import { PerspectiveSection } from '@/components/ui/3d/PerspectiveSection'

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
      <Contact />
    </main>
  )
}
