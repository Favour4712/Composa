"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface Strategy {
  id: string
  name: string
  creator: string
  apy: number
  tvl: number
}

export default function TrendingCarousel({ strategies }: { strategies: Strategy[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = 400
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="flex-shrink-0 w-96 glassmorphism border border-border rounded-xl p-6 hover:border-primary/50 transition"
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-primary">{strategy.name}</h3>
                <p className="text-sm text-muted-foreground">{strategy.creator}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Current APY</div>
                  <div className="text-2xl font-bold text-primary">{strategy.apy}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase font-semibold">Total TVL</div>
                  <div className="text-2xl font-bold text-accent">${(strategy.tvl / 1000).toFixed(0)}K</div>
                </div>
              </div>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 transition text-white font-semibold">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 p-2 rounded-lg bg-card border border-border hover:border-primary hover:bg-card/80 transition z-10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 p-2 rounded-lg bg-card border border-border hover:border-primary hover:bg-card/80 transition z-10"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
