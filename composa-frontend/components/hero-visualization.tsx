"use client"

import { useEffect, useRef } from "react"

export default function HeroVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()

    let animationId: number
    let time = 0

    const nodes = [
      { x: 150, y: 100, label: "Uniswap", color: "#FF007A" },
      { x: 250, y: 200, label: "Aave", color: "#62B1BB" },
      { x: 100, y: 280, label: "Compound", color: "#25292e" },
      { x: 300, y: 300, label: "Curve", color: "#FF0844" },
    ]

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = "rgba(8, 20, 40, 0.1)"
      ctx.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio)

      time += 0.01

      // Draw animated connections
      ctx.strokeStyle = "rgba(147, 51, 234, 0.3)"
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const nextNode = nodes[(i + 1) % nodes.length]
        const offset = Math.sin(time + i) * 10
        ctx.moveTo(node.x, node.y)
        ctx.bezierCurveTo(node.x + 50, node.y + offset, nextNode.x - 50, nextNode.y + offset, nextNode.x, nextNode.y)
      }
      ctx.stroke()

      // Draw animated nodes
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time * 2 + i) * 5 + 15

        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulse + 10)
        gradient.addColorStop(0, node.color + "40")
        gradient.addColorStop(1, node.color + "00")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulse + 10, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2)
        ctx.fill()

        // Border
        ctx.strokeStyle = node.color + "CC"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Draw NFT card placeholder in center
      const centerX = 200
      const centerY = 150
      const cardW = 120
      const cardH = 160

      // Card glow
      ctx.shadowColor = "rgba(147, 51, 234, 0.5)"
      ctx.shadowBlur = 30

      ctx.fillStyle = "rgba(147, 51, 234, 0.2)"
      ctx.fillRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH)

      ctx.strokeStyle = "rgba(147, 51, 234, 0.6)"
      ctx.lineWidth = 2
      ctx.strokeRect(centerX - cardW / 2, centerY - cardH / 2, cardW, cardH)

      ctx.shadowBlur = 0

      animationId = requestAnimationFrame(animate)
    }

    animate()

    window.addEventListener("resize", resizeCanvas)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Floating stat cards */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-10 right-10 glassmorphism p-4 rounded-lg animate-bounce"
          style={{ animationDelay: "0s" }}
        >
          <div className="text-sm text-primary font-semibold">APY</div>
          <div className="text-2xl font-bold text-accent">24.5%</div>
        </div>
        <div
          className="absolute bottom-20 left-10 glassmorphism p-4 rounded-lg animate-bounce"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="text-sm text-primary font-semibold">TVL</div>
          <div className="text-2xl font-bold text-accent">$2.3M</div>
        </div>
      </div>
    </div>
  )
}
