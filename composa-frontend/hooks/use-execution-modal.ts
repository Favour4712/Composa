"use client"

import { useState } from "react"

interface ExecutionState {
  isOpen: boolean
  strategyId: string | null
  step: "input" | "preview" | "confirming" | "complete" | "error"
  amount: string
  slippage: string
  txHash: string | null
  error: string | null
}

export function useExecutionModal() {
  const [state, setState] = useState<ExecutionState>({
    isOpen: false,
    strategyId: null,
    step: "input",
    amount: "",
    slippage: "0.5",
    txHash: null,
    error: null,
  })

  const open = (strategyId: string) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      strategyId,
      step: "input",
      amount: "",
      error: null,
    }))
  }

  const close = () => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }

  const setAmount = (amount: string) => {
    setState((prev) => ({ ...prev, amount }))
  }

  const setSlippage = (slippage: string) => {
    setState((prev) => ({ ...prev, slippage }))
  }

  const goToPreview = () => {
    setState((prev) => ({ ...prev, step: "preview" }))
  }

  const goToConfirming = () => {
    setState((prev) => ({ ...prev, step: "confirming" }))
  }

  const setComplete = (txHash: string) => {
    setState((prev) => ({ ...prev, step: "complete", txHash }))
  }

  const setError = (error: string) => {
    setState((prev) => ({ ...prev, step: "error", error }))
  }

  return {
    ...state,
    open,
    close,
    setAmount,
    setSlippage,
    goToPreview,
    goToConfirming,
    setComplete,
    setError,
  }
}
