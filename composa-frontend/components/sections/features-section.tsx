"use client"

import { Zap, Lock, Sparkles, TrendingUp, Shield, Coins } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Execute strategies in milliseconds with gas-optimized smart contracts",
    color: "from-neon-blue to-blue-400",
  },
  {
    icon: Lock,
    title: "Fully Composable",
    description: "Stack any DeFi protocol with intuitive visual builder interface",
    color: "from-neon-purple to-purple-400",
  },
  {
    icon: Sparkles,
    title: "NFT Trading",
    description: "Trade strategies as NFTs and earn royalties on every fork",
    color: "from-neon-pink to-pink-400",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Analytics",
    description: "Monitor performance with live price feeds and yield tracking",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: Shield,
    title: "Smart Audits",
    description: "Every strategy is simulated and validated before deployment",
    color: "from-emerald-400 to-green-500",
  },
  {
    icon: Coins,
    title: "Multi-Chain",
    description: "Deploy on Base, Ethereum, Polygon, and Arbitrum networks",
    color: "from-orange-400 to-red-500",
  },
]

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating background elements */}
      <div
        className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)",
          animation: "floatSlow 20s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--neon-blue) 0%, transparent 70%)",
          animation: "floatSlow 25s ease-in-out infinite 5s",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-primary font-medium mb-6">
            <Sparkles size={16} />
            Powerful Features
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Everything
            </span>{" "}
            you need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build, backtest, and deploy sophisticated yield strategies without writing a single line of code
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card/50 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                style={{
                  animation: `floatAlt ${4 + index * 0.3}s ease-in-out infinite`,
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity ${feature.color} pointer-events-none blur-xl`}
                />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2 flex items-center justify-center`}
                  >
                    <Icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground mt-2">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-40px) translateX(20px); }
          66% { transform: translateY(30px) translateX(-20px); }
        }
        @keyframes floatAlt {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  )
}
