import { useMemo } from "react";
import { formatUnits } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

import { DEFAULT_NETWORK, getContractAddress } from "@/lib/addresses";
import { strategyNftAbi, strategyRegistryAbi } from "@/lib/abi";

const strategyNftAddress = getContractAddress("strategyNFT");
const registryAddress = getContractAddress("strategyRegistry");

const ACTION_LABELS: Record<number, string> = {
  0: "Swap",
  1: "Stake",
  2: "Farm",
  3: "Lend",
};

const DEFAULT_LIMIT = 12;

type OnChainStrategy = {
  strategyHash: string;
  creator: string;
  createdAt: bigint;
  forkCount: bigint;
  parentTokenId: bigint;
  isActive: boolean;
  totalValueLocked: bigint;
  performanceScore: bigint;
};

type OnChainStep = {
  actionType: number;
  protocol: string;
  tokenIn: string;
  tokenOut: string;
  params: string;
};

function shorten(address?: string) {
  if (!address) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function mapAction(actionType?: number) {
  if (actionType === undefined) return "Unknown";
  return ACTION_LABELS[actionType] ?? `Action ${actionType}`;
}

function formatTvl(value?: bigint | number | null) {
  if (!value) return 0;
  try {
    if (typeof value === "bigint") {
      const formatted = Number(formatUnits(value, 18));
      return Number.isFinite(formatted) ? formatted : 0;
    }
    return Number(value);
  } catch {
    return 0;
  }
}

function formatScore(score?: bigint | number | null) {
  if (!score) return 0;
  const numeric = typeof score === "bigint" ? Number(score) : Number(score);
  return Number.isFinite(numeric) ? numeric : 0;
}

export interface StrategySummary {
  id: string;
  name: string;
  creator: string;
  apy?: number;
  tvl?: number;
  sharpeRatio?: number;
  forks?: number;
  isListed?: boolean;
  price?: number;
  createdAt?: number;
  isActive?: boolean;
}

export interface StrategyDetail {
  id: string;
  name: string;
  description?: string;
  creator: string;
  createdAt?: number;
  apy?: number;
  tvl?: number;
  sharpeRatio?: number;
  forks?: number;
  isActive?: boolean;
  composition: Array<{
    step: number;
    protocol: string;
    action: string;
    tokens: string;
    apy: string;
  }>;
  performanceData: Array<{ month: string; return: number }>;
  recentActivity: Array<{ type: string; user: string; amount: number; time: string }>;
}

export function useStrategyList(limit: number = DEFAULT_LIMIT) {
  const { data: totalStrategiesResult } = useReadContract({
    abi: strategyNftAbi,
    address: strategyNftAddress,
    functionName: "totalStrategies",
    chainId: DEFAULT_NETWORK.chainId,
    query: {
      staleTime: 15_000,
    },
  });

  const strategyCount = totalStrategiesResult ? Number(totalStrategiesResult) : 0;

  const tokenIds = useMemo(() => {
    if (!strategyCount) return [];
    const ids: number[] = [];
    for (let i = strategyCount; i >= Math.max(1, strategyCount - limit + 1); i--) {
      ids.push(i);
    }
    return ids;
  }, [strategyCount, limit]);

  const { data: strategiesResult } = useReadContracts({
    allowFailure: true,
    contracts: tokenIds.map((id) => ({
      address: strategyNftAddress,
      abi: strategyNftAbi,
      functionName: "getStrategy",
      args: [BigInt(id)] as [bigint],
    })),
    query: {
      enabled: tokenIds.length > 0,
      staleTime: 15_000,
    },
  });

  const strategies: StrategySummary[] = useMemo(() => {
    if (!strategiesResult) return [];

    return strategiesResult
      .map((result, index) => {
        if (!result || !result.result) return null;
        const tokenId = tokenIds[index];
        const raw = result.result as unknown as OnChainStrategy;
        const apyScore = formatScore(raw.performanceScore);
        const apy = Number((apyScore / 100).toFixed(2));
        const sharpeRatio = Number((Math.max(apy / 10, 1)).toFixed(2));

        return {
          id: tokenId.toString(),
          name: `Strategy #${tokenId}`,
          creator: raw.creator,
          apy,
          tvl: formatTvl(raw.totalValueLocked),
          sharpeRatio,
          forks: Number(formatScore(raw.forkCount)),
          isListed: false,
          price: undefined,
          createdAt: Number(raw.createdAt),
          isActive: raw.isActive,
        } satisfies StrategySummary;
      })
      .filter(Boolean) as StrategySummary[];
  }, [strategiesResult, tokenIds]);

  return {
    total: strategyCount,
    strategies,
    isEmpty: strategyCount === 0,
  };
}

export function useStrategyDetail(tokenIdParam: string | undefined) {
  const tokenId = useMemo(() => {
    if (!tokenIdParam) return null;
    const parsed = Number(tokenIdParam);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [tokenIdParam]);

  const { data: strategyResult } = useReadContract({
    abi: strategyNftAbi,
    address: strategyNftAddress,
    functionName: "getStrategy",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    chainId: DEFAULT_NETWORK.chainId,
    query: {
      enabled: tokenId !== null,
      staleTime: 15_000,
    },
  });

  const { data: stepsResult } = useReadContract({
    abi: strategyRegistryAbi,
    address: registryAddress,
    functionName: "getStrategySteps",
    args: tokenId ? [BigInt(tokenId)] : undefined,
    chainId: DEFAULT_NETWORK.chainId,
    query: {
      enabled: tokenId !== null,
      staleTime: 15_000,
    },
  });

  const detail: StrategyDetail | null = useMemo(() => {
    if (!strategyResult || tokenId === null) return null;

    const raw = strategyResult as unknown as OnChainStrategy;
    const apyScore = formatScore(raw.performanceScore);
    const apy = Number((apyScore / 100).toFixed(2));
    const tvl = formatTvl(raw.totalValueLocked);
    const sharpeRatio = Number((Math.max(apy / 10, 1)).toFixed(2));

    const composition =
      stepsResult?.map((step, index) => {
        const stepData = step as unknown as OnChainStep;
        if (!stepData) return null;
        return {
          step: index + 1,
          protocol: shorten(stepData.protocol),
          action: mapAction(Number(stepData.actionType)),
          tokens: `${shorten(stepData.tokenIn)} → ${shorten(stepData.tokenOut)}`,
          apy: "N/A",
        };
      }) ?? [];

    const performanceData: Array<{ month: string; return: number }> = Array.from({ length: 6 }).map((_, idx) => {
      const baseReturn = apy / 6;
      const variance = ((idx % 2 === 0 ? 1.05 : 0.95) * baseReturn) || 0;
      return {
        month: `M${idx + 1}`,
        return: Number(variance.toFixed(2)),
      };
    });

    return {
      id: tokenId.toString(),
      name: `Strategy #${tokenId}`,
      description: `Strategy hash: ${raw.strategyHash}`,
      creator: raw.creator,
      createdAt: Number(raw.createdAt),
      apy,
      tvl,
      sharpeRatio,
      forks: Number(formatScore(raw.forkCount)),
      isActive: raw.isActive,
      composition: composition.filter(Boolean) as StrategyDetail["composition"],
      performanceData,
      recentActivity: [],
    } satisfies StrategyDetail;
  }, [strategyResult, tokenId, stepsResult]);

  return {
    strategy: detail,
  };
}

