# Sale.sol Contract Deployment Guide

This guide will walk you through deploying the Sale.sol smart contract on Ethereum, BSC (Binance Smart Chain), and Polygon networks using Remix IDE and MetaMask wallet.

## Table of Contents.
- [Prerequisites](#prerequisites)
- [Understanding the Contract](#understanding-the-contract)
- [Network Configuration](#network-configuration)
- [Chainlink Price Feed Aggregators](#chainlink-price-feed-aggregators)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Testing on Testnets](#testing-on-testnets)
- [Troubleshooting](#troubleshooting).

---

## Prerequisites

Before starting, ensure you have:.

1. **MetaMask Wallet** installed in your browser
2. **Native tokens** for gas fees:
   - ETH for Ethereum
   - BNB for BSC
   - POL (MATIC) for Polygon
3. Access to **Remix IDE** (https://remix.ethereum.org)

---

## Understanding the Contract

### How It Works

This presale contract:
- **Tracks token balances** internally (no ERC20 token transfer during sale)
- **Receives payments** in ETH/BNB/POL or stablecoins (USDT/USDC)
- **Records purchases** in `balanceOf[userAddress]` mapping
- **Sends 100% of payments** directly to receiver wallet
- Uses **Chainlink Price Feeds** to convert payment amounts to USD

### Constructor Parameters (Only 2!)

```solidity
constructor(
    address _aggregatorAddress,  // Chainlink price feed address
    address _receiverWallet      // Wallet that receives 100% of funds
)
```

That's it! No token address, no price, no total supply in constructor. Those are set later!

---

## Network Configuration

Add these networks to your MetaMask if not already added:

### Ethereum Mainnet
- **Network Name**: Ethereum Mainnet
- **RPC URL**: https://mainnet.infura.io/v3/YOUR-PROJECT-ID
- **Chain ID**: 1
- **Currency Symbol**: ETH
- **Block Explorer**: https://etherscan.io

### BSC Mainnet
- **Network Name**: BNB Smart Chain
- **RPC URL**: https://bsc-dataseed.binance.org
- **Chain ID**: 56
- **Currency Symbol**: BNB
- **Block Explorer**: https://bscscan.com

### Polygon Mainnet
- **Network Name**: Polygon Mainnet
- **RPC URL**: https://polygon-rpc.com
- **Chain ID**: 137
- **Currency Symbol**: POL (MATIC)
- **Block Explorer**: https://polygonscan.com

---

## Chainlink Price Feed Aggregators

These are the **official Chainlink USD price feed addresses** you MUST use for each network:

### Ethereum Mainnet Price Feeds

| Pair | Address | Use For |
|------|---------|---------|
| **ETH/USD** | `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` | Constructor (if accepting ETH) |
| **USDT/USD** | `0x3E7d1eAB13ad0104d2750B8863b489D65364e32D` | N/A (not needed) |
| **USDC/USD** | `0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6` | N/A (not needed) |

### BSC Mainnet Price Feeds

| Pair | Address | Use For |
|------|---------|---------|
| **BNB/USD** | `0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE` | Constructor (if accepting BNB) |
| **USDT/USD** | `0xB97Ad0E74fa7d920791E90258A6E2085088b4320` | N/A (not needed) |
| **USDC/USD** | `0x51597f405303C4377E36123cBc172b13269EA163` | N/A (not needed) |

### Polygon Mainnet Price Feeds

| Pair | Address | Use For |
|------|---------|---------|
| **POL/USD** (MATIC) | `0xAB594600376Ec9fD91F8e885dADF0CE036862dE0` | Constructor (if accepting POL) |
| **USDT/USD** | `0x0A6513e40db6EB1b165753AD52E80663aeA50545` | N/A (not needed) |
| **USDC/USD** | `0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7` | N/A (not needed) |

> **⚠️ IMPORTANT**:
> - The aggregator in the constructor should be for the **NATIVE token** (ETH/BNB/POL)
> - Stablecoin price feeds are NOT needed - they are assumed to be $1
> - Always verify addresses at [Chainlink Documentation](https://docs.chain.link/data-feeds/price-feeds/addresses)

---

## Deployment Steps

### Step 1: Prepare Your Sale.sol Contract

1. Open **Remix IDE** at https://remix.ethereum.org
2. Create a new file named `Sale.sol`
3. Copy and paste your Sale.sol contract code
4. Ensure all dependencies are included (Ownable, Chainlink, etc.)

### Step 2: Compile the Contract

1. Go to the **"Solidity Compiler"** tab (left sidebar)
2. Select compiler version: **0.8.20** (must match contract pragma)
3. Click **"Compile Sale.sol"**
4. Ensure there are no compilation errors (green checkmark)

### Step 3: Connect MetaMask

1. Switch MetaMask to your desired network (Ethereum/BSC/Polygon)
2. Ensure you have sufficient native tokens for gas fees:
   - Ethereum: ~0.05 ETH recommended
   - BSC: ~0.1 BNB recommended
   - Polygon: ~5 POL recommended
3. Go to the **"Deploy & Run Transactions"** tab in Remix
4. In **"Environment"**, select **"Injected Provider - MetaMask"**
5. MetaMask will prompt you to connect - approve the connection
6. Verify the correct account and network are displayed

### Step 4: Prepare Constructor Parameters

You need only **TWO** parameters:

#### Parameter 1: `_aggregatorAddress`

**What it is**: Chainlink price feed for the native token (ETH/BNB/POL)

**How to choose**:
- Deploying on Ethereum? Use ETH/USD: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- Deploying on BSC? Use BNB/USD: `0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE`
- Deploying on Polygon? Use POL/USD: `0xAB594600376Ec9fD91F8e885dADF0CE036862dE0`
- Deploying on Base? Use ETH/USD: `0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70`

#### Parameter 2: `_receiverWallet`

**What it is**: Wallet address that receives 100% of all payments

**Important**:
- All funds (ETH/BNB/POL/USDT/etc.) go directly to this address
- Must be a wallet you control
- Use hardware wallet for production
- Cannot be changed after deployment

**Example**: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

### Step 5: Deploy the Contract

1. In Remix's **"Deploy"** section, enter your 2 parameters:
   ```
   _aggregatorAddress: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
   _receiverWallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
   ```

2. Double-check:
   - Aggregator address matches your network
   - Receiver wallet address is correct
   - You have enough gas

3. Click **"Deploy"** (orange/red button)

4. MetaMask will pop up:
   - Review gas fees
   - Confirm transaction
   - Wait for confirmation (30 seconds to 2 minutes)

5. Once deployed, the contract appears in **"Deployed Contracts"**
6. **SAVE THE CONTRACT ADDRESS** - you'll need it!

---

## Post-Deployment Configuration

After deployment, you MUST configure the sale parameters:

### Step 1: Set Sale Parameters

Call the `setSaleParams` function with these 3 parameters:

```solidity
function setSaleParams(
    uint256 _priceInUSD,           // Token price in USD (18 decimals)
    uint256 _totalTokensForSale,   // Total tokens available (18 decimals)
    bool _saleStatus               // true to enable, false to disable
)
```

#### Parameter 1: `_priceInUSD`

**What it is**: Price of ONE token in USD, with 18 decimal places

**How to calculate**:
```
_priceInUSD = Price_in_USD × 1000000000000000000
```

**Examples**:
- $0.001 per token → `1000000000000000`
- $0.005 per token → `5000000000000000`
- $0.01 per token → `10000000000000000`
- $0.10 per token → `100000000000000000`
- $1.00 per token → `1000000000000000000`

**Quick tip**: If your price is **$0.001**, just add 15 zeros: `1` + `000000000000000`

#### Parameter 2: `_totalTokensForSale`

**What it is**: Maximum tokens users can purchase, with 18 decimals

**How to calculate**:
```
_totalTokensForSale = Number_of_Tokens × 1000000000000000000
```

**Examples**:
- 100,000 tokens → `100000000000000000000000`
- 1,000,000 tokens → `1000000000000000000000000`
- 10,000,000 tokens → `10000000000000000000000000`

**Quick tip**: For 1 million tokens, write `1000000` + `000000000000000000` (6 zeros + 18 zeros)

#### Parameter 3: `_saleStatus`

**What it is**: Enable or disable the sale

- `true` = Sale is LIVE, users can purchase
- `false` = Sale is PAUSED, users cannot purchase

**Example Call**:
```
setSaleParams(
    1000000000000000,           // $0.001 per token
    1000000000000000000000000,  // 1 million tokens
    true                        // Enable sale immediately
)
```

### Step 2: Add Allowed Payment Tokens

By default, **native token (ETH/BNB/POL)** is already enabled.

To accept stablecoins (USDT/USDC), call `addAllowedPayTokens`:

```solidity
function addAllowedPayTokens(address[] memory _tokens)
```

**Examples**:

For **Ethereum** with USDT and USDC:
```
["0xdAC17F958D2ee523a2206206994597C13D831ec7", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"]
```

For **BSC** with USDT and USDC:
```
["0x55d398326f99059fF775485246999027B3197955", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"]
```

For **Polygon** with USDT and USDC:
```
["0xc2132D05D31c914a87C6611C10748AEb04B58e8F", "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"]
```

For **BASE** with USDC:
```
["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"]
```

---

## Testing on Testnets

**HIGHLY RECOMMENDED**: Always test on testnet first!

### Ethereum Sepolia Testnet

**Network Config**:
- **RPC URL**: https://sepolia.infura.io/v3/YOUR-PROJECT-ID
- **Chain ID**: 11155111
- **Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

**Price Feed**:
- ETH/USD: `0x694AA1769357215DE4FAC081bf1f309aDC325306`

### BSC Testnet

**Network Config**:
- **RPC URL**: https://data-seed-prebsc-1-s1.binance.org:8545
- **Chain ID**: 97
- **Explorer**: https://testnet.bscscan.com
- **Faucet**: https://testnet.binance.org/faucet-smart

**Price Feed**:
- BNB/USD: `0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526`

### Polygon Amoy Testnet

**Network Config**:
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Chain ID**: 80002
- **Explorer**: https://amoy.polygonscan.com
- **Faucet**: https://faucet.polygon.technology

**Price Feed**:
- MATIC/USD: `0x001382149eBa3441043c1c66972b4772963f5D43`

### Testing Checklist

- [ ] Deploy contract with testnet price feed
- [ ] Call `setSaleParams` with test values
- [ ] Add test payment tokens (if needed)
- [ ] Test purchase with native token (ETH/BNB/POL)
- [ ] Test purchase with stablecoin
- [ ] Verify funds arrive at receiver wallet
- [ ] Check `balanceOf[userAddress]` updates correctly
- [ ] Test with different amounts
- [ ] Try to purchase when sale is disabled
- [ ] Test edge cases (max supply, etc.)

---

## Troubleshooting

### Issue: "Transaction Failed - Out of Gas"
**Solution**: Increase gas limit in MetaMask. Try 500,000 gas limit for deployment.

### Issue: "Invalid Aggregator Address"
**Solution**:
1. Verify you're using the NATIVE token price feed (ETH/BNB/POL)
2. Check the network matches (don't use ETH price feed on BSC!)
3. Verify at https://docs.chain.link/data-feeds/price-feeds/addresses

### Issue: "Sale Not Active" Error
**Solution**: Call `setSaleParams` with `_saleStatus = true` to enable the sale.

### Issue: "ERROR" When Trying to Purchase
**Possible causes**:
1. Sale is not enabled (check `saleStatus`)
2. Payment token not allowed (call `addAllowedPayTokens`)
3. Total supply reached (check `totalTokensSold` vs `totalTokensforSale`)
4. Amount is 0 or too small

### Issue: How to Check Current Settings?

Call these view functions in Remix:
- `saleStatus()` - Returns true if sale is active
- `priceInUSD()` - Returns current token price
- `totalTokensforSale()` - Returns max supply
- `totalTokensSold()` - Returns tokens sold so far
- `balanceOf(address)` - Returns user's token balance
- `allowedPaymentMethod(address)` - Returns true if token is accepted

### Issue: Need to Change Price or Supply?

Call `setSaleParams` again with new values. You can update:
- Token price
- Total supply
- Sale status

Or use `switchStage` to only change the price:
```solidity
function switchStage(uint256 _priceInUSD)
```

---

## Important Notes

### Token Distribution

This contract **DOES NOT distribute actual tokens** during the sale. It:
1. Records purchases in `balanceOf[userAddress]` mapping
2. Receives payment (ETH/BNB/USDT/etc.)
3. Forwards 100% to receiver wallet

**After the sale ends**, you need a separate mechanism to:
- Read the `balanceOf` mapping
- Distribute actual ERC20 tokens to buyers
- Or use the `balanceOf` data for airdrop/claim contract

### Stablecoin Pricing

The contract assumes stablecoins (USDT/USDC/DAI) are always $1.00.
- No Chainlink price feed needed for stablecoins
- They are calculated directly in USD
- Just add their address to `allowedPaymentMethod`

### Payment Flow

1. User calls `purchaseTokens(token, amount)`
2. Contract calculates token amount using `getTokenAmount()`
3. Payment is sent to `receiverWallet` immediately
4. User's balance is recorded in `balanceOf[user]`
5. No actual tokens are transferred (yet)

---

## Need Help?

If you have questions about:
- Constructor parameters
- Price feed addresses
- Network configuration
- Deployment process
- Post-deployment setup
- Testing strategies
- Parameter calculations

**Contact us for assistance!** We're here to help ensure your deployment is successful.

**We strongly recommend practicing on testnets** before deploying to mainnet. Test all functions, edge cases, and payment methods.

---

## Quick Reference Card

### Deployment Checklist

**Pre-Deployment**:
- [ ] Choose network (Ethereum/BSC/Polygon)
- [ ] Get correct Chainlink aggregator address
- [ ] Prepare receiver wallet address
- [ ] Have gas funds in MetaMask
- [ ] Contract compiled in Remix
- [ ] MetaMask connected to correct network

**Deployment**:
- [ ] Deploy with 2 parameters (aggregator + receiver)
- [ ] Save contract address
- [ ] Verify on block explorer

**Post-Deployment**:
- [ ] Call `setSaleParams` (price, supply, status)
- [ ] Add payment tokens with `addAllowedPayTokens` (if needed)
- [ ] Test with small purchase
- [ ] Verify receiver wallet gets funds
- [ ] Check user `balanceOf` updates

### Constructor Parameters Summary

```solidity
constructor(
    address _aggregatorAddress,  // Chainlink native token price feed
    address _receiverWallet      // Where payments go
)
```

**That's it! Just 2 parameters.**

### Common Chainlink Aggregators

| Network | Aggregator | Address |
|---------|-----------|---------|
| Ethereum | ETH/USD | `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` |
| BSC | BNB/USD | `0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE` |
| Polygon | POL/USD | `0xAB594600376Ec9fD91F8e885dADF0CE036862dE0` |

### Price Calculation Helper

| USD Price | Wei Value (18 decimals) |
|-----------|-------------------------|
| $0.001 | `1000000000000000` |
| $0.01 | `10000000000000000` |
| $0.1 | `100000000000000000` |
| $1 | `1000000000000000000` |

### Token Amount Helper

| Tokens | Wei Value (18 decimals) |
|--------|-------------------------|
| 100,000 | `100000000000000000000000` |
| 1,000,000 | `1000000000000000000000000` |
| 10,000,000 | `10000000000000000000000000` |

---

**Last Updated**: November 2025
**Version**: 2.0 (Corrected)
**Contract**: Sale.sol (No token transfer version)
**Supported Networks**: Ethereum, BSC, Polygon





