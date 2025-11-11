"use client"

import { Copy, TrendingUp, Zap, Share2 } from "lucide-react"
import { useStrategyExecution } from "@/components/modals/strategy-execution-provider"

interface Strategy {
  id: string;
  name: string;
  apy?: number;
  tvl?: number;
  sharpeRatio?: number;
  price?: number;
}

function formatMetric(value?: number, suffix: string = "") {
  if (value === undefined || Number.isNaN(value)) return `—${suffix}`;
  return `${value.toFixed(2)}${suffix}`;
}

function formatTvl(value?: number) {
  if (!value || Number.isNaN(value)) return "—";
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
}

export default function StrategySidebar({ strategy }: { strategy: Strategy }) {
  const { openExecution } = useStrategyExecution();

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="glassmorphism border border-border p-4 rounded-xl space-y-3">
        <h3 className="font-bold text-foreground">Key Metrics</h3>
        <div className="space-y-2 border-t border-border/50 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">TVL</span>
            <span className="font-bold text-accent">{formatTvl(strategy.tvl)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            <span className="font-bold text-primary">{formatMetric(strategy.sharpeRatio)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current APY</span>
            <span className="font-bold text-green-400">{formatMetric(strategy.apy, "%")}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition text-primary font-semibold">
          <Copy size={18} />
          Fork Strategy
        </button>

        {strategy.price && (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-linear-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 transition text-white font-semibold">
            <Zap size={18} />
            Buy for {strategy.price} ETH
          </button>
        )}

        <button
          onClick={() => openExecution(strategy.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-card transition text-foreground font-semibold"
        >
          <TrendingUp size={18} />
          Execute Strategy
        </button>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-card transition text-foreground font-semibold">
          <Share2 size={18} />
          Share
        </button>
      </div>

      {/* Creator Info */}
      <div className="glassmorphism border border-border p-4 rounded-xl space-y-3">
        <h3 className="font-bold text-foreground">Creator Royalty</h3>
        <div className="text-sm text-muted-foreground">
          Earn a % of proceeds from all forks and sales of this strategy.
        </div>
        <div className="text-2xl font-bold text-primary">8%</div>
      </div>

      {/* Risk Disclaimer */}
      <div className="glassmorphism border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-xl space-y-2">
        <h3 className="font-bold text-yellow-400">Risk Disclosure</h3>
        <p className="text-xs text-yellow-400/70">
          Past performance does not guarantee future results. DeFi strategies carry inherent risks including smart
          contract vulnerabilities and market volatility.
        </p>
      </div>
    </div>
  )
}
