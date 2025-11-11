# Composable Yield Strategies NFT - Smart Contracts

A comprehensive DeFi protocol that enables users to create, fork, trade, and execute composable yield strategies as NFTs on Base Sepolia.

## 🏗️ Architecture

### Core Contracts

- **StrategyNFT**: ERC721 NFT representing yield strategies with ERC2981 royalties
- **StrategyRegistry**: Stores and validates strategy configurations
- **StrategyExecutor**: Manages strategy execution permissions and cooldowns

### Execution Layer

- **StrategyRunner**: Executes multi-step strategies with slippage protection
- **ProtocolAdapter**: Abstract base for protocol integrations
- **UniswapAdapter**: Uniswap V3 swap integration
- **AaveAdapter**: Aave V3 lending integration
- **CompoundAdapter**: Compound V3 lending integration

### Vault System

- **StrategyVault**: ERC4626-style vaults for strategy deposits
- **VaultFactory**: Factory for deploying strategy vaults

### Marketplace

- **StrategyMarketplace**: Buy/sell strategies with offers system
- **RoyaltyManager**: Manages creator royalties on secondary sales

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd composa-contract

# Install dependencies
forge install

# Copy environment variables
cp .env.example .env
# Edit .env with your private key and API keys
```

## 🚀 Deployment

### Deploy to Base Sepolia

```bash
# Load environment variables
source .env

# Deploy all contracts
forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --verify

# Or deploy without verification first
forge script script/Deploy.s.sol:DeployScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

### Verify Contracts on Basescan

```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_NAME> --chain-id 84532 --etherscan-api-key $BASESCAN_API_KEY
```

## 🧪 Testing

```bash
# Run all tests
forge test

# Run tests with gas reporting
forge test --gas-report

# Run specific test file
forge test --match-path test/unit/StrategyNFT.t.sol

# Run with verbosity for detailed output
forge test -vvv
```

## 📝 Contract Interactions

### Creating a Strategy

```solidity
// 1. Encode strategy steps
IStrategyRegistry.Step[] memory steps = new IStrategyRegistry.Step[](2);
steps[0] = IStrategyRegistry.Step({
    actionType: 0, // Swap
    protocol: UNISWAP_ROUTER,
    tokenIn: USDC,
    tokenOut: WETH,
    params: abi.encode(3000, 0) // fee tier, min output
});
steps[1] = IStrategyRegistry.Step({
    actionType: 3, // Lend
    protocol: AAVE_POOL,
    tokenIn: WETH,
    tokenOut: aWETH,
    params: abi.encode(0) // referral code
});

bytes memory strategyData = strategyRegistry.encodeStrategy(steps);
bytes32 strategyHash = keccak256(strategyData);

// 2. Mint strategy NFT
uint256 tokenId = strategyNFT.mintStrategy(strategyHash, strategyData);

// 3. Register strategy
strategyRegistry.registerStrategy(tokenId, strategyData);

// 4. Create vault
address vault = vaultFactory.createVault(tokenId, USDC);
```

### Executing a Strategy

```solidity
// Deposit to vault
IERC20(USDC).approve(vault, amount);
IStrategyVault(vault).deposit(amount);

// Execute strategy (as strategy owner)
IStrategyVault(vault).executeStrategy();
```

### Trading on Marketplace

```solidity
// List strategy for sale
strategyNFT.approve(marketplace, tokenId);
strategyMarketplace.listStrategy(tokenId, price);

// Buy strategy
strategyMarketplace.buyStrategy{value: price}(tokenId);
```

## 🔧 Configuration

### Base Sepolia Protocol Addresses

- **Uniswap V3 Router**: `0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4`
- **Uniswap V3 Quoter**: `0xC5290058841028F1614F3A6F0F5816cAd0df5E27`
- **Aave V3 Pool**: TBD
- **Compound V3 Comet**: TBD

### Adding Custom Protocols

```bash
# Set environment variables
export CUSTOM_PROTOCOL=0x...
export CUSTOM_ADAPTER=0x...

# Run setup script
forge script script/SetupProtocols.s.sol:SetupProtocolsScript --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

## 📊 Contract Sizes

```bash
# Check contract sizes
forge build --sizes
```

## 🔒 Security Considerations

- All contracts use OpenZeppelin's battle-tested libraries
- Reentrancy guards on all state-changing functions
- Access control via Ownable2Step for safe ownership transfers
- Pausable emergency controls on vaults
- Slippage protection on strategy execution
- Cooldown periods to prevent flash loan attacks

## 🛠️ Development Tools

- **Foundry**: Smart contract development framework
- **Solidity**: ^0.8.20
- **OpenZeppelin**: Security-audited contract libraries

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

## 📞 Support

For issues and questions, please open a GitHub issue.

## 🗺️ Roadmap

- [ ] Comprehensive test suite (unit, integration, fork tests)
- [ ] Gas optimization
- [ ] Additional protocol adapters (Curve, Balancer, Yearn)
- [ ] Strategy performance analytics
- [ ] Multi-chain deployment
- [ ] Governance system
- [ ] Strategy insurance/protection

## 📈 Contract Addresses (Base Sepolia)

After deployment, addresses will be available in `deployments/base-sepolia.json`:

```json
{
  "network": "base-sepolia",
  "chainId": 84532,
  "contracts": {
    "StrategyNFT": "0x...",
    "StrategyRegistry": "0x...",
    "StrategyExecutor": "0x...",
    "StrategyRunner": "0x...",
    "VaultFactory": "0x...",
    "StrategyMarketplace": "0x...",
    "RoyaltyManager": "0x..."
  }
}
```
