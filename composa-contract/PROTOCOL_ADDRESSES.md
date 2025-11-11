# Protocol Addresses on Base Sepolia

## ✅ Verified Deployments

### Uniswap V3

All Uniswap V3 contracts are fully deployed on Base Sepolia:

| Contract                   | Address                                      | Status      |
| -------------------------- | -------------------------------------------- | ----------- |
| UniswapV3Factory           | `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24` | ✅ Verified |
| SwapRouter02               | `0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4` | ✅ Verified |
| QuoterV2                   | `0xC5290058841028F1614F3A6F0F5816cAd0df5E27` | ✅ Verified |
| NonfungiblePositionManager | `0x27F971cb582BF9E50F397e4d29a5C7A34f11faA2` | ✅ Verified |
| TickLens                   | `0xedf6066a2b290C185783862C7F4776A2C8077AD1` | ✅ Verified |

**Official Docs**: https://docs.uniswap.org/contracts/v3/reference/deployments/base-deployments

### Base Sepolia Test Tokens

Common test tokens you can use:

| Token       | Address                                      | How to Get          |
| ----------- | -------------------------------------------- | ------------------- |
| WETH        | `0x4200000000000000000000000000000000000006` | Base Sepolia Faucet |
| USDC (Mock) | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Compound Faucet     |
| cbETH       | `0x774eD9EDB0C5202dF9A86183804b5D9E99dC6CA3` | Compound Faucet     |

## 🎯 Protocol Status Summary

| Protocol    | Status           | Use Case                   |
| ----------- | ---------------- | -------------------------- |
| Uniswap V3  | ✅ Deployed      | Token Swaps                |
| Compound V3 | ✅ Deployed      | Lending/Borrowing          |
| Aave V3     | ❌ Not Available | N/A - Use Compound instead |

> **Note**: We've optimized for Base Sepolia by using only Uniswap and Compound. This covers all major DeFi use cases (swaps + lending) without unnecessary complexity.

### Compound V3

**Status**: ✅ Deployed on Base Sepolia!

| Contract        | Address                                      | Status      |
| --------------- | -------------------------------------------- | ----------- |
| cUSDCv3 (Comet) | `0x571621Ce60Cebb0c1D442B5afb38B1663C6Bf017` | ✅ Verified |
| Rewards         | `0x3394fa1baCC0b47dd0fF28C8573a476a161aF7BC` | ✅ Verified |
| Bulker          | `0x7D25b2AecF07B5CB87B05e17Aa5cecbA8BCfDBD1` | ✅ Verified |
| USDC (Mock)     | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | ✅ Verified |
| WETH            | `0x4200000000000000000000000000000000000006` | ✅ Verified |
| cbETH           | `0x774eD9EDB0C5202dF9A86183804b5D9E99dC6CA3` | ✅ Verified |
| Faucet          | `0xD76cB57d8B097B80a6eE4D1b4d5ef872bfBa6051` | ✅ Verified |

**Official Docs**: https://docs.compound.finance/
**Faucet**: Use the Compound faucet to get test USDC!

## 🔍 How to Verify Addresses

### Method 1: BaseScan

```bash
# Visit BaseScan Sepolia
https://sepolia.basescan.org/address/0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4

# Check:
# 1. Contract is verified ✅
# 2. Read contract functions
# 3. Download ABI (json)
```

### Method 2: Foundry Cast

```bash
# Get contract code
cast code 0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4 --rpc-url https://sepolia.base.org

# Call a view function
cast call 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24 "owner()" --rpc-url https://sepolia.base.org
```

### Method 3: Etherscan API

```bash
# Get ABI via API
curl "https://api-sepolia.basescan.org/api?module=contract&action=getabi&address=0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4&apikey=YOUR_API_KEY"
```

## 📚 Getting Official ABIs/Interfaces

### Uniswap V3

```bash
# Install Uniswap V3 periphery (has interfaces)
forge install Uniswap/v3-periphery
forge install Uniswap/v3-core

# Then import:
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
```

### For Your Project

```bash
# Our adapters use simplified interfaces
# See: src/execution/adapters/UniswapAdapter.sol
```

## 🧪 Testing Strategy

### Phase 1: Uniswap Only (✅ Ready)

- Deploy with Uniswap adapter only
- Test swaps on Base Sepolia
- Build strategies with swap-only

### Phase 2: Add Lending (Choose one)

**Option A**: Fork Ethereum Sepolia (has Aave)

```bash
# In foundry.toml
[profile.sepolia-fork]
fork_url = "https://rpc.sepolia.org"
```

**Option B**: Deploy mock lending

```solidity
// Create MockLendingPool.sol
// Implement deposit/withdraw
// Test locally
```

**Option C**: Use Base Mainnet

- Requires real funds (small amounts)
- Production-ready testing

## 🚀 Next Steps

1. **Verify Uniswap works**:

```bash
cast call 0x94cC0AaC535CCDB3C01d6787D6413C739ae12bc4 "factory()" --rpc-url https://sepolia.base.org
```

2. **Get test ETH**:

   - Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - Alchemy Faucet: https://sepoliafaucet.com/

3. **Deploy your contracts**:

```bash
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast
```

4. **Create first strategy** (Uniswap only for now)

## 📖 Resources

- **Base Docs**: https://docs.base.org/
- **Uniswap V3 Docs**: https://docs.uniswap.org/
- **BaseScan**: https://sepolia.basescan.org/
- **Base Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
