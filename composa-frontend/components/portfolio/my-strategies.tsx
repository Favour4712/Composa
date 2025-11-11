"use client"

import Link from "next/link"
import { MoreVertical, Edit2, Copy } from "lucide-react"

interface Strategy {
  id: string
  name: string
  apy: number
  tvl: number
  status: "active" | "paused"
  deployCost: number
}

const myStrategies: Strategy[] = [
  {
    id: "1",
    name: "Uniswap V3 Alpha",
    apy: 24.5,
    tvl: 50000,
    status: "active",
    deployCost: 180,
  },
  {
    id: "2",
    name: "Conservative Yield",
    apy: 8.2,
    tvl: 35000,
    status: "active",
    deployCost: 120,
  },
  {
    id: "3",
    name: "My Custom Strategy",
    apy: 15.8,
    tvl: 71000,
    status: "active",
    deployCost: 200,
  },
]

export default function MyStrategies() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Strategies</h2>
        <div className="text-sm text-muted-foreground">{myStrategies.length} strategies created</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myStrategies.map((strategy) => (
          <Link key={strategy.id} href={`/strategy/${strategy.id}`}>
            <div className="group glassmorphism border border-border p-6 rounded-xl hover:border-primary/50 transition cursor-pointer h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition line-clamp-1">
                    {strategy.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        strategy.status === "active" ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{strategy.status}</span>
                  </div>
                </div>
                <button className="p-2 hover:bg-card rounded-lg transition opacity-0 group-hover:opacity-100">
                  <MoreVertical size={18} className="text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">APY</div>
                  <div className="text-2xl font-bold text-primary">{strategy.apy}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Deployed</div>
                  <div className="text-2xl font-bold text-accent">${(strategy.tvl / 1000).toFixed(0)}K</div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm transition">
                  <Edit2 size={16} />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-primary/50 hover:border-primary text-primary font-medium text-sm transition">
                  <Copy size={16} />
                  Manage
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
