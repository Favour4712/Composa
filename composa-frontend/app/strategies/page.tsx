"use client";

import Link from "next/link";

import Navbar from "@/components/navbar";
import StrategyCard from "@/components/marketplace/strategy-card";
import { useStrategyList } from "@/lib/hooks/useStrategyData";

export default function StrategiesPage() {
  const { strategies, isEmpty } = useStrategyList();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <section className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
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

          {isEmpty ? (
            <div className="glassmorphism border border-border rounded-xl p-8 text-center text-muted-foreground">
              No strategies have been created yet. Be the first to{" "}
              <Link
                href="/strategy/builder"
                className="text-primary hover:underline"
              >
                build one
              </Link>
              .
            </div>
          ) : (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {strategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
