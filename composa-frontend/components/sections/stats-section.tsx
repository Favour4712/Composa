"use client"

export default function StatsSection() {
  const stats = [
    { label: "Total Value Locked", value: "$124.5M", change: "+24%" },
    { label: "Active Strategies", value: "2,847", change: "+156%" },
    { label: "Creator Royalties", value: "$8.2M", change: "+89%" },
    { label: "Network Transactions", value: "4.2M", change: "+342%" },
  ]

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated gradient orbs */}
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-5 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--neon-pink) 0%, transparent 70%)",
          animation: "rotate 20s linear infinite",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Backed by numbers
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
              style={{
                animation: `floatStagger ${6 + index * 0.5}s ease-in-out infinite`,
              }}
            >
              {/* Glowing border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300" />

              <div className="relative p-8 rounded-2xl bg-card border border-border group-hover:border-primary/50 transition-all">
                <div className="text-sm text-muted-foreground mb-3">{stat.label}</div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-primary font-semibold">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes floatStagger {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  )
}
