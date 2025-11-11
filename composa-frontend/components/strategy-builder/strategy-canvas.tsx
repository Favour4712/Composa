"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"

interface StrategyStep {
  id: string
  protocol: string
  action: string
  tokens: string
  x?: number
  y?: number
}

interface StrategyCanvasProps {
  steps: StrategyStep[]
  selectedStep: string | null
  onSelectStep: (id: string) => void
  onUpdateStepPosition: (id: string, x: number, y: number) => void
}

export default function StrategyCanvas({
  steps,
  selectedStep,
  onSelectStep,
  onUpdateStepPosition,
}: StrategyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent, stepId: string) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDragging(stepId)
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      onSelectStep(stepId)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - offset.x
      const y = e.clientY - rect.top - offset.y

      onUpdateStepPosition(dragging, Math.max(0, x), Math.max(0, y))
    }

    const handleMouseUp = () => {
      setDragging(null)
    }

    if (dragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [dragging, offset, onUpdateStepPosition])

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-gradient-to-br from-background/50 via-background to-background cursor-crosshair"
    >
      {/* Grid pattern background */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {steps.map((step, index) => {
          const nextStep = steps[index + 1]
          if (!nextStep || !step.x || !step.y || !nextStep.x || !nextStep.y) return null

          return (
            <line
              key={`line-${step.id}`}
              x1={step.x + 80}
              y1={step.y + 40}
              x2={nextStep.x + 80}
              y2={nextStep.y + 40}
              stroke="url(#gradientLine)"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.6"
            />
          )
        })}
        <defs>
          <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(147, 51, 234)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Strategy Steps */}
      <div className="relative w-full h-full">
        {steps.map((step) => (
          <div
            key={step.id}
            className="absolute w-40 group"
            style={{
              left: `${step.x || 0}px`,
              top: `${step.y || 0}px`,
              cursor: dragging === step.id ? "grabbing" : "grab",
            }}
            onMouseDown={(e) => handleMouseDown(e, step.id)}
          >
            <div
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStep === step.id
                  ? "border-primary bg-primary/20 shadow-xl shadow-primary/50 glassmorphism"
                  : "border-border hover:border-primary/50 bg-card/50 hover:bg-card/80"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-primary">{step.protocol}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent font-semibold">
                    {step.action}
                  </span>
                </div>
                <div className="text-sm text-foreground/80 font-medium">{step.tokens}</div>
                <div className="text-xs text-muted-foreground">APY: 15.2% • Risk: Low</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {steps.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="space-y-4">
            <div className="text-2xl font-bold text-muted-foreground">Start Building</div>
            <div className="text-sm text-muted-foreground">Add protocols from the left panel to begin</div>
          </div>
        </div>
      )}
    </div>
  )
}
