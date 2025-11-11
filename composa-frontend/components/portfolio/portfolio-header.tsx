"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Plus, TrendingUp } from "lucide-react"

const portfolioData = [
  { date: "Jan 1", value: 10000 },
  { date: "Jan 8", value: 12500 },
  { date: "Jan 15", value: 11800 },
  { date: "Jan 22", value: 14200 },
  { date: "Jan 29", value: 16800 },
  { date: "Feb 5", value: 18500 },
  { date: "Feb 12", value: 21200 },
]

export default function PortfolioHeader() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Header with title and action */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Your Portfolio
              </span>
            </h1>
            <p className="text-muted-foreground">Manage your strategies and monitor returns</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 transition text-white font-semibold">
            <Plus size={20} />
            Create Strategy
          </button>
        </div>

        {/* Portfolio Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glassmorphism border border-border p-6 rounded-xl">
            <div className="text-sm text-muted-foreground uppercase font-semibold mb-2">Total Portfolio Value</div>
            <div className="text-4xl font-bold text-foreground mb-1">$21,200</div>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <TrendingUp size={16} />
              +112% since Jan 1
            </div>
          </div>

          <div className="glassmorphism border border-border p-6 rounded-xl">
            <div className="text-sm text-muted-foreground uppercase font-semibold mb-2">30-Day Return</div>
            <div className="text-4xl font-bold text-accent mb-1">+18.5%</div>
            <div className="text-xs text-muted-foreground">Avg. across all strategies</div>
          </div>

          <div className="glassmorphism border border-border p-6 rounded-xl">
            <div className="text-sm text-muted-foreground uppercase font-semibold mb-2">Active Strategies</div>
            <div className="text-4xl font-bold text-primary mb-1">5</div>
            <div className="text-xs text-muted-foreground">$156K total deployed</div>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="glassmorphism border border-border p-6 rounded-xl">
          <h2 className="text-lg font-bold mb-4">Portfolio Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(147, 51, 234)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(147, 51, 234)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 40, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(147, 51, 234)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
