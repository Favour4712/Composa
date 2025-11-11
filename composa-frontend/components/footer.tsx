"use client"

import { Github, Twitter, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/30 backdrop-blur-sm">
      {/* Subtle animated background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(45deg, var(--neon-purple) 0%, transparent 100%)",
          animation: "shimmer 15s ease-in-out infinite",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Composa
            </h3>
            <p className="text-muted-foreground">The future of composable yield strategies on-chain.</p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Builder
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Marketplace
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Connect</h4>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center"
              >
                <Twitter size={18} className="text-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center"
              >
                <Github size={18} className="text-foreground" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center"
              >
                <MessageCircle size={18} className="text-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2025 Composa. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Security
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.15; }
        }
      `}</style>
    </footer>
  )
}
