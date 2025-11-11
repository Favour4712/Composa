"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import StrategyDetailTabs from "@/components/strategy-detail/strategy-detail-tabs"
import StrategySidebar from "@/components/strategy-detail/strategy-sidebar"

export default function StrategyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock strategy data
  const strategy = {
    id: params.id,
    name: "Multi-Protocol Harvest Strategy",
    creator: "yield-master.eth",
    createdAt: "2024-01-15",
    description:
      "A sophisticated yield farming strategy that combines automated liquidity provision across Uniswap V3 and Aave lending to maximize returns while managing risk.",
    apy: 31.2,
    tvl: 890000,
    sharpeRatio: 2.4,
    forks: 45,
    price: 1.2,
    performanceData: [
      { month: "Jan", return: 5.2 },
      { month: "Feb", return: 6.1 },
      { month: "Mar", return: 7.8 },
      { month: "Apr", return: 8.5 },
      { month: "May", return: 9.2 },
      { month: "Jun", return: 11.2 },
    ],
    composition: [
      { step: 1, protocol: "Uniswap V3", action: "Provide Liquidity", tokens: "USDC/ETH", apy: "12%" },
      { step: 2, protocol: "Aave", action: "Lend", tokens: "ETH", apy: "8%" },
      { step: 3, protocol: "Compound", action: "Farm", tokens: "COMP", apy: "14%" },
    ],
    forkedFrom: null,
    forkCount: 45,
    recentActivity: [
      { type: "deposit", user: "0x1234...5678", amount: 50, time: "2 hours ago" },
      { type: "withdraw", user: "0x9876...5432", amount: 30, time: "4 hours ago" },
      { type: "fork", user: "new-trader.eth", amount: 0, time: "1 day ago" },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* NFT Preview */}
              <div className="lg:col-span-2">
                <div className="relative aspect-video rounded-xl glassmorphism border border-border overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-background group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10 group-hover:opacity-20 transition">
                    ◈
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-4">
                <div className="glassmorphism border border-border p-4 rounded-xl space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Strategy Name</div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {strategy.name}
                    </h1>
                  </div>
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Creator</div>
                      <div className="text-sm font-semibold">{strategy.creator}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Created</div>
                      <div className="text-sm font-semibold">{strategy.createdAt}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <StrategyDetailTabs activeTab={activeTab} setActiveTab={setActiveTab} strategy={strategy} />
            </div>

            {/* Sidebar */}
            <StrategySidebar strategy={strategy} />
          </div>
        </div>
      </div>
    </div>
  )
}
