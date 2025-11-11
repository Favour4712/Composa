# How Composable Strategies Work - Complete User Flow

## 🎯 The Big Picture

Think of it like this:

- **StrategyNFT** = Your recipe book (NFT ownership)
- **StrategyRegistry** = Recipe validator (checks if recipe is valid)
- **StrategyExecutor** = Kitchen manager (controls who can cook)
- **StrategyRunner** = The chef (actually cooks the recipe)
- **Protocol Adapters** = Kitchen appliances (Uniswap = blender, Compound = oven)
- **StrategyVault** = Community pot (everyone puts money in to cook together)
- **Marketplace** = Recipe trading platform

---

## 📖 User Flow 1: Creating a Strategy

### Step 1: Alice Designs a Strategy

```
Alice wants to create: "Swap ETH → USDC, then lend USDC on Compound"
```

**What Alice Does:**

```javascript
// Define the strategy steps
const steps = [
  {
    actionType: 0, // Swap
    protocol: UNISWAP_ROUTER,
    tokenIn: WETH,
    tokenOut: USDC,
    params: encodedSwapParams,
  },
  {
    actionType: 3, // Lend
    protocol: COMPOUND_COMET,
    tokenIn: USDC,
    tokenOut: cUSDC,
    params: "0x",
  },
];
```

### Step 2: Encode Strategy

```javascript
// StrategyRegistry.encodeStrategy(steps)
const encodedStrategy = encodeSteps(steps);
const strategyHash = keccak256(encodedStrategy);
```

**Contract Used:** `StrategyRegistry.sol` (validates & encodes)

### Step 3: Mint Strategy NFT

```javascript
// Alice mints her strategy as an NFT
StrategyNFT.mintStrategy(strategyHash, encodedStrategy);
// → Alice receives NFT #1
```

**Contract Used:** `StrategyNFT.sol` (creates NFT ownership)

**What Happens:**

```
StrategyNFT Contract:
├── Creates NFT #1
├── Sets Alice as creator
├── Stores strategy hash
└── Makes Alice the owner
```

### Step 4: Register Strategy Details

```javascript
// StrategyRegistry stores the actual steps
StrategyRegistry.registerStrategy(tokenId, encodedStrategy);
```

**Contract Used:** `StrategyRegistry.sol` (stores strategy data)

**What Happens:**

```
StrategyRegistry:
├── Decodes the strategy steps
├── Validates all protocols are whitelisted
├── Checks token flow is valid
├── Stores steps for NFT #1
└── Ready for execution!
```

---

## 💰 User Flow 2: Executing a Strategy

### Step 1: Alice Creates a Vault

```javascript
// Alice wants others to join her strategy
VaultFactory.createVault(tokenId: 1, depositToken: USDC);
// → Creates Vault contract for Strategy #1
```

**Contracts Used:**

- `VaultFactory.sol` (creates new vault)
- `StrategyVault.sol` (the actual vault instance)

**What Happens:**

```
VaultFactory:
└── Deploys new StrategyVault
    ├── Links to NFT #1
    ├── Accepts USDC deposits
    └── Alice is the vault manager
```

### Step 2: Users Deposit Funds

```javascript
// Bob deposits 1000 USDC into Alice's strategy
USDC.approve(vault, 1000);
StrategyVault.deposit(1000);
// → Bob receives vault shares
```

**Contract Used:** `StrategyVault.sol`

**What Happens:**

```
StrategyVault:
├── Takes Bob's 1000 USDC
├── Calculates shares: (amount * totalShares) / totalAssets
├── Mints shares to Bob
└── Updates totalAssets
```

### Step 3: Execute Strategy

```javascript
// Alice (strategy owner) executes the strategy
StrategyVault.executeStrategy();
```

**Contracts Flow:**

```
StrategyVault
    ↓ (calls)
StrategyExecutor
    ↓ (verifies permissions & cooldown)
StrategyRunner
    ↓ (gets strategy steps from Registry)
StrategyRegistry
    ↓ (returns steps)
StrategyRunner
    ↓ (executes each step)
UniswapAdapter → Swap ETH to USDC
    ↓
CompoundAdapter → Lend USDC
    ↓ (returns result)
StrategyVault
    └── Updates totalAssets with profits
```

**Detailed Execution:**

#### **Step 3a: StrategyExecutor Checks**

```solidity
// StrategyExecutor.executeStrategy()
- ✅ Is strategy active?
- ✅ Is cooldown elapsed?
- ✅ Is caller authorized (vault or keeper)?
- ✅ Not already executing?
```

