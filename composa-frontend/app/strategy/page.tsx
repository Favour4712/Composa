"use client";

import Link from "next/link";

import Navbar from "@/components/navbar";
import StrategyDetailTabs from "@/components/strategy-detail/strategy-detail-tabs";
import StrategySidebar from "@/components/strategy-detail/strategy-sidebar";

export default function StrategyLandingPage() {
  const placeholderStrategy = {
    id: "demo-strategy",
    name: "Composable Yield Strategy",
    creator: "composa.builder",
    createdAt: "2024-01-01",
    description:
      "Explore composable strategies combining swaps and lending to capture Base Sepolia yields. Select a strategy below to view full details.",
    apy: 18.4,
    tvl: 125000,
    sharpeRatio: 1.8,
    forks: 12,
    price: 0.85,
    performanceData: [
      { month: "Jan", return: 3.1 },
      { month: "Feb", return: 4.0 },
      { month: "Mar", return: 5.6 },
      { month: "Apr", return: 6.2 },
      { month: "May", return: 7.3 },
      { month: "Jun", return: 8.1 },
    ],
    composition: [
      {
        step: 1,
        protocol: "Uniswap V3",
        action: "Swap",
        tokens: "cbETH → USDC",
        apy: "8%",
      },
      {
        step: 2,
        protocol: "Compound V3",
        action: "Supply",
        tokens: "USDC",
        apy: "10%",
      },
    ],
    forkedFrom: null,
    forkCount: 12,
    recentActivity: [
      { type: "deposit", user: "0xabc...123", amount: 40, time: "1 hour ago" },
      { type: "deposit", user: "0xdef...456", amount: 25, time: "3 hours ago" },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Strategy Overview
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
              Browse composable yield strategies deployed on Base. Select a
              strategy to view full on-chain composition, performance metrics,
              and execution history.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <StrategyDetailTabs
                activeTab="overview"
                setActiveTab={() => undefined}
                strategy={placeholderStrategy}
              />

              <div className="glassmorphism border border-border rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    Navigate to a Strategy
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Jump directly to a live strategy detail page by entering its
                    NFT token ID.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/strategy/1"
                    className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
                  >
                    View Strategy #1
                  </Link>
                  <Link
                    href="/strategy/2"
                    className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
                  >
                    View Strategy #2
                  </Link>
                  <Link
                    href="/strategy/builder"
                    className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
                  >
                    Create New Strategy
                  </Link>
                </div>
              </div>
            </div>

            <StrategySidebar strategy={placeholderStrategy} />
          </div>
        </div>
      </div>
    </div>
  );
}
