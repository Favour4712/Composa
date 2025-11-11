"use client"

import { ArrowRight, Sparkles } from "lucide-react"

export default function CallToActionSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl" />
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--neon-blue) 0%, transparent 70%)",
          animation: "float 10s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)",
          animation: "float 10s ease-in-out infinite 3s reverse",
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border backdrop-blur">
            <Sparkles size={16} className="text-primary" />
            <span className="text-foreground font-medium">Ready to start building?</span>
          </div>

          {/* Main heading */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Create your first strategy
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No coding required. No gas for testing. Just pure DeFi strategy building and earning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/40 transition-all text-white font-semibold flex items-center justify-center gap-2 group">
              Launch Builder
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 rounded-lg border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all text-foreground font-semibold">
              View Documentation
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-40px) translateX(20px); }
          66% { transform: translateY(20px) translateX(-20px); }
        }
      `}</style>
    </section>
  )
}
