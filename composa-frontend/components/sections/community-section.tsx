"use client"

import { Users, MessageCircle, Zap } from "lucide-react"

export default function CommunitySection() {
  const items = [
    {
      icon: Users,
      title: "10K+ Builders",
      description: "Join the growing community of DeFi strategy creators",
      color: "from-neon-blue to-cyan-400",
    },
    {
      icon: MessageCircle,
      title: "Live Discussion",
      description: "Discord, Twitter, and Telegram for real-time strategy talk",
      color: "from-neon-purple to-purple-400",
    },
    {
      icon: Zap,
      title: "Weekly Contests",
      description: "Win ETH by creating the best-performing strategies",
      color: "from-neon-pink to-pink-400",
    },
  ]

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20 blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `drift ${10 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="text-foreground">Join the </span>
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              community
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with thousands of yield strategists and shape the future of DeFi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                style={{
                  animation: `floatAlternate ${5 + index}s ease-in-out infinite`,
                }}
              >
                {/* Glow effect */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${item.color} blur-xl`}
                />

                <div className="relative z-10 space-y-4">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.color} p-3 flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground mt-2">{item.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes floatAlternate {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(2deg); }
        }
        @keyframes drift {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-50px) translateX(20px); }
        }
      `}</style>
    </section>
  )
}
