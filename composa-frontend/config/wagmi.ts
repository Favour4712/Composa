import { cookieStorage, createStorage, http } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { baseSepolia } from "@reown/appkit/networks";

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is not defined");
}

export const networks = [baseSepolia];

const baseSepoliaRpcUrl = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [baseSepolia.id]: http(baseSepoliaRpcUrl ?? "https://sepolia.base.org"),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
