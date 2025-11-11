"use client"
import { X, AlertCircle, CheckCircle } from "lucide-react"

interface ExecutionModalProps {
  isOpen: boolean
  step: "input" | "preview" | "confirming" | "complete" | "error"
  amount: string
  slippage: string
  txHash: string | null
  error: string | null
  onClose: () => void
  onAmountChange: (amount: string) => void
  onSlippageChange: (slippage: string) => void
  onPreview: () => void
  onConfirm: () => void
}

export default function ExecutionModal({
  isOpen,
  step,
  amount,
  slippage,
  txHash,
  error,
  onClose,
  onAmountChange,
  onSlippageChange,
  onPreview,
  onConfirm,
}: ExecutionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full glassmorphism">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-xl font-bold">Execute Strategy</h2>
          <button onClick={onClose} className="p-1 hover:bg-background rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "input" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Deposit Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button className="px-4 py-3 rounded-lg bg-muted text-muted-foreground font-medium">USDC</button>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Balance: 1,500 USDC</div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Slippage Tolerance</label>
                <div className="flex gap-2">
                  {["0.1", "0.5", "1.0"].map((value) => (
                    <button
                      key={value}
                      onClick={() => onSlippageChange(value)}
                      className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                        slippage === value ? "bg-primary text-white" : "border border-border hover:border-primary/50"
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => onSlippageChange(e.target.value)}
                    placeholder="Custom"
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="glassmorphism bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                <div className="flex gap-2 text-sm text-yellow-400">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <p>Smart contract audited but not risk-free. DeFi carries inherent risks.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50">
                <button
                  onClick={onClose}
                  className="py-3 rounded-lg border border-border hover:border-primary/50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={onPreview}
                  disabled={!amount}
                  className="py-3 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 disabled:hover:shadow-none transition text-white font-semibold"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="space-y-3 bg-background p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">You deposit</span>
                  <span className="font-semibold">{amount} USDC</span>
                </div>
                <div className="border-t border-border/50 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Step 1: Swap</span>
                    <span className="text-xs text-muted-foreground">0.5 USDC</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Step 2: Provide Liquidity</span>
                    <span className="text-xs text-muted-foreground">0.3 USDC</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Step 3: Farm</span>
                    <span className="text-xs text-muted-foreground">0.2 USDC</span>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                  <span className="text-muted-foreground">Est. return (30d)</span>
                  <span className="font-bold text-accent">
                    +{(Number.parseFloat(amount || "0") * 0.315).toFixed(2)} USDC
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onClose()}
                  className="py-3 rounded-lg border border-border hover:border-primary/50 font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={onConfirm}
                  className="py-3 rounded-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/40 transition text-white font-semibold"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {step === "confirming" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Executing Strategy</p>
                <p className="text-sm text-muted-foreground mt-1">Confirm in your wallet</p>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle size={48} className="text-green-400" />
              <div className="text-center">
                <p className="font-semibold">Strategy Executed!</p>
                <p className="text-sm text-muted-foreground mt-1">Your capital is now deployed</p>
              </div>
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-accent transition"
              >
                View transaction
              </a>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold transition"
              >
                Done
              </button>
            </div>
          )}

          {step === "error" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle size={48} className="text-destructive" />
              <div className="text-center">
                <p className="font-semibold">Execution Failed</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-lg border border-border hover:border-primary/50 font-semibold transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
