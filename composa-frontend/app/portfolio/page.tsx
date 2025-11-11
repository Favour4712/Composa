"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import PortfolioHeader from "@/components/portfolio/portfolio-header"
import MyStrategies from "@/components/portfolio/my-strategies"
import ActivePositions from "@/components/portfolio/active-positions"
import MyListings from "@/components/portfolio/my-listings"

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<"strategies" | "positions" | "listings">("strategies")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <PortfolioHeader />

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 lg:px-8 border-b border-border sticky top-16 bg-background/80 backdrop-blur z-40">
          <div className="max-w-7xl mx-auto flex gap-1">
            {["strategies", "positions", "listings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 font-semibold text-sm transition relative ${
                  activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "strategies" && "My Strategies"}
                {tab === "positions" && "Active Positions"}
                {tab === "listings" && "My Listings"}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "strategies" && <MyStrategies />}
            {activeTab === "positions" && <ActivePositions />}
            {activeTab === "listings" && <MyListings />}
          </div>
        </div>
      </div>
    </div>
  )
}
