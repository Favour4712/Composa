"use client";

import { type ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { baseSepolia } from "@reown/appkit/networks";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

import { projectId, wagmiAdapter, wagmiConfig, networks } from "@/config/wagmi";

const queryClient = new QueryClient();

const metadata = {
  name: "Composa",
  description: "Composable yield strategies on Base",
  url: "https://composa.app",
  icons: ["https://composa.app/icon.png"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: baseSepolia,
  metadata,
  features: {
    analytics: true,
  },
});

interface AppKitProviderProps {
  children: ReactNode;
  cookies: string | null;
}

export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  const initialState = useMemo(
    () => cookieToInitialState(wagmiConfig as Config, cookies ?? undefined),
    [cookies]
  );

  return (
    <WagmiProvider config={wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
