"use client"

import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/sections/features-section"
import HowItWorks from "@/components/sections/how-it-works"
import StatsSection from "@/components/sections/stats-section"
import CommunitySection from "@/components/sections/community-section"
import CallToActionSection from "@/components/sections/cta-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <StatsSection />
      <CommunitySection />
      <CallToActionSection />
      <Footer />
    </div>
  )
}
