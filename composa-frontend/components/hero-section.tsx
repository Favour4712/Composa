"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import HeroVisualization from "./hero-visualization"

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const { clientX, clientY } = e
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const x = (clientX - left) / width
      const y = (clientY - top) / height

      containerRef.current.style.setProperty("--mouse-x", `${x * 100}%`)
      containerRef.current.style.setProperty("--mouse-y", `${y * 100}%`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center pt-16 overflow-hidden"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* Animated gradient orb */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--neon-blue) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite 2s",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-primary font-medium">
              <Sparkles size={16} />
              The future of DeFi strategy trading
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Compose.
                </span>
                <br />
                <span className="text-foreground">Execute.</span>
                <br />
                <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                  Trade.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Build automated yield strategies, mint them as NFTs, and trade proven strategies on the marketplace.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/40 transition-all text-white font-semibold flex items-center justify-center gap-2 group">
                Create Strategy
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-lg border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all text-foreground font-semibold">
                Explore Strategies
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex gap-6 pt-8 border-t border-border/50">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">15</div>
                <div className="text-sm text-muted-foreground">Active Strategies</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-accent">$2.3M</div>
                <div className="text-sm text-muted-foreground">Total Value Locked</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">Base</div>
                <div className="text-sm text-muted-foreground">Network</div>
              </div>
            </div>
          </div>

          {/* Right side - Visualization */}
          <div className="relative h-full min-h-96 lg:min-h-[600px]">
            <HeroVisualization />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-30px) translateX(15px); }
          66% { transform: translateY(20px) translateX(-15px); }
        }
      `}</style>
    </section>
  )
}
