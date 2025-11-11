"use client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Strategy {
  id: string
  name: string
  description: string
  apy: number
  tvl: number
  sharpeRatio: number
  forks: number
  composition: Array<{ step: number; protocol: string; action: string; tokens: string; apy: string }>
  performanceData: Array<{ month: string; return: number }>
  recentActivity: Array<{ type: string; user: string; amount: number; time: string }>
}

interface StrategyDetailTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  strategy: Strategy
}

const TABS = ["overview", "performance", "composition", "forks", "activity"]

export default function StrategyDetailTabs({ activeTab, setActiveTab, strategy }: StrategyDetailTabsProps) {
  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold text-sm transition relative ${
              activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">Overview</h2>
              <p className="text-muted-foreground leading-relaxed">{strategy.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glassmorphism border border-border p-4 rounded-xl">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">APY</div>
                <div className="text-3xl font-bold text-primary">{strategy.apy}%</div>
              </div>
              <div className="glassmorphism border border-border p-4 rounded-xl">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">Sharpe Ratio</div>
                <div className="text-3xl font-bold text-accent">{strategy.sharpeRatio}</div>
              </div>
              <div className="glassmorphism border border-border p-4 rounded-xl">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">Total Forks</div>
                <div className="text-3xl font-bold text-primary">{strategy.forks}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Historical Returns</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={strategy.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(20, 20, 40, 0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="return"
                    stroke="rgb(147, 51, 234)"
                    strokeWidth={2}
                    dot={{ fill: "rgb(147, 51, 234)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glassmorphism border border-border p-4 rounded-xl">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-400">-5.2%</div>
              </div>
              <div className="glassmorphism border border-border p-4 rounded-xl">
                <div className="text-xs text-muted-foreground uppercase font-semibold mb-2">Win Rate</div>
                <div className="text-2xl font-bold text-green-400">92%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "composition" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Strategy Composition</h2>
            {strategy.composition.map((step, index) => (
              <div key={index} className="glassmorphism border border-border p-4 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-lg bg-primary/20 text-primary font-bold text-sm mb-2">
                      Step {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{step.protocol}</h3>
                    <p className="text-sm text-muted-foreground">{step.action}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">Expected APY</div>
                    <div className="text-2xl font-bold text-accent">{step.apy}</div>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <div className="text-sm text-foreground/70">Tokens: {step.tokens}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "forks" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Forks ({strategy.forks})</h2>
            <div className="text-center py-8 text-muted-foreground">Showing recent forks of this strategy</div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glassmorphism border border-border p-4 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-foreground">Fork #{i}</div>
                  <div className="text-sm text-muted-foreground">Modified by user {i}</div>
                </div>
                <button className="px-3 py-1.5 rounded-lg border border-primary/50 hover:border-primary text-primary font-medium text-sm">
                  View
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            {strategy.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="glassmorphism border border-border p-4 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-foreground capitalize">{activity.type}</div>
                  <div className="text-sm text-muted-foreground">{activity.user}</div>
                </div>
                <div className="text-right">
                  {activity.amount > 0 && <div className="font-semibold text-accent">${activity.amount}K</div>}
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
