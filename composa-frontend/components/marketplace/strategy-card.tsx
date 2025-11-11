"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Zap } from "lucide-react"

interface Strategy {
  id: string
  name: string
  creator: string
  apy: number
  tvl: number
  sharpeRatio: number
  forks: number
  price?: number
  isListed: boolean
}

export default function StrategyCard({ strategy }: { strategy: Strategy }) {
  const [hoverEffect, setHoverEffect] = useState(false)

  return (
    <Link href={`/strategy/${strategy.id}`}>
      <div
        className="group relative h-full glassmorphism border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/20 cursor-pointer"
        onMouseEnter={() => setHoverEffect(true)}
        onMouseLeave={() => setHoverEffect(false)}
      >
        {/* NFT Preview */}
        <div className="relative h-48 bg-gradient-to-br from-primary/30 via-accent/20 to-background overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl opacity-20 group-hover:scale-110 transition-transform">◈</div>
          </div>

          {/* Badge */}
          <div className="absolute top-3 right-3 flex gap-2">
            {strategy.isListed && (
              <div className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/50 text-xs font-semibold text-green-400">
                For Sale
              </div>
            )}
            <div className="px-2 py-1 rounded-lg bg-accent/20 border border-accent/50 text-xs font-semibold text-accent">
              {strategy.forks} Forks
            </div>
          </div>

          {/* Hover overlay */}
          {hoverEffect && (
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition line-clamp-1">
              {strategy.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{strategy.creator}</p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-semibold">APY</div>
              <div className="text-lg font-bold text-primary">{strategy.apy}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-semibold">TVL</div>
              <div className="text-lg font-bold text-accent">${(strategy.tvl / 1000).toFixed(0)}K</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Risk</div>
              <div className="text-lg font-bold text-green-400">Low</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
            <button
              onClick={(e) => {
                e.preventDefault()
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/50 hover:border-primary hover:bg-primary/10 transition text-primary font-medium text-sm"
            >
              <Copy size={16} />
              Fork
            </button>
            {strategy.isListed && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 transition text-white font-medium text-sm"
              >
                <Zap size={16} />
                Buy
              </button>
            )}
          </div>

          {/* Price */}
          {strategy.price && (
            <div className="text-center pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground">List Price</div>
              <div className="text-sm font-bold text-foreground">{strategy.price} ETH</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
