"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useExecutionModal } from "@/hooks/use-execution-modal"
import ExecutionModal from "./execution-modal"

interface ExecutionContextType {
  openExecution: (strategyId: string) => void
  closeExecution: () => void
}

const ExecutionContext = createContext<ExecutionContextType | null>(null)

export function StrategyExecutionProvider({ children }: { children: ReactNode }) {
  const modal = useExecutionModal()

  const handleConfirm = async () => {
    modal.goToConfirming()

    // Simulate transaction
    setTimeout(() => {
      const mockTxHash = "0x" + Math.random().toString(16).slice(2)
      modal.setComplete(mockTxHash)
    }, 2000)
  }

  return (
    <ExecutionContext.Provider
      value={{
        openExecution: modal.open,
        closeExecution: modal.close,
      }}
    >
      {children}
      <ExecutionModal
        isOpen={modal.isOpen}
        step={modal.step}
        amount={modal.amount}
        slippage={modal.slippage}
        txHash={modal.txHash}
        error={modal.error}
        onClose={modal.close}
        onAmountChange={modal.setAmount}
        onSlippageChange={modal.setSlippage}
        onPreview={modal.goToPreview}
        onConfirm={handleConfirm}
      />
    </ExecutionContext.Provider>
  )
}

export function useStrategyExecution() {
  const context = useContext(ExecutionContext)
  if (!context) {
    throw new Error("useStrategyExecution must be used within StrategyExecutionProvider")
  }
  return context
}
