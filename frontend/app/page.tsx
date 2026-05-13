import { getAccessToken } from '@/lib/auth'
import { Header } from '@/components/ui/header-2'
import { CTASection } from '@/components/landing/CTASection'
import { FAQSection } from '@/components/landing/FAQSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { FooterSection } from '@/components/landing/FooterSection'
import { HeroSection } from '@/components/landing/HeroSection'
import { ProcessSection } from '@/components/landing/ProcessSection'
import { TechBarSection } from '@/components/landing/TechBarSection'

export default async function RootPage() {
  const token = await getAccessToken()
  const isLoggedIn = !!token
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <Header isLoggedIn={isLoggedIn} />
      <HeroSection />
      <TechBarSection />
      <FeaturesSection />
      <ProcessSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
