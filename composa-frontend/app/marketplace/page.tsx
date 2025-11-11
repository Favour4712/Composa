"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import StrategyCard from "@/components/marketplace/strategy-card"
import TrendingCarousel from "@/components/marketplace/trending-carousel"

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

const mockStrategies: Strategy[] = [
  {
    id: "1",
    name: "Uniswap V3 Alpha",
    creator: "vitalik.eth",
    apy: 24.5,
    tvl: 450000,
    sharpeRatio: 2.1,
    forks: 12,
    price: 0.5,
    isListed: true,
  },
  {
    id: "2",
    name: "Aave Stable Yield",
    creator: "0x1234...5678",
    apy: 8.2,
    tvl: 1200000,
    sharpeRatio: 1.8,
    forks: 34,
    price: 0.2,
    isListed: true,
  },
  {
    id: "3",
    name: "Curve LP Boost",
    creator: "trader.eth",
    apy: 18.9,
    tvl: 320000,
    sharpeRatio: 1.5,
    forks: 8,
    isListed: false,
  },
  {
    id: "4",
    name: "Multi-Protocol Harvest",
    creator: "yield-master.eth",
    apy: 31.2,
    tvl: 890000,
    sharpeRatio: 2.4,
    forks: 45,
    price: 1.2,
    isListed: true,
  },
  {
    id: "5",
    name: "Leveraged USDC Farm",
    creator: "0x5678...1234",
    apy: 42.1,
    tvl: 560000,
    sharpeRatio: 2.8,
    forks: 67,
    price: 2.5,
    isListed: true,
  },
  {
    id: "6",
    name: "Conservative Bond Strategy",
    creator: "safe-investor.eth",
    apy: 5.5,
    tvl: 2100000,
    sharpeRatio: 0.9,
    forks: 23,
    isListed: false,
  },
]

export default function MarketplacePage() {
  const [filteredStrategies, setFilteredStrategies] = useState(mockStrategies)
  const [sortBy, setSortBy] = useState("performance")
  const [searchTerm, setSearchTerm] = useState("")

  const handleFilter = (newFilters: any) => {
    let filtered = mockStrategies

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.creator.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Sort
    switch (sortBy) {
      case "performance":
        filtered = filtered.sort((a, b) => b.apy - a.apy)
        break
      case "tvl":
        filtered = filtered.sort((a, b) => b.tvl - a.tvl)
        break
      case "recent":
        filtered = filtered.reverse()
        break
      case "price":
        filtered = filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
    }

    setFilteredStrategies(filtered)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Strategy Marketplace
              </span>
            </h1>
            <p className="text-muted-foreground">Discover, fork, and trade proven yield strategies</p>
          </div>
        </div>

        {/* Trending Carousel */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Trending Strategies</h2>
            <TrendingCarousel strategies={mockStrategies.slice(0, 3)} />
          </div>
        </div>

        {/* Filters & Search */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search strategies..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  handleFilter({})
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value)
                  handleFilter({})
                }}
                className="px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="performance">Sort by Performance</option>
                <option value="tvl">Sort by TVL</option>
                <option value="recent">Sort by Recent</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Strategy Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStrategies.map((strategy) => (
                <StrategyCard key={strategy.id} strategy={strategy} />
              ))}
            </div>

            {filteredStrategies.length === 0 && (
              <div className="text-center py-16">
                <div className="text-muted-foreground mb-2">No strategies found</div>
                <div className="text-sm text-muted-foreground">Try adjusting your search or filters</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
