# Quick Start Guide - Base Sepolia Deployment

## 🎯 TL;DR - Deploy in 5 Minutes

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# 2. Get test ETH
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# 3. Build & Deploy
forge build
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org --broadcast --verify

# 4. Save addresses from deployments/base-sepolia.json
```

## 📋 Prerequisites

### 1. Get Base Sepolia ETH

```bash
# Option 1: Coinbase Faucet (recommended)
https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# Option 2: Alchemy Faucet
https://sepoliafaucet.com/

# You need ~0.1 ETH for deployment
```

### 2. Setup Environment

```bash
# Copy example env
cp .env.example .env

# Edit .env:
nano .env

# Add:
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_basescan_key  # Get from basescan.org
```

### 3. Verify Your Setup

```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url https://sepolia.base.org

# Should show > 0.1 ETH
```

## 🚀 Deployment Steps

### Step 1: Test Locally

```bash
# Compile contracts
forge build

# Run tests (when ready)
forge test

# Check contract sizes
forge build --sizes
```

### Step 2: Deploy to Base Sepolia

```bash
# Dry run (simulation)
forge script script/Deploy.s.sol --rpc-url https://sepolia.base.org

# Actual deployment
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify \
  -vvvv
```

### Step 3: Verify Contracts

```bash
# Verification happens automatically with --verify flag
# If it fails, manually verify:

forge verify-contract \
  CONTRACT_ADDRESS \
  src/core/StrategyNFT.sol:StrategyNFT \
  --chain-id 84532 \
  --etherscan-api-key $BASESCAN_API_KEY
```

### Step 4: Save Deployment Info

```bash
# Addresses are saved to:
cat deployments/base-sepolia.json

# Example output:
{
  "network": "base-sepolia",
  "chainId": 84532,
  "contracts": {
    "StrategyNFT": "0x...",
    "StrategyRegistry": "0x...",
    ...
  }
}
```

## ✅ Post-Deployment Checklist

### 1. Verify on BaseScan

```bash
# Visit BaseScan and check each contract:
https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS

# Verify:
✅ Contract is verified (green checkmark)
✅ "Read Contract" tab works
✅ "Write Contract" tab available
```

### 2. Test Basic Functions

```bash
# Check NFT name
cast call NFT_ADDRESS "name()" --rpc-url https://sepolia.base.org

# Should return: "Composable Strategy NFT"

# Check registry
cast call REGISTRY_ADDRESS "isProtocolAllowed(address)" \
  0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4 \
  --rpc-url https://sepolia.base.org

# Should return: true (0x0000...0001)
```

### 3. Create Test Strategy

```bash
# Use the frontend or etherscan to:
# 1. Call StrategyRegistry.encodeStrategy()
# 2. Call StrategyNFT.mintStrategy()
# 3. Check your NFT on BaseScan
```

## 🔧 Troubleshooting

### Issue: "Insufficient funds"

```bash
# Check balance
cast balance YOUR_ADDRESS --rpc-url https://sepolia.base.org

# Get more from faucet
```

### Issue: "Nonce too high"

```bash
# Reset nonce
cast nonce YOUR_ADDRESS --rpc-url https://sepolia.base.org

# Or wait a few minutes and retry
```

### Issue: "Contract verification failed"

```bash
# Manually verify later
forge verify-contract ADDRESS CONTRACT_NAME --chain-id 84532

# Or check:
# 1. Compiler version matches (0.8.24)
# 2. Optimizer settings match (200 runs)
# 3. Constructor args are correct
```

### Issue: "Execution reverted"

```bash
# Run with verbose output
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.base.org \
  -vvvv

# Check specific error in output
```

## 📖 Next Steps

### 1. Frontend Integration

```bash
# Copy addresses to frontend
cp deployments/base-sepolia.json ../composa-frontend/contracts/addresses.json

# Update frontend config
# See: composa-frontend/lib/contracts.ts
```

### 2. Create First Strategy

```typescript
// Example: Simple swap strategy
const steps = [
  {
    actionType: 0, // Swap
    protocol: "0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4", // Uniswap
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    params: ethers.utils.defaultAbiCoder.encode(
      ["uint24", "uint256"],
      [3000, 0] // 0.3% fee, no min output
    ),
  },
];
```

### 3. Test Full Flow

1. **Mint Strategy NFT**
2. **Register Strategy**
3. **Create Vault**
4. **Deposit Funds**
5. **Execute Strategy**
6. **List on Marketplace**

## 🆘 Getting Help

### Community Resources

- **GitHub Issues**: [Your repo]/issues
- **Base Discord**: https://discord.gg/buildonbase
- **Base Docs**: https://docs.base.org/

### Useful Commands

```bash
# Check deployment status
cast receipt TX_HASH --rpc-url https://sepolia.base.org

# Get contract code
cast code CONTRACT_ADDRESS --rpc-url https://sepolia.base.org

# Call any function
cast call CONTRACT_ADDRESS "functionName()" --rpc-url https://sepolia.base.org

# Send transaction
cast send CONTRACT_ADDRESS "functionName()" --rpc-url https://sepolia.base.org --private-key $PRIVATE_KEY
```

## 🎉 Success Criteria

Your deployment is successful when:

✅ All contracts deployed and verified on BaseScan  
✅ Registry has Uniswap whitelisted  
✅ Can mint a strategy NFT  
✅ Can create a vault for a strategy  
✅ Frontend can connect to contracts

**Congratulations! You're ready to build composable yield strategies! 🚀**
