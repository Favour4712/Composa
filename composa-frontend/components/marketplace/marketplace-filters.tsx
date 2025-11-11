"use client"

export default function MarketplaceFilters() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">Filter by Performance</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="performance" defaultChecked className="w-4 h-4" />
            <span className="text-sm">All</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="performance" className="w-4 h-4" />
            <span className="text-sm">High APY (20%+)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="performance" className="w-4 h-4" />
            <span className="text-sm">Low Risk</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">TVL Range</label>
        <input type="range" min="0" max="1000000" className="w-full" />
      </div>
    </div>
  )
}
