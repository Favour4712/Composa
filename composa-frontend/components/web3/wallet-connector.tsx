"use client"

import { useState } from "react"
import { Wallet, ChevronDown } from "lucide-react"

interface WalletConnectorProps {
  onConnect?: () => void
}

export default function WalletConnector({ onConnect }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleConnect = async () => {
    // Simulated wallet connection
    setIsConnected(true)
    setAddress("0x1234...5678")
    setIsOpen(false)
    onConnect?.()
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setAddress(null)
  }

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 transition text-white font-medium"
      >
        <Wallet size={18} />
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 transition font-medium"
      >
        <div className="w-2 h-2 rounded-full bg-green-500" />
        {address}
        <ChevronDown size={16} className={`transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glassmorphism border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 text-sm hover:bg-card/50 transition text-left"
          >
            {address}
          </button>
          <button
            onClick={() => {
              setIsOpen(false)
              // Open portfolio
            }}
            className="w-full px-4 py-2 text-sm hover:bg-card/50 transition text-left border-t border-border/50"
          >
            View Portfolio
          </button>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-sm hover:bg-destructive/20 transition text-left text-destructive border-t border-border/50"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