#### **Step 3b: StrategyRunner Executes**

```solidity
// StrategyRunner.runStrategy()
1. Get steps from StrategyRegistry
2. For each step:
   - Get the protocol adapter (Uniswap/Compound)
   - Execute the action
   - Pass output to next step
3. Return final amount
```

#### **Step 3c: Protocol Adapters Work**

```solidity
// Step 1: UniswapAdapter
- Approve WETH to Uniswap
- Call SwapRouter.exactInputSingle()
- Return USDC amount

// Step 2: CompoundAdapter
- Approve USDC to Compound
- Call Comet.supply()
- Return cUSDC amount
```

### Step 4: Users Withdraw

```javascript
// Bob wants to withdraw his portion
StrategyVault.withdraw(shares);
// → Bob receives his USDC + profits
```

**Contract Used:** `StrategyVault.sol`

**What Happens:**

```
StrategyVault:
├── Calculates: assets = (shares * totalAssets) / totalShares
├── Burns Bob's shares
├── Transfers assets to Bob
└── Updates totalShares and totalAssets
```

---

## 🔀 User Flow 3: Forking a Strategy

### Scenario: Charlie Likes Alice's Strategy But Wants to Modify It

```javascript
// Charlie forks NFT #1 and changes Compound → Different protocol
StrategyNFT.forkStrategy(parentTokenId: 1, newStrategyData);
// → Charlie receives NFT #2
// → Alice's NFT #1 forkCount increases
```

**Contract Used:** `StrategyNFT.sol`

**What Happens:**

```
StrategyNFT:
├── Creates new NFT #2
├── Links NFT #2 to parent NFT #1
├── Increments Alice's NFT #1 fork count
└── Charlie becomes owner of NFT #2
```

**Then Charlie:**

1. Registers his modified strategy
2. Creates his own vault
3. Others can deposit into Charlie's variant

---

## 🛒 User Flow 4: Trading Strategies on Marketplace

### Step 1: Alice Lists Her Strategy

```javascript
// Alice lists NFT #1 for sale
StrategyNFT.approve(marketplace, tokenId: 1);
StrategyMarketplace.listStrategy(tokenId: 1, price: 1 ETH);
```

**Contract Used:** `StrategyMarketplace.sol`

**What Happens:**

```
StrategyMarketplace:
├── Records listing
├── Sets seller = Alice
├── Sets price = 1 ETH
└── Marks as active
```

### Step 2: David Buys the Strategy

```javascript
// David buys NFT #1
StrategyMarketplace.buyStrategy{value: 1 ETH}(tokenId: 1);
```

**Contracts Flow:**

```
StrategyMarketplace
    ↓ (calculates fees)
RoyaltyManager.distributeRoyalty()
    ↓ (calculates creator royalty)
RoyaltyManager
    ↓ (pays Alice as creator)
StrategyMarketplace
    ├── Pays platform fee (2.5%)
    ├── Pays creator royalty (5%)
    ├── Pays seller the rest
    └── Transfers NFT to David
```

**Payment Breakdown:**

```
Sale Price: 1 ETH
├── Platform Fee: 0.025 ETH (2.5%)
├── Creator Royalty: 0.05 ETH (5%)  → Alice
└── Seller Proceeds: 0.925 ETH → Alice
```

**Now David:**

- Owns NFT #1
- Can manage the existing vault
- Can execute the strategy
- Can list it for resale

---

## 🔐 Security & Permissions

### Who Can Do What?

#### **StrategyNFT Owner (e.g., Alice with NFT #1)**

```
✅ Execute strategy
✅ Deactivate strategy
✅ Create vault for strategy
✅ List NFT on marketplace
✅ Fork other strategies
❌ Cannot modify existing strategy (immutable)
```

#### **Vault Manager (Usually NFT Owner)**

```
✅ Execute strategy for vault
✅ Pause/unpause vault
✅ Compound profits
❌ Cannot withdraw others' funds
❌ Cannot change strategy
```

#### **Vault Depositor (e.g., Bob)**

```
✅ Deposit funds
✅ Withdraw their shares
✅ View vault performance
❌ Cannot execute strategy (only owner)
❌ Cannot pause vault
```

#### **Keeper (Authorized Bot)**

```
✅ Execute strategies automatically
✅ Compound profits
❌ Cannot withdraw funds
❌ Cannot modify strategies
```

#### **Contract Owner (Deployer)**

```
✅ Add/remove protocols
✅ Add/remove keepers
✅ Update platform fees
✅ Emergency controls
❌ Cannot access user funds
```

