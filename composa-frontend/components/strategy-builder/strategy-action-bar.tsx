"use client"

import { Play, Save, Zap } from "lucide-react"

interface StrategyStep {
  id: string
  protocol: string
  action: string
  tokens: string
}

interface StrategyActionBarProps {
  steps: StrategyStep[]
  strategyMetadata: { name: string; description: string }
}

export default function StrategyActionBar({ steps, strategyMetadata }: StrategyActionBarProps) {
  const isValid = steps.length >= 2

  return (
    <div className="p-4 border-t border-border glassmorphism flex items-center justify-between gap-4">
      <div className="flex-1 space-y-1">
        <div className="text-sm font-semibold text-foreground">{strategyMetadata.name}</div>
        <div className="text-xs text-muted-foreground">{steps.length} steps • Est. Gas: $45 • Risk: Medium</div>
      </div>

      <div className="flex gap-3">
        <button
          disabled={!isValid}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/50 hover:border-primary disabled:opacity-50 disabled:hover:border-primary/50 transition text-primary font-medium"
        >
          <Play size={18} />
          Simulate
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition text-foreground font-medium">
          <Save size={18} />
          Save Draft
        </button>

        <button
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 disabled:hover:shadow-none transition text-white font-semibold"
        >
          <Zap size={18} />
          Mint NFT
        </button>
      </div>
    </div>
  )
}
