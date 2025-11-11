"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useAccount, useReadContract } from "wagmi";

import { DEFAULT_NETWORK, getContractAddress } from "@/lib/addresses";

import { strategyNftAbi } from "@/lib/abi";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { address, isConnected } = useAccount();

  const { data: totalStrategies } = useReadContract({
    abi: strategyNftAbi,
    address: getContractAddress("strategyNFT"),
    functionName: "totalStrategies",
    chainId: DEFAULT_NETWORK.chainId,
    query: {
      staleTime: 15_000,
    },
  });

  const totalStrategiesLabel = useMemo(() => {
    if (typeof totalStrategies === "bigint") {
      try {
        return Number(totalStrategies).toLocaleString();
      } catch {
        return totalStrategies.toString();
      }
    }
    return "—";
  }, [totalStrategies]);

  const truncatedAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  return (
    <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/50 transition-all">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="hidden sm:inline font-bold text-lg bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Composa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            <NavLink href="/strategies">Strategies</NavLink>
            <NavLink href="/marketplace">Marketplace</NavLink>
            <NavLink href="/portfolio">My Portfolio</NavLink>
            <NavLink href="/docs">Docs</NavLink>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Network Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">Base Sepolia</span>
              <span className="h-4 w-px bg-border/70" aria-hidden="true" />
              <span className="text-foreground/80">
                Strategies: {totalStrategiesLabel}
              </span>
            </div>

            {/* Wallet Button */}
            <div className="hidden sm:block">
              <appkit-button />
            </div>

            {isConnected && (
              <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground/80">
                {truncatedAddress}
              </div>
            )}

            {/* Mobile Connect */}
            <div className="sm:hidden">
              <appkit-button size="sm" />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-card rounded-lg transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-border pt-4">
            <MobileNavLink href="/strategies">Strategies</MobileNavLink>
            <MobileNavLink href="/marketplace">Marketplace</MobileNavLink>
            <MobileNavLink href="/portfolio">My Portfolio</MobileNavLink>
            <MobileNavLink href="/docs">Docs</MobileNavLink>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors relative group"
    >
      {children}
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-sm font-medium hover:bg-card rounded-lg transition"
    >
      {children}
    </Link>
  );
}
