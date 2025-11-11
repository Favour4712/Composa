"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/navbar";
import StrategyDetailTabs from "@/components/strategy-detail/strategy-detail-tabs";
import StrategySidebar from "@/components/strategy-detail/strategy-sidebar";
import { useStrategyDetail } from "@/lib/hooks/useStrategyData";

export default function StrategyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const { strategy } = useStrategyDetail(params.id);

  const createdDate = useMemo(() => {
    if (!strategy?.createdAt) return null;
    const date = new Date(strategy.createdAt * 1000);
    return date.toLocaleDateString();
  }, [strategy?.createdAt]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* NFT Preview */}
              <div className="lg:col-span-2">
                <div className="relative aspect-video rounded-xl glassmorphism border border-border overflow-hidden bg-linear-to-br from-primary/30 via-accent/20 to-background group cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-10 group-hover:opacity-20 transition">
                    ◈
                  </div>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-4">
                <div className="glassmorphism border border-border p-4 rounded-xl space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                      Strategy Name
                    </div>
                    <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                      {strategy?.name ?? `Strategy #${params.id}`}
                    </h1>
                  </div>
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Creator
                      </div>
                      <div className="text-sm font-semibold">
                        {strategy?.creator ?? "Unknown"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Created
                      </div>
                      <div className="text-sm font-semibold">
                        {createdDate ?? "—"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        Status
                      </div>
                      <div className="text-sm font-semibold">
                        {strategy?.isActive === false ? "Inactive" : "Active"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {strategy ? (
                <StrategyDetailTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  strategy={strategy}
                />
              ) : (
                <div className="glassmorphism border border-border rounded-xl p-10 text-center text-muted-foreground">
                  Loading strategy data from Base Sepolia…
                </div>
              )}
            </div>

            {/* Sidebar */}
            {strategy && <StrategySidebar strategy={strategy} />}
          </div>
        </div>
      </div>
    </div>
  );
}
