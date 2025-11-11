"use client";

import { useMemo } from "react";
import Link from "next/link";

import Navbar from "@/components/navbar";
import StrategyCard from "@/components/marketplace/strategy-card";

const mockStrategies = [
  {
    id: "1",
    name: "Base Delta Neutral",
    creator: "0x1234...abcd",
    apy: 14.2,
    tvl: 125000,
    riskLevel: "Moderate",
    price: 0.85,
    tags: ["Uniswap V3", "Compound", "Yield"],
  },
  {
    id: "2",
    name: "Uniswap Concentrated LP",
    creator: "composa.builder",
    apy: 18.6,
    tvl: 82000,
    riskLevel: "Aggressive",
    price: 1.05,
    tags: ["Uniswap V3", "LP", "Active Management"],
  },
  {
    id: "3",
    name: "Compound Ladder",
    creator: "yieldlabs.eth",
    apy: 9.8,
    tvl: 54000,
    riskLevel: "Conservative",
    price: 0.65,
    tags: ["Compound V3", "Lending"],
  },
];

export default function StrategiesPage() {
  const strategies = useMemo(() => mockStrategies, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <section className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Composable Strategies
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
              Browse the latest strategy NFTs created on Base Sepolia. Each
              strategy represents an on-chain execution plan you can fork,
              execute, or list on the marketplace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/strategy/builder"
                className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Create new strategy
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                View marketplace
              </Link>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={{
                  id: strategy.id,
                  name: strategy.name,
                  creator: strategy.creator,
                  apy: strategy.apy,
                  tvl: strategy.tvl,
                  sharpe: 1.6,
                  risk: strategy.riskLevel,
                  price: strategy.price,
                  tags: strategy.tags,
                }}
              />
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
