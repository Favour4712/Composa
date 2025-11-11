"use client"

import { MoreVertical, DollarSign } from "lucide-react"

interface Listing {
  id: string
  strategy: string
  price: number
  soldCount: number
  royaltyEarned: number
}

const myListings: Listing[] = [
  {
    id: "1",
    strategy: "Uniswap V3 Alpha",
    price: 0.5,
    soldCount: 12,
    royaltyEarned: 2.4,
  },
  {
    id: "2",
    strategy: "Conservative Yield",
    price: 0.2,
    soldCount: 34,
    royaltyEarned: 1.9,
  },
]

export default function MyListings() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Listings</h2>
        <div className="text-sm text-muted-foreground">
          Total Royalties: {myListings.reduce((sum, l) => sum + l.royaltyEarned, 0).toFixed(1)} ETH
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {myListings.map((listing) => (
          <div key={listing.id} className="glassmorphism border border-border p-6 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground mb-2">{listing.strategy}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Price</div>
                    <div className="text-2xl font-bold text-primary">{listing.price} ETH</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Copies Sold</div>
                    <div className="text-2xl font-bold text-accent">{listing.soldCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">Royalties</div>
                    <div className="text-2xl font-bold text-green-400">{listing.royaltyEarned} ETH</div>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-card rounded-lg transition">
                <MoreVertical size={18} className="text-muted-foreground" />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm transition">
                <DollarSign size={16} />
                Adjust Price
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive/50 hover:border-destructive hover:bg-destructive/10 text-destructive font-medium text-sm transition">
                Delist
              </button>
            </div>
          </div>
        ))}
      </div>

      {myListings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No listings yet. Create and mint a strategy to get started.</p>
        </div>
      )}
    </div>
  )
}
