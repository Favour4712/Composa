"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import StrategyCanvas from "@/components/strategy-builder/strategy-canvas"
import StrategyPanel from "@/components/strategy-builder/strategy-panel"
import StrategyActionBar from "@/components/strategy-builder/strategy-action-bar"

interface StrategyStep {
  id: string
  protocol: string
  action: string
  tokens: string
  params?: Record<string, string>
  x?: number
  y?: number
}

export default function BuilderPage() {
  const [steps, setSteps] = useState<StrategyStep[]>([])
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [strategyMetadata, setStrategyMetadata] = useState({
    name: "My Strategy",
    description: "A custom yield strategy",
  })

  const addStep = (protocol: string) => {
    const newStep: StrategyStep = {
      id: `step-${Date.now()}`,
      protocol,
      action: "Swap",
      tokens: "USDC → ETH",
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
    }
    setSteps([...steps, newStep])
  }

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id))
    setSelectedStep(null)
  }

  const updateStep = (id: string, updates: Partial<StrategyStep>) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16 flex h-[calc(100vh-64px)]">
        {/* Left Panel */}
        <StrategyPanel
          strategyMetadata={strategyMetadata}
          onMetadataChange={setStrategyMetadata}
          steps={steps}
          onAddStep={addStep}
          onSelectStep={setSelectedStep}
          selectedStep={selectedStep}
          onUpdateStep={updateStep}
          onRemoveStep={removeStep}
        />

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background to-background/50">
          <StrategyCanvas
            steps={steps}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
            onUpdateStepPosition={(id, x, y) => updateStep(id, { x, y })}
          />
          <StrategyActionBar steps={steps} strategyMetadata={strategyMetadata} />
        </div>
      </div>
    </div>
  )
}