---

## 📊 Contract Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERFACE                        │
│              (Your Frontend / Etherscan)                 │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Strategy │  │ Strategy │  │  Vault   │
│   NFT    │  │ Registry │  │ Factory  │
│ (ERC721) │  │(Storage) │  │(Deploy)  │
└─────┬────┘  └────┬─────┘  └────┬─────┘
      │            │             │
      │            │             ▼
      │            │      ┌──────────┐
      │            │      │ Strategy │
      │            │      │  Vault   │
      │            │      │ (Funds)  │
      │            │      └────┬─────┘
      │            │           │
      └────────────┴───────────┘
                   │
                   ▼
           ┌──────────────┐
           │  Strategy    │
           │  Executor    │
           │ (Security)   │
           └──────┬───────┘
                  │
                  ▼
           ┌──────────────┐
           │  Strategy    │
           │   Runner     │
           │  (Execute)   │
           └──────┬───────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Uniswap    │    │  Compound    │
│   Adapter    │    │   Adapter    │
│   (Swap)     │    │   (Lend)     │
└──────┬───────┘    └──────┬───────┘
       │                   │
       ▼                   ▼
┌──────────────┐    ┌──────────────┐
│   Uniswap    │    │  Compound    │
│   Protocol   │    │   Protocol   │
└──────────────┘    └──────────────┘
```

---

## 🎭 Real-World Example: Complete Flow

### **Day 1: Alice Creates "ETH Yield Strategy"**

```
1. Alice designs: Swap ETH → USDC → Lend on Compound
2. StrategyNFT mints NFT #1 to Alice
3. StrategyRegistry stores the steps
4. VaultFactory creates vault for NFT #1
```

### **Day 2: Users Deposit**

```
1. Bob deposits 1000 USDC → gets 1000 shares
2. Carol deposits 500 USDC → gets 500 shares
3. Vault has 1500 USDC total
```

### **Day 3: Alice Executes**

```
1. Alice calls executeStrategy()
2. Vault sends 1500 USDC to StrategyRunner
3. StrategyRunner:
   - Swaps USDC → ETH (Uniswap)
   - Lends ETH (Compound)
4. Vault now has 1500 cETH earning interest
```

### **Day 10: Profits Accumulate**

```
1. Strategy earned 50 USDC interest
2. Vault value = 1550 USDC
3. Bob's shares worth: (1000/1500) * 1550 = 1033 USDC
4. Carol's shares worth: (500/1500) * 1550 = 517 USDC
```

### **Day 15: Alice Lists Strategy**

```
1. Alice lists NFT #1 for 2 ETH
2. David buys it
3. Alice gets: 1.925 ETH (after fees & royalties)
4. David now owns NFT #1 and controls the vault
```

### **Day 20: Bob Withdraws**

```
1. Bob calls withdraw(1000 shares)
2. Calculates: (1000/1500) * 1550 = 1033 USDC
3. Bob receives 1033 USDC (33 USDC profit!)
4. Vault now has 517 USDC for Carol
```

---

## 💡 Key Design Principles

### **1. Separation of Concerns**

```
NFT (ownership) ← Registry (data) ← Executor (security) ← Runner (execution)
```

Each contract has ONE job!

### **2. Immutability**

```
✅ Strategy steps = IMMUTABLE (can't change after minting)
✅ NFT ownership = TRANSFERABLE
✅ Execution logic = UPGRADEABLE (in adapters)
```

### **3. Composability**

```
Strategy = Lego Blocks
├── Block 1: Uniswap Swap
├── Block 2: Compound Lend
└── Block 3: (Add more protocols later)
```

### **4. Permission Layers**

```
Level 1: Owner → Full control
Level 2: Keepers → Can execute only
Level 3: Users → Can deposit/withdraw only
```

---

## 🚀 Summary

**Creating a Strategy:**

```
User → StrategyNFT (mint) → StrategyRegistry (validate & store)
```

**Executing a Strategy:**

```
Vault → Executor (security) → Runner (orchestrate) → Adapters (protocols)
```

**Trading a Strategy:**

```
Seller → Marketplace → RoyaltyManager (fees) → Buyer (new owner)
```

**The Beauty:**

- Strategies are **tradeable** (NFTs)
- Strategies are **composable** (mix protocols)
- Strategies are **profitable** (earn fees from forks)
- Strategies are **secure** (multiple permission layers)

**Want to see a specific flow in more detail?** Let me know! 🎯
