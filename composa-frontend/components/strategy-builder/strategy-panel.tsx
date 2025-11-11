"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

interface StrategyStep {
  id: string
  protocol: string
  action: string
  tokens: string
  params?: Record<string, string>
}

interface StrategyPanelProps {
  strategyMetadata: { name: string; description: string }
  onMetadataChange: (metadata: { name: string; description: string }) => void
  steps: StrategyStep[]
  onAddStep: (protocol: string) => void
  onSelectStep: (id: string | null) => void
  selectedStep: string | null
  onUpdateStep: (id: string, updates: Partial<StrategyStep>) => void
  onRemoveStep: (id: string) => void
}

const PROTOCOLS = [
  { name: "Uniswap", color: "from-pink-500 to-red-500" },
  { name: "Aave", color: "from-blue-500 to-cyan-500" },
  { name: "Compound", color: "from-purple-500 to-blue-500" },
  { name: "Curve", color: "from-red-500 to-pink-500" },
]

const ACTIONS = ["Swap", "Stake", "Farm", "Lend", "Borrow"]

export default function StrategyPanel({
  strategyMetadata,
  onMetadataChange,
  steps,
  onAddStep,
  onSelectStep,
  selectedStep,
  onUpdateStep,
  onRemoveStep,
}: StrategyPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string>("protocols")
  const selectedStepData = steps.find((s) => s.id === selectedStep)

  return (
    <div className="w-80 border-r border-border glassmorphism flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Strategy Builder
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Strategy Metadata */}
        <div className="p-4 border-b border-border/50 space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Name</label>
            <input
              type="text"
              value={strategyMetadata.name}
              onChange={(e) => onMetadataChange({ ...strategyMetadata, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Strategy name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
            <textarea
              value={strategyMetadata.description}
              onChange={(e) => onMetadataChange({ ...strategyMetadata, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Strategy description"
              rows={3}
            />
          </div>
        </div>

        {/* Add Protocol Blocks */}
        <div className="p-4 space-y-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Add Protocol</h3>
          <div className="grid grid-cols-2 gap-2">
            {PROTOCOLS.map((protocol) => (
              <button
                key={protocol.name}
                onClick={() => onAddStep(protocol.name)}
                className={`p-3 rounded-lg bg-gradient-to-br ${protocol.color} opacity-80 hover:opacity-100 transition text-white font-medium text-sm flex items-center justify-center gap-2`}
              >
                <Plus size={16} />
                {protocol.name}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Steps */}
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">Strategy Steps</h3>
          {steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Add a protocol to get started</div>
          ) : (
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={step.id} className="space-y-2">
                  <button
                    onClick={() => onSelectStep(selectedStep === step.id ? null : step.id)}
                    className={`w-full p-3 rounded-lg border-2 transition text-left ${
                      selectedStep === step.id
                        ? "border-primary bg-primary/10 glassmorphism"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-primary">{step.protocol}</div>
                        <div className="text-xs text-muted-foreground">{step.action}</div>
                        <div className="text-xs text-foreground/70 truncate">{step.tokens}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onRemoveStep(step.id)
                        }}
                        className="p-1 hover:bg-destructive/20 rounded transition"
                      >
                        <X size={16} className="text-destructive" />
                      </button>
                    </div>
                  </button>

                  {/* Step Details - Show when selected */}
                  {selectedStep === step.id && (
                    <div className="p-3 bg-card rounded-lg border border-border/50 space-y-2">
                      <select
                        value={step.action}
                        onChange={(e) => onUpdateStep(step.id, { action: e.target.value })}
                        className="w-full px-2 py-1 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {ACTIONS.map((action) => (
                          <option key={action} value={action}>
                            {action}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={step.tokens}
                        onChange={(e) => onUpdateStep(step.id, { tokens: e.target.value })}
                        className="w-full px-2 py-1 bg-background border border-border rounded text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. USDC → ETH"
                      />
                    </div>
                  )}

                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <div className="text-muted-foreground text-xs">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Risk & APY */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Risk Score</span>
          <div className="text-sm font-semibold text-accent">Medium</div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Est. APY</span>
          <div className="text-sm font-semibold text-primary">12.5%</div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Gas Est.</span>
          <div className="text-sm font-semibold text-foreground">~$45</div>
        </div>
      </div>
    </div>
  )
}
