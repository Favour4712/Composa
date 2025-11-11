export interface ContractAddresses {
  strategyNFT: `0x${string}`;
  strategyRegistry: `0x${string}`;
  strategyExecutor: `0x${string}`;
  strategyRunner: `0x${string}`;
  uniswapAdapter: `0x${string}`;
  compoundAdapter: `0x${string}`;
  vaultFactory: `0x${string}`;
  vaultImplementation: `0x${string}`;
  strategyMarketplace: `0x${string}`;
  royaltyManager: `0x${string}`;
}

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrlEnv: string;
  explorerBaseUrl: string;
  contracts: ContractAddresses;
}

export const BASE_SEPOLIA_ADDRESSES: NetworkConfig = {
  name: "Base Sepolia",
  chainId: 84532,
  rpcUrlEnv: "NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL",
  explorerBaseUrl: "https://sepolia.basescan.org",
  contracts: {
    strategyNFT: "0x773B34Aa15BC7A5301a4931338bF30C3b68024C4",
    strategyRegistry: "0x706d9E27Da8127744Ee15403b94B3Ead4Cc1f1C0",
    strategyExecutor: "0x0398Fa4630A7ca7De128135726D40647249dc445",
    strategyRunner: "0xe4557801Ae5eC5960FB2Dc8e43C4A0c2933978EA",
    uniswapAdapter: "0x7868Fe9eB48cD492d2c8E91b26c0cCB03fbDa4b7",
    compoundAdapter: "0x1297EDe0a1f4F47742D380ba964CE119bd48Ccbc",
    vaultFactory: "0x5453315f5E0e19dC2835a8017176f42D700660A9",
    vaultImplementation: "0xBC29F371688E32DeDb487E88217C6343fa470d97",
    strategyMarketplace: "0xAb167Fbb055184f0Bc2Cb4FB9C6F98ebC95e9Ef8",
    royaltyManager: "0x7a88B37F8bAE94F15DAA2e65F55AE5134e3a142e",
  },
};

export const NETWORKS: Record<number, NetworkConfig> = {
  [BASE_SEPOLIA_ADDRESSES.chainId]: BASE_SEPOLIA_ADDRESSES,
};

export const DEFAULT_NETWORK = BASE_SEPOLIA_ADDRESSES;

export function getContractAddress(
  contract: keyof ContractAddresses,
  chainId: number = DEFAULT_NETWORK.chainId
): `0x${string}` {
  const network = NETWORKS[chainId] ?? DEFAULT_NETWORK;
  return network.contracts[contract];
}

export function getExplorerLink(
  contract: keyof ContractAddresses,
  chainId: number = DEFAULT_NETWORK.chainId
): string {
  const address = getContractAddress(contract, chainId);
  const network = NETWORKS[chainId] ?? DEFAULT_NETWORK;
  return `${network.explorerBaseUrl}/address/${address}`;
}
