"use client"

interface Position {
  id: string
  strategy: string
  protocol: string
  deposited: number
  current: number
  return: number
  unrealizedGain: number
}

const activePositions: Position[] = [
  {
    id: "1",
    strategy: "Uniswap V3 Alpha",
    protocol: "Uniswap V3",
    deposited: 50000,
    current: 61200,
    return: 22.4,
    unrealizedGain: 11200,
  },
  {
    id: "2",
    strategy: "Conservative Yield",
    protocol: "Aave",
    deposited: 35000,
    current: 37870,
    return: 8.2,
    unrealizedGain: 2870,
  },
  {
    id: "3",
    strategy: "My Custom Strategy",
    protocol: "Multi-Protocol",
    deposited: 71000,
    current: 84230,
    return: 18.6,
    unrealizedGain: 13230,
  },
]

export default function ActivePositions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Active Positions</h2>
        <div className="text-sm text-muted-foreground">
          Total Deployed: ${activePositions.reduce((sum, p) => sum + p.deposited, 0) / 1000}K
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Strategy</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Protocol</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Deposited</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Current</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Gain/Loss</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Return</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {activePositions.map((position) => (
              <tr key={position.id} className="border-b border-border/50 hover:bg-card/50 transition">
                <td className="px-4 py-4 text-sm font-semibold text-foreground">{position.strategy}</td>
                <td className="px-4 py-4 text-sm text-muted-foreground">{position.protocol}</td>
                <td className="px-4 py-4 text-sm text-right text-foreground">
                  ${(position.deposited / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-4 text-sm text-right text-foreground font-semibold">
                  ${(position.current / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-4 text-sm text-right">
                  <span className="text-green-400 font-semibold">+${(position.unrealizedGain / 1000).toFixed(0)}K</span>
                </td>
                <td className="px-4 py-4 text-sm text-right">
                  <span className="text-primary font-bold">+{position.return}%</span>
                </td>
                <td className="px-4 py-4 text-center">
                  <button className="px-3 py-1 rounded-lg border border-border hover:border-primary/50 text-xs font-medium transition">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
