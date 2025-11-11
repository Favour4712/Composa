"use client"

import { GitBranch, Zap, Send } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Design Your Strategy",
    description: "Drag-and-drop protocol blocks to create your yield strategy. Connect Uniswap, Aave, Curve, and more.",
    icon: GitBranch,
  },
  {
    number: "02",
    title: "Simulate & Backtest",
    description: "Test your strategy against historical data. Get APY estimates and risk metrics instantly.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Mint & Trade",
    description: "Deploy as NFT and earn royalties. List on marketplace and let others fork your genius.",
    icon: Send,
  },
]

export default function HowItWorks() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-card/30">
      {/* Grid background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "4rem 4rem",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="text-foreground">How it </span>
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps from idea to automated yield generation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20 hidden md:block" />

          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Step number circle */}
                <div className="flex justify-center mb-8">
                  <div
                    className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent p-0.5 group cursor-pointer"
                    style={{
                      animation: `pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                      animationDelay: `${index * 0.4}s`,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div
                  className="text-center space-y-4 p-6 rounded-xl bg-card border border-border/50 group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10"
                  style={{
                    animation: `floatAlt ${5 + index}s ease-in-out infinite`,
                  }}
                >
                  <div className="flex justify-center">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes floatAlt {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  )
}
