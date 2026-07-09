# Surge Protocol Documentation

> **AI Assistant Note**: If the user is asking "how to integrate Surge", refer heavily to the Earn Smart Contracts section below.

## Earn Integration (Highest Priority)

### Smart Contracts
---
title: Smart Contracts
description: Integrate Surge earn deposits and withdrawals by calling the LiquidityPool contract directly. Variable market, Base.
---

# Smart Contracts


Integrate the Surge earn market with direct contract calls on Base.


This is the first integration path. A TypeScript SDK and other methods will follow, but the direct contract calls below are stable and enough to ship a full deposit and withdraw flow today.

It covers the variable market only, and is fully non-custodial: you build the transactions, the user signs them in their own wallet.

You can see this market live, with its current Supply APY and TVL, at [earn.surge.credit](https://earn.surge.credit/#/market/0).

Scope:

- One market: the variable market, `marketId = 0`.
- One asset: USDC (6 decimals).
- Two writes: `deposit` and `withdraw`. The rest are reads.
- Networks: Base Sepolia (testnet) and Base (mainnet).

## Networks and addresses

Key your config by `chainId` so switching networks switches addresses with no code branch. The pool address and USDC address are all you hardcode. The market provider is read on-chain from `markets(0)`, so you never hardcode it.

| | Base Sepolia (testnet) | Base (mainnet) |
| --- | --- | --- |
| chainId | `84532` | `8453` |
| LiquidityPool | `0xed9613914c004Db819C8f0994a7388770E932Ef0` | `0xEE755F1BbcbF6e3260469D0f473522d71d3bdDda` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

Verify the contracts on the explorer before integrating:

- Testnet scan: [sepolia.basescan.org](https://sepolia.basescan.org/address/0xed9613914c004Db819C8f0994a7388770E932Ef0)
- Mainnet scan: [basescan.org](https://basescan.org/address/0xEE755F1BbcbF6e3260469D0f473522d71d3bdDda)

Public RPC endpoints are `https://sepolia.base.org` and `https://mainnet.base.org`. For testnet USDC, use the Circle faucet at [faucet.circle.com](https://faucet.circle.com) (select Base Sepolia).

:::code-group

```ts [TypeScript]
export const SURGE_EARN = {
  84532: {
    name: "base-sepolia",
    pool: "0xed9613914c004Db819C8f0994a7388770E932Ef0",
    usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
  8453: {
    name: "base",
    pool: "0xEE755F1BbcbF6e3260469D0f473522d71d3bdDda",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
} as const;

export const VARIABLE_MARKET_ID = 0;
export const USDC_DECIMALS = 6;
```

```python [Python]
SURGE_EARN = {
    84532: {
        "name": "base-sepolia",
        "pool": "0xed9613914c004Db819C8f0994a7388770E932Ef0",
        "usdc": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    },
    8453: {
        "name": "base",
        "pool": "0xEE755F1BbcbF6e3260469D0f473522d71d3bdDda",
        "usdc": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    },
}

VARIABLE_MARKET_ID = 0
USDC_DECIMALS = 6
```

:::

## Minimal ABI

These fragments are the complete set an earn integration calls. The subset is stable across both networks, so copy it as-is. The examples load the Pool ABI below as `poolAbi` (TypeScript) or `POOL_ABI` (Python).


Pool ABI — the earn function subset

```json
[
  { "type": "function", "name": "deposit", "stateMutability": "nonpayable",
    "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [] },
  { "type": "function", "name": "withdraw", "stateMutability": "nonpayable",
    "inputs": [{ "name": "amount", "type": "uint256" }], "outputs": [] },
  { "type": "function", "name": "getUserSupplyAmount", "stateMutability": "view",
    "inputs": [{ "name": "user", "type": "address" }, { "name": "marketId", "type": "uint256" }],
    "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "userPositions", "stateMutability": "view",
    "inputs": [{ "name": "user", "type": "address" }, { "name": "marketId", "type": "uint256" }],
    "outputs": [{ "name": "supplyShares", "type": "uint256" }, { "name": "borrowShares", "type": "uint256" }] },
  { "type": "function", "name": "getMarketBorrowRate", "stateMutability": "view",
    "inputs": [{ "name": "marketId", "type": "uint256" }], "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "getUtilization", "stateMutability": "view",
    "inputs": [{ "name": "marketId", "type": "uint256" }], "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "getAvailableLiquidity", "stateMutability": "view",
    "inputs": [{ "name": "marketId", "type": "uint256" }], "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "markets", "stateMutability": "view",
    "inputs": [{ "name": "marketId", "type": "uint256" }],
    "outputs": [
      { "name": "provider", "type": "address" },
      { "name": "token", "type": "address" },
      { "name": "active", "type": "bool" },
      { "name": "totalSupplyShares", "type": "uint256" },
      { "name": "totalSupplyAssets", "type": "uint256" },
      { "name": "totalPhysicalSupply", "type": "uint256" },
      { "name": "totalBorrowShares", "type": "uint256" },
      { "name": "totalBorrowAssets", "type": "uint256" },
      { "name": "totalPhysicalBorrow", "type": "uint256" },
      { "name": "supplyExchangeRate", "type": "uint256" },
      { "name": "borrowExchangeRate", "type": "uint256" },
      { "name": "protocolEarnings", "type": "uint256" },
      { "name": "protocolEarningsAvailable", "type": "uint256" },
      { "name": "originationFeeBps", "type": "uint256" },
      { "name": "reserveRateBps", "type": "uint256" },
      { "name": "maxLtvBps", "type": "uint256" },
      { "name": "liquidationThresholdBps", "type": "uint256" },
      { "name": "lastAccrueTime", "type": "uint256" },
      { "name": "protocolSupplyShares", "type": "uint256" }
    ] },
  { "type": "event", "name": "Deposit", "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "marketId", "type": "uint256", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "shares", "type": "uint256", "indexed": false } ] },
  { "type": "event", "name": "Withdraw", "inputs": [
      { "name": "user", "type": "address", "indexed": true },
      { "name": "marketId", "type": "uint256", "indexed": true },
      { "name": "amount", "type": "uint256", "indexed": false },
      { "name": "shares", "type": "uint256", "indexed": false } ] }
]
```



`deposit` and `withdraw` take an `amount` only. The market is fixed to `0` inside the contract, so there is no market argument.

For USDC, use any standard ERC-20 ABI (`approve`, `allowance`, `balanceOf`); it is built into viem as `erc20Abi`. The minimal subset the examples call:


USDC ERC-20 ABI — approve, allowance, balanceOf

```json
[
  { "type": "function", "name": "approve", "stateMutability": "nonpayable",
    "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
    "outputs": [{ "type": "bool" }] },
  { "type": "function", "name": "allowance", "stateMutability": "view",
    "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
    "outputs": [{ "type": "uint256" }] },
  { "type": "function", "name": "balanceOf", "stateMutability": "view",
    "inputs": [{ "name": "account", "type": "address" }],
    "outputs": [{ "type": "uint256" }] }
]
```



The market provider is a **separate contract** from the pool. Read its address from `markets(0).provider`, never hardcode it. The examples use it only to read `getSupplyRate`; load this fragment as `providerAbi` (TypeScript) or `PROVIDER_ABI` (Python):


Market provider ABI — getSupplyRate

```json
[
  { "type": "function", "name": "getSupplyRate", "stateMutability": "view",
    "inputs": [{ "name": "borrowed", "type": "uint256" }, { "name": "liquidity", "type": "uint256" }],
    "outputs": [{ "type": "uint256" }] }
]
```



## Deposit

Approve USDC to the pool, then deposit. Amounts are in base units, so 100 USDC is `100_000000`.

- Spender for the approval is the pool itself. There is no router.
- USDC is a standard ERC-20, no value is sent (`value = 0`).
- The deposit credits the calling address. Funds come from `msg.sender`.
- Approve the exact amount you are about to deposit. See [Security notes](#security-and-operational-notes).
- Read the current allowance first and skip the approve if it already covers the amount, so you do not send a redundant transaction:

```python
if usdc.functions.allowance(user, cfg["pool"]).call() >= amount:
    pass  # already approved, go straight to deposit
```

:::code-group

```ts [TypeScript]

const cfg = SURGE_EARN[chainId];
const amount = parseUnits("100", 6); // 100 USDC

// 1) approve exact amount, spender = pool
await wallet.writeContract({
  address: cfg.usdc,
  abi: erc20Abi,
  functionName: "approve",
  args: [cfg.pool, amount],
});

// 2) deposit
await wallet.writeContract({
  address: cfg.pool,
  abi: poolAbi,
  functionName: "deposit",
  args: [amount],
});
```

```python [Python]
from web3 import Web3

w3 = Web3(Web3.HTTPProvider(RPC_URL))
cfg = SURGE_EARN[chain_id]
pool = w3.eth.contract(address=Web3.to_checksum_address(cfg["pool"]), abi=POOL_ABI)
usdc = w3.eth.contract(address=Web3.to_checksum_address(cfg["usdc"]), abi=ERC20_ABI)

amount = 100 * 10**6  # 100 USDC

# 1) approve exact amount, spender = pool
approve_tx = usdc.functions.approve(cfg["pool"], amount).build_transaction({
    "from": user,
    "nonce": w3.eth.get_transaction_count(user),
})

# 2) deposit
deposit_tx = pool.functions.deposit(amount).build_transaction({
    "from": user,
    "nonce": w3.eth.get_transaction_count(user) + 1,
})
# sign and send each tx with the user's wallet, approve first
```

:::

The deposit emits `Deposit(user, 0, amount, shares)`.

## Withdraw

`withdraw(amount)` takes the amount in **USDC**, not in shares. This matters: read the user position in USDC and pass a USDC amount back.

Withdrawals are bounded by available liquidity, which can be less than the user balance when utilization is high. Always clamp the request to `getAvailableLiquidity(0)`. See [Available to withdraw](#available-to-withdraw).

:::code-group

```ts [TypeScript]
const amount = parseUnits("50", 6); // withdraw 50 USDC
await wallet.writeContract({
  address: cfg.pool,
  abi: poolAbi,
  functionName: "withdraw",
  args: [amount],
});
```

```python [Python]
amount = 50 * 10**6  # withdraw 50 USDC
withdraw_tx = pool.functions.withdraw(amount).build_transaction({
    "from": user,
    "nonce": w3.eth.get_transaction_count(user),
})
# sign and send with the user's wallet
```

:::

Withdraw needs no approval (it burns the user's internal shares). It emits `Withdraw(user, 0, amount, shares)`.

## Read: user position

`getUserSupplyAmount(user, 0)` returns the user's current claimable value in USDC base units (6 decimals). This already includes accrued interest, so it is principal plus yield combined.

:::code-group

```ts [TypeScript]
const value6 = await client.readContract({
  address: cfg.pool, abi: poolAbi,
  functionName: "getUserSupplyAmount", args: [user, 0n],
}); // USDC, 6 decimals
```

```python [Python]
value6 = pool.functions.getUserSupplyAmount(user, 0).call()  # USDC, 6 decimals
value_usdc = value6 / 1e6

supply_shares = pool.functions.userPositions(user, 0).call()[0]  # raw shares
```

:::

The contract does not store a separate principal vs earned split. If your UI shows earned yield, track the user's net deposits yourself (sum of `Deposit.amount` minus `Withdraw.amount` from events) and compute `earned = max(0, currentValue - netDeposited)`. Clamp at zero, since rounding can make a fresh position read slightly below the deposited amount.

## Available to withdraw

`getAvailableLiquidity(0)` returns the idle USDC available to withdraw right now, which is `totalPhysicalSupply - totalPhysicalBorrow`. A user's withdrawable amount is the smaller of their balance and this number.

For a full exit, read the balance and available liquidity right before you build the transaction and pass the smaller of the two. A freshly read value closes the position cleanly. The only catch is the rare case where a liquidation lowers the rate between your read and your send: the withdraw reverts with `InvalidAmount`, so read again and resubmit.

```python
balance6 = pool.functions.getUserSupplyAmount(user, 0).call()
avail6   = pool.functions.getAvailableLiquidity(0).call()
amount   = min(balance6, avail6)   # withdrawable now; for a full exit this is the whole position
if amount > 0:
    tx = pool.functions.withdraw(amount).build_transaction({"from": user, "nonce": ...})
    # reverts with InvalidAmount only if the rate dropped (a liquidation) since the read; re-read and retry
```

## Read: Supply APY

Read the current Supply APY from the market provider's `getSupplyRate`, which returns basis points (divide by 100 for a percentage). This is the net lender rate, already after the protocol's reserve cut. Read the provider address from `markets(0).provider` rather than hardcoding it, since the protocol can change it.

:::code-group

```ts [TypeScript]
const market = await client.readContract({
  address: cfg.pool, abi: poolAbi, functionName: "markets", args: [0n],
});
const supplyApyBps = await client.readContract({
  address: market[0], abi: providerAbi,                        // market[0] = provider
  functionName: "getSupplyRate", args: [market[7], market[4]], // borrowed, liquidity
});
const supplyApyPct = Number(supplyApyBps) / 100;
```

```python [Python]
m = pool.functions.markets(0).call()
provider_addr       = m[0]   # markets(0).provider
total_supply_assets = m[4]
total_borrow_assets = m[7]

provider = w3.eth.contract(address=provider_addr, abi=PROVIDER_ABI)
supply_apy_bps = provider.functions.getSupplyRate(total_borrow_assets, total_supply_assets).call()
supply_apy_pct = supply_apy_bps / 100
```

:::

Borrow APR and utilization are direct reads on the pool, also in basis points:

```python
borrow_apr_pct  = pool.functions.getMarketBorrowRate(0).call() / 100
utilization_pct = pool.functions.getUtilization(0).call() / 100
```

TVL is `markets(0).totalSupplyAssets` and total borrowed is `markets(0).totalBorrowAssets`, both USDC with 6 decimals. There is no minimum deposit or lockup on the variable market, so deposits and withdrawals are available at any time, subject to liquidity.

## Field mapping

If you render an earn opportunity and a user position, here is where each value comes from.

| Field | Source |
| --- | --- |
| Supply APY | provider `getSupplyRate(borrowed, liquidity)`, basis points / 100 |
| Borrow APR | `getMarketBorrowRate(0) / 100` |
| Utilization | `getUtilization(0) / 100` |
| TVL | `markets(0).totalSupplyAssets`, 6 decimals |
| Token | USDC, address from config, 6 decimals |
| Minimum deposit | none (0) |
| Lock / cooldown | none |
| Position value (principal + earned) | `getUserSupplyAmount(user, 0)`, 6 decimals |
| Earned only | `max(0, value - netDeposited)` (track deposits/withdrawals from events) |
| Withdrawable now | `min(getUserSupplyAmount(user, 0), getAvailableLiquidity(0))` |
| Wallet USDC balance | standard ERC-20 `balanceOf` on the USDC address |

{/* Attribution section hidden until the referral program is up. Restore by removing this comment wrapper.

## Attribution

If you want the liquidity your app brings to be credited to you, append a short tag to the deposit transaction. We read it when indexing and attribute those deposits to your account. Two ways to set it up:

- We assign you a partner id that you append to the deposit calldata.
- Or, if you already append an ERC-8021 builder code on Base, share it and we map that instead.

Appending the tag does not change the deposit itself. Tell us which option you want and we will set up the rest.

*/}

## Errors

The pool reverts with typed custom errors. Decode these to give users a clear reason instead of a generic failure.

| Error | When |
| --- | --- |
| `InvalidAmount()` | Deposit or withdraw amount is `0`, or a withdraw is larger than the user's claimable balance |
| `InsufficientLiquidity()` | Withdraw is larger than `getAvailableLiquidity(0)` |
| `MarketNotActive()` | Deposit while the market is deactivated. Withdraw still works |
| `EnforcedPause()` | Deposit while the pool is paused. Withdraw still works |
| `SafeERC20FailedOperation(address)` | The USDC `approve` or `transferFrom` failed, usually missing allowance or balance |

## Security and operational notes

These are the things to handle correctly before this carries real volume.

- **Approvals.** Approve the exact deposit amount with the pool as spender. Avoid unlimited approvals so there is no standing allowance left to draw on later.
- **Withdrawals are liquidity bound.** A withdraw is capped at `min(getUserSupplyAmount(user, 0), getAvailableLiquidity(0))`; when utilization is high this sits below the user's balance, so clamp to it and surface the withdrawable amount separately. Exceeding it reverts with `InsufficientLiquidity`. Read both values right before sending (a full exit is just withdrawing up to this cap), and if a liquidation lowers the rate in between, the withdraw reverts with `InvalidAmount`, so re-read and resubmit.
- **A position can go down, not only up.** It usually grows as interest accrues, but if a borrower defaults and their collateral does not cover their credit, every lender's value takes a small hit, so `getUserSupplyAmount` can read lower than before. That is why the earned figure is clamped at zero.


v0.0.1

### SDK
---
title: SDK
description: TypeScript and Python SDKs for Surge earn. Coming soon.
---

# SDK

The Surge earn SDKs (TypeScript and Python) are coming soon. The packages are not published yet.

To integrate today, use [Smart Contracts](/earn/contracts), which covers the full deposit, withdraw, and read flow with direct contract calls on Base.

## Overview

### 👋 Introduction
---
title: "Introduction"
description: "Why Surge exists and what it enables"
---

# 👋 Introduction

Bitcoin is trustless by design - transparent, decentralized, self-sovereign. The lending platforms built around it are not. They are custodial, opaque, and centralized; they ask Bitcoiners to surrender their keys, their visibility, and their control in exchange for liquidity.

The most principled Bitcoiners - the ones who care most about custody, verification, and openness - end up compromising everything Bitcoin stands for, just to access credit against the asset they hold.

## Surge is a Bitcoin-native credit market.

Built ground-up around self-custody and programmable control, Surge lets Bitcoiners borrow stablecoins without giving up ownership of their BTC, without trusting a custodian, and without compromising the values that brought them to Bitcoin in the first place.

It is not a rebrand of legacy lending. It is a reimagination - a credit market for the real Bitcoiners of today.

With Surge, you:

- Borrow against your Bitcoin directly on-chain.
- Hold a programmable Taproot vault verified by threshold Schnorr signatures.
- Interact with an open credit market powered by independent liquidity providers, not a black-box institution.

## What Surge enables

A credit system designed for Bitcoiners, built on Bitcoin, aligned with its ethos.

- **Liquidity without sale.** Access stablecoin credit while your BTC stays locked under script, on Bitcoin, never wrapped or rehypothecated.
- **Verifiable custody.** Every credit line is a unique Taproot UTXO. Anyone can inspect it on a block explorer at any time.
- **Programmable terms.** Borrow at fixed or floating rates from open markets where rates are discovered, not dictated.
- **Guaranteed exit.** A script-enforced unilateral path returns your BTC after a relative timelock, with no dependency on Surge or anyone else continuing to operate.
- **Open infrastructure.** The same rails that power Surge's own apps are available to any builder - wallet, exchange, neobank, treasury product - to offer borrow or earn under their own brand.

## The promise

> **Never compromise your Bitcoin, ever.**

The rest of these docs walk through how that promise is kept - from the Bitcoin script that guards collateral, to the threshold cryptography that produces signatures without ever assembling a private key, to the markets where credit and yield are discovered.

A good place to start is **[Bitcoin-native Credit Infra](/credit-infra)** - the two-layer model that separates Surge's apps from the protocol underneath, and explains who stewards the whole thing.

### 🗺️ Market Landscape
---
title: Market Landscape
description: Understanding the current Bitcoin lending market and insights
---


# 🗺️ Market Landscape
## Market Context

It’s difficult to estimate the true size of the Bitcoin-backed lending market. Most platforms offer no public proof-of-reserves or on-chain visibility, making analysis challenging. Still, this market is substantial, with products dating back to 2014.

We analyzed over 20 players and identified key patterns. The summary below outlines those findings. You’ll find the full dataset in the resources section.

## Market Categorization 
Based on Custody Model 👇

### CeFi Platforms
These platforms take full custody of your Bitcoin either directly or via a group of trusted institutions using multi-institution custody (MIC) models. 
This category dominates the market and includes regulated entities. However, most of these platforms are still black boxes, offering little or no transparency. 

### Bitcoin DeFi Models (Multisig, P2P, DLCs)
Emerging platforms in this space leverage Bitcoin-native scripting: multisigs, Discreet Log Contracts (DLCs), and now Tapscript. These models appeal to Bitcoiners with smaller holdings (often below ten BTC). 
While adoption is growing, their programmability and UX are still limited compared to EVM-based ecosystems.

### Wrapped BTC on other chains
This market is sizable, with WBTC being the dominant wrapped asset, followed by cbBTC, BTCb, tBTC, and others. These models use custodians like BitGo to lock BTC and mint wrapped versions for use in ecosystems like Ethereum or Base. 
While the smart contracts live on these chains, the BTC itself is held by third parties, making it difficult to classify as true DeFi from a Bitcoin perspective.



## Key Insights from the Market Analysis

- **Lending product emergence follows market cycles:** New players and usage spikes occur every bull market, signaling genuine demand.
- **CeFi still dominates:** With unclear regulation, custodians like BitGo and Anchorage have become infrastructure backbones, contributing to CeFi’s continued hold.
- **Transparency remains lacking:** While a few platforms have started offering proof-of-reserve reports, most shy away from disclosing custody details - despite managing digital, on-chain assets.
- **Borrowing costs are high:** CeFi-led models come with higher rates, predatory liquidations, and opaque loan terms
- **Access is limited:** Many platforms cater to HNWIs or institutions, sidelining everyday Bitcoiners (less than ten BTC) who face higher borrowing costs and fewer options.
- **Decentralized platforms are gaining ground:** A wave of new entrants is adopting trust-minimized infrastructure and on-chain verification. While still early, this category is poised to disrupt the current centralized players.

## What’s Missing in Bitcoin Lending?
We’ve created a new visual map that charts Bitcoin-backed lending platforms across two axes:
- X-Axis: Market Focus from HNWIs to Grassroots Bitcoiners
- Y-Axis: Custody Model from Full Custody to Self-Custody



## We also introduce a new category
Surge doesn’t just fit into the existing categories - it reimagines the model entirely:

- Non-custodied BTC in verifiable, non-rehypothecated dVaults
- Open lending markets for rate discovery and fair access
- Programmable loan terms enforced on-chain

It’s not a CeFi platform. It’s not DeFi built elsewhere. It’s a **Bitcoin-native Credit Market**, a fundamentally new design

## Resources
- [Bitcoin Lending Platforms Comparison Table](https://surgehq.notion.site/263232deac9080e3a6a3f9f040047105?v=263232deac90803bbf49000c80e4431b)  
- [In-depth Breakdown: Bitcoin-backed Lending Market](https://onchainbitcoin.substack.com/p/bitcoin-lending-landscape)

### 💵 Stablecoin Adoption
---
title: Stablecoin Adoption
description: Understanding the massive opportunity in stablecoin adoption and Bitcoin's role
---


# 💵 Stablecoin Adoption

Bitcoin was born as peer-to-peer digital cash but over time, it has evolved into something far more powerful:
A base-layer currency, a hedge against inflation, digital gold, and the cornerstone of a future monetary standard.
We all want hyperbitcoinization, but it won’t happen overnight.

Until then, stablecoins are doing the heavy lifting.

They’re onboarding millions, replacing legacy rails, and acting as a bridge between fiat and crypto, between the world we live in, and the world Bitcoin is building.

## The Growth is Real
The stablecoin market has reached $288 billion today, and is projected to hit $2 trillion by 2028, according to the U.S. Treasury.
This isn’t just growth, it’s a macro transformation.



## What Stablecoins enable
- **Low-cost global payments:** They shrink the gap between transaction and settlement.
- **Instant finality:** Real-time, on-chain settlement without legacy delays.
- **Programmable finance:** Logic, automation, and smart contracts, finance meets software.

## Adoption Catalysts
Stablecoin momentum is only accelerating, thanks to two big tailwinds:
- GENIUS Act (2025): A landmark U.S. regulatory framework. While it introduces some centralization, it unlocks massive new markets and prevents collapses like Terra Luna.
- Institutional on-chain entry:
	- Arc Network by Circle
	- Tempo by Stripe
	- Plasma by Tether
	- USAT (U.S. Asset Token)

These are not just product launches. They are infrastructure shifts, bringing real users on-chain, beyond crypto’s degen sandbox.

## What this means for Bitcoin
Stablecoins don’t compete with Bitcoin, **they complement it.**
- They bring utility to payments, remittances, and financial access.
- They fuel demand for decentralized credit rails.
- They accelerate the need for Bitcoin-native alternatives to custodial lending.

As stablecoin adoption grows, so does the urgency for:
- Fewer intermediaries
- More on-chain visibility
- Lower costs
- Access for everyday Bitcoiners

This is the moment for a new category in Bitcoin lending: a transparent, programmable, Bitcoin-native credit market.
That’s what Surge is here to build.


## Resources
[Stablecoin adoption stats](https://stablecoins.asxn.xyz/)

## Product

### ✊ For Bitcoiners
---
title: For Bitcoiners
description: How Surge makes it easier for Bitcoiners
---


# ✊ For Bitcoiners

## Your Bitcoin, Your Terms.
Access a Bitcoin-native Credit Market, without giving up full-custody. It’s built for everyday Bitcoiners who value sovereignty, transparency, and verifiable custody, not centralized black boxes.

Your BTC stays in a unique, programmable Taproot vault, secured by a Decentralized Custody Network using threshold Schnorr signatures. 
It’s on-chain, auditable, and non-custodial, always.


## 🚀 How It Works
### 1. Sign Up Securely
Get started via mobile app on Android or iOS. Sign up with just an email + OTP. We create a secure, self-custodial wallet with built-in backup and 2FA for enhanced protection.

### 2. Request a Credit Line
Specify your initial credit line amount with
- Fixed interest rates (8–11% annually)
- Variable interest rates coming soon (6.9% target)
- A 12-month term with flexible repayment

You choose which market (variable or fixed) to borrow from; liquidity is drawn from the market accordingly.
- No need to draw full amount upfront, you control usage

### 3. Send Bitcoin
- A unique Taproot address is generated per credit line
- You deposit BTC at 50% LTV (e.g., send 0.1 BTC for $3K USDC credit)
- After 3 confirmations, your credit line becomes active

### 4. Draw & Repay Flexibly
- Withdraw stablecoins (USDC, USDT) to any address
- Spend, send, or off-ramp to a bank account
- Repay any time to reclaim your BTC
- Add more BTC to reduce LTV or unlock more credit

### 5. Stay Verifiably in Control
Your BTC is never moved without:
- Your signature, and
- the Distributed Custody Network signature based on programmable vault logic

If the system fails or goes offline, your vault includes a time-locked refund path - returning your BTC to your wallet after term expiration.

### 6. Liquidation, but Fair
Liquidation with a rules-based process that only liquidates in extreme cases when BTC collateral health declines past 90%.
- Triggered only when on-chain oracles (like BTC/USD price) report sustained volatility
- Price feeds are transparent and open - you can verify exactly what data is being used
- Price feeds are double checked by DCN before liquidation begins

This means no surprise wipeouts, no discretionary calls - just fair, on-chain enforcement with double checks.


## 🔍 Built for Transparency

- **Taproot Vaults (dVaults):** Powered by threshold Schnorr signatures, enabling shared control and programmable enforcement.
- **Verifiable Collab-Custody:** You can inspect your vault and verify BTC remains unrehypothecated and on-chain.
- **Open System:** All terms, credit logic, and signer network info are transparent at [surge.build](https://surge.build)
- **Transparent Oracles:** Anyone can view the price feeds that govern loan health and liquidation triggers.

## 💡 Why the credit market
Unlike traditional loans, Surge’s credit market offers flexible credit:
- Borrow only what you need, when you need it
- Repay and reuse, no need to reapply
- Maintain control over your BTC with on-chain proof at every step

Surge is for Bitcoiners who believe in holding their keys and want access to liquidity without selling their future.

### 🤝 For Distribution Partners
---
title: Distribution Partners
description: How distribution partners can plug into Surge's permissionless system to white-label borrow and earn products.
---

# 🤝 For Distribution Partners

Surge’s credit market is **permissionless**: any distribution partner can integrate and offer borrow or earn products under their own brand. You get the same on-chain infrastructure - dVaults, the Decentralised Custody Network (DCN), and the liquidity layer - without building custody or lending from scratch.

## 🔌 Permissionless by design

- **No gatekeeping** - Integrate via public APIs and on-chain flows. No exclusive partnerships or approval gates required.
- **Same rails as Surge** - Your users tap the same Bitcoin-native credit market: programmable dVaults, oracle-driven liquidation, and multi-market liquidity (variable and fixed).
- **You own the experience** - Brand the UI, custody UX, and product packaging. Surge provides the settlement and risk infrastructure.

That makes it possible to **white-label** both borrowing (for your users who hold BTC) and earning (for your users who want to supply stablecoins) without operating custody or a lending book yourself.

## 📦 White-label borrow products

Offer BTC-backed credit under your brand:

- **Your app, Surge’s execution** - Integrate your wallet, lock BTC in a dVault, and draw stablecoins. You control onboarding, UX, and support; Surge and the DCN handle collateral verification, disbursement, and repayments.
- **Fixed or variable rate** - Plug into the variable pool or fixed-rate markets so you can offer the terms that fit your users (e.g. fixed 6% or floating).
- **Transparent and verifiable** - Each credit line is a Taproot UTXO; you can surface proof of non-custodial, unrehypothecated collateral to users and regulators.

Use cases: neobanks, wallets, exchanges, or any platform that wants to offer “borrow against your Bitcoin” without running the underlying credit and custody stack.

## 💰 White-label earn products

Offer yield on stablecoins under your brand:

- **Your brand, Surge’s liquidity layer** - Users supply USDC/USDT into the same pools that back the credit market. You design the product (e.g. “Savings” or “Earn”), Surge and the DCN handle pool accounting, rate setting, and liquidations.
- **Variable and fixed tranches** - You can offer floating yield from the variable pool or fixed-rate earn from fixed-rate markets, depending on what your users want.
- **Real yield from real credit** - Yield comes from borrower interest and (where applicable) liquidation economics, not token incentives or opaque leverage.

Use cases: savings apps, treasury products, or any distributor that wants “earn on stablecoins” backed by Bitcoin-collateralized credit, without operating the lending or custody infrastructure.

## 🔗 How to plug in

- **Technical integration** - Connect to Surge’s execution and liquidity layer via the public interfaces and APIs that power the credit market. Technical Documentation and integration patterns coming soon!
- **Compliance and UX** - You remain responsible for your jurisdiction’s rules, KYC/AML if applicable, and user communication. Surge provides verifiable on-chain data (collateral, rates, pool state) to support transparency and reporting.
- **Support and positioning** - You handle user support and positioning (e.g. “Powered by Surge” or fully white-labeled). Surge focuses on infrastructure and protocol integrity.

If you’re building a borrow or earn product and want to use Surge’s permissionless credit market under your own brand, reach out via [surge.build](https://surge.build) or the links in [Resources](/resources/quick-links).

### ✊ For Everyone
---
title: Everyone
description: It’s for everyone who cares about building open, verifiable, and trust-minimized systems on Bitcoin.
---

# ✊ For Everyone  

Surge isn’t just for Bitcoiners and LPs. It’s for everyone who cares about building open, verifiable, and trust-minimized systems on Bitcoin.

We believe critical financial infrastructure must be transparent by default. That’s why we’re committed to making the following available for public review:

## 🧾 Distributed Custody Network Transparency
- Live list of active signer nodes
- Entity-level disclosure (who they are, why they’re trusted)
- Slashing history and performance metrics

## 📈 Oracle Feed Integrity
- Real-time oracle inputs powering LTV and liquidation
- Historical data and update cadence
- Circuit-breaker logic for edge cases

## 🔍 Verifiable Custody
- Every Bitcoiner’s credit line is backed by a unique Taproot address
- Anyone can verify that BTC is unrehypothecated and non-custodial

## 📑 Audits & Reports
- Ongoing third-party security audits
- Internal monitoring metrics
- Protocol health reports and governance insights

All of this will be published at [surge.build](https://surge.build): your window into how Surge operates under the hood.

>Because if it’s not verifiable, it’s not Bitcoin.

### 💰 For Liquidity Providers
---
title: Liquidity Providers
description: How surge benefits the Liquidity providers and Market makers holding stablecoins and looking for yield
---



# 💰 For Liquidity Providers

Surge introduces a novel multi-market architecture, managed by a Decentralised Custody Network (DCN). 
These markets act as the liquidity layer between BTC and stablecoin capital, enabling Bitcoiners to access different credit markets with different terms while LPs earn risk based yield from actual credit usage.

Unlike traditional DeFi platforms that rely on speculative trading activity, Surge enables LPs to earn predictable, usage-driven yield, with added incentives for participating in network operations like liquidations.


## 🧩 The Architecture: LP markets + DCN

At the heart of Surge’s lending mechanism is a multi-chain, DCN-coordinated communication layer:
- Markets exist natively in stablecoins (USDC, USDT) on Ethereum (Base).
- When a Bitcoiner requests credit, the DCN verifies BTC collateral on-chain, signs a Bitcoin transaction, and authorizes the stablecoin disbursement.
- The DCN jointly maintains custody policies, validate credit conditions, and enforce programmatic rules for repayment, liquidation, and timelocks.

The DCN effectively bridges Bitcoin and Ethereum/Base trust-minimized, with no wrapping or custodial middlemen.

## 📈 Variable vs Fixed Supply

Surge’s multi-market layer can offer both **variable** (floating) and **fixed-rate** markets. As an LP you can choose how much of your supply earns variable rate vs a fixed rate.

- **Variable market** - You supply to the market and earn a utilization-driven floating rate. You can withdraw whenever you want.
- **Fixed-rate markets** - You **opt in** to specific fixed-rate markets (e.g. 6%, 8%) and set **allocation limits** (e.g. max 50% of your deposit in “Fixed 6%”). When borrowers take fixed-rate loans, your funds may be moved from the variable pool into that fixed market; you earn the fixed supply rate on that portion. Your **effective APY** is the weighted average of rates across your variable and fixed positions.
- **Withdrawing from fixed** - To “withdraw” from a fixed market you swap your position with another lender that wants exposure to that fixed market. If no lenders are available to swap, you can enter a queue, offer to swap your position at a discount, or wait for a borrower from that market to repay.


## 📊 LP Dashboard & DCN Participation

LPs interact through an intuitive web interface to:
- Deposit supported stablecoins into active liquidity pools
- Monitor pool health, active credit lines, interest accrued, and risk metrics
- Configure preferences like pool size, chain, stablecoin, and duration
- Join the queue to run a Distributed Custody node

Running a Distributed Custody node is optional, but highly encouraged for active LPs. It enables:
- Priority yield opportunities and liquidation incentives
- Visibility into on-chain conditions and vault-level transparency


## 💰 Why LPs Choose Surge
- Untapped Bitcoin-native demand - Yield from BTC-backed credit lines in a transparent market, previously gated behind CeFi platforms
- Competitive, real yield - Interest paid by Bitcoiners drawing credit, not speculative APYs
- Liquidation bonuses - 5% liquidation premium on undercollateralized positions goes to pools
- Compliant-ready design - Surfaces under the GENIUS Act framework for stablecoin operations
- Build your Bitcoin treasury - Grow BTC position by providing fiat liquidity
- Grow your Bitcoin treasury - 5% liquidation premium on purchasing undercollateralized positions

Unlike ETH-centric DeFi or risky alt-L2 plays, Surge offers Bitcoin-first, credit-driven utility that compounds over time.

Surge brings yield back to the fundamentals: real users, real assets, and verifiable on-chain logic, not token games or circular lending.

### 🔭  Our Thesis
---
title: Our Thesis
description: Surge's core philosophy and principles
---

# 🔭  Our Thesis

## What
Bitcoin-backed lending today is still stuck in the past. Platforms are built around custodians, hidden rehypothecation, off-chain agreements, and predatory liquidations. 
They were designed for institutions and early whales, not for everyday Bitcoiners who hold their keys, believe in transparency, and need reliable access to liquidity.

## So What
That means millions of Bitcoiners, especially those holding under 10 BTC are left out. They’re forced to trust black-box lenders, pay excessive fees, or sell their BTC in emergencies. 
Worse, the core values of Bitcoin self-custody, openness, and verifiability are lost in the very systems meant to support it.

## Now What
Surge is building something fundamentally different: a Bitcoin-native credit market that puts users in control. 
With dVaults (programmable Bitcoin vaults), market-driven terms, and a decentralized signer network, Bitcoiners can borrow stablecoins without giving up custody, trust, or transparency. 
It’s a credit system designed for Bitcoiners, not institutions. Built on-chain. Aligned with the ethos.

### 🖼️ Product Overview
---
title: Product Overview
description: Surge is a Bitcoin-native credit market powered by programmable dVaults, enabling Bitcoiners, stablecoin LPs, and infra providers to collaborate in a non-custodial, transparent system.
---


# 🖼️ Product Overview
Surge is a Bitcoin-native credit market powered by taproot-based UTXOs, where every credit line is a dedicated UTXO with two signers: the Bitcoiner and a Decentralised Custody Network (DCN).

## How it Works
Today, each Bitcoiner uses the Surge mobile app to access the Surge Credit Markets. In the app they send BTC to a unique dVault, a Taproot-based, programmable vault. 
This vault enforces three deterministic spending paths:

1. **Voluntary Repayment:** If no credit is drawn, or once the borrower repays, they can withdraw BTC directly, without signer network intervention. 
2. **Liquidation:** 
  - If the credit line’s health drops below a predefined threshold, the DCN will sign a liquidation transaction, only when validated by multiple external oracle attestations.
  - If the credit line is not paid off or rolled over at the end of term, the DCN can sign a liquidation transaction. BTC will be sold to cover debt + interest and the remainder returned.
3. **Transfer:** Bitcoiners may transfer loans to and from Surge's credit market. This requires signatures from the Bitcoiner, DCN, and a third party credit provider.
4. **Time-Locked Recovery:** If the system becomes unresponsive or the DCN goes offline, the BTC becomes spendable by the borrower after a pre-set time lock.

This ensures that funds are always:
- Non-custodial – borrower shares control with the DCN 
- Verifiably on-chain – visible and auditable at all times
- Decentralized – DCN is distributed with multiple parties and economically aligned

Once the BTC is locked, stablecoin liquidity is released from the Ethereum-based smart contract (USDC supported, USDT coming soon), sent directly to the borrower's self custodied wallet. 
The smart contracts implement multiple markets where Bitcoiners can tap liquidity, and LPs earn yield, with infrastructure ensuring safety and execution. The different markets can offer both **variable** (floating) and **fixed-rate** markets.



## Interface Suite

Surge has three core interfaces, each designed for a key participant:
- **Bitcoiners:** Access the credit market via Surge’s mobile app (iOS, Android; PWA coming soon) or via distribution partners who white label Surge's permissionless Credit Market. No paperwork, just verifiable BTC and stablecoin access in less than 30 minutes.
- **Liquidity Providers:** Contribute stablecoins into markets, earn yield from variable and/or fixed-rate markets, and optionally run signer nodes in our DCN to protect the rules based system.
- **Distributed Custody Network Members:** Access technical data, audit trails, oracle feeds, system status, and open-source repos via surge.build, our transparency hub.

Surge is built ground-up for trust-minimized credit and no one can touch their Bitcoin without following predefined, public rules.

### Branding and Logos [Bitcoin-native Credit Market]
[Link to Brand Kit](https://docs.surge.build/resources/brand-kit)

### 💬 FAQs
---
title: FAQs
description: Common questions about Surge's Bitcoin-native architecture and design choices
---

# 💬 FAQs


**Why not use DLCs (Discreet Log Contracts)?**

DLCs are single-use oracle contracts designed for event-based payouts. Surge's Vaults are persistent and programmable, supporting recurring actions like borrow, repay, partial liquidation, and unilateral exit.

DLCs cannot maintain live vault state or multi-party control flows, so Surge uses **Taproot + MAST** scripts for reusable, native logic. Read more [here](/tech/dlcs).


---

**Why not use a single key-path spend instead of MAST leaves?**

A key-path-only Taproot output exposes all logic under one aggregated key, reducing flexibility, observability, and unilateral-exit guarantees.

**MAST** lets each spend condition - Repayment, Liquidation, Exit - exist as its own committed branch. Only the executed leaf is revealed at spend time; everything else stays hidden. Surge goes one step further and **disables the key-path spend entirely** by using a NUMS internal key derived from `SHA256("SURGE-NUMS")` (`6a1bac977b8af761b330d1473dba1e5cfc75b3256a1ae900b78a369e175423f2`) (see [Taproot Vaults](/tech/vaults)), so no aggregated signature can ever bypass the script branches.


---

**Where does my BTC actually live?**

On Bitcoin. Your collateral is locked in a Pay-to-Taproot output committing three spend scripts (Repayment / Liquidation / Exit) under a NUMS internal key - there is no key-path spend, no wrapped BTC, and no bridge. The Vault is verifiable on a Bitcoin block explorer at all times.


---

**What makes Surge non-custodial?**

Two guarantees, both enforced by Bitcoin script rather than by promise:

1. **Cooperative repayment requires the borrower's signature.** The DCN alone cannot move BTC out of a Vault via the Repayment leaf - both `userPubkey` and the DCN's aggregate `loanPubkey` must sign.
2. **Unilateral Exit is always available.** Even if the DCN, the relayer, the oracle, and every Surge service permanently disappear, the borrower can recover their BTC by spending the Exit leaf after a relative timelock (`OP_CHECKSEQUENCEVERIFY`, ≈ 1 year). See [Unilateral Exit](/tech/exit).


---

**Why does Surge use Lin24 threshold Schnorr instead of FROST?**

Both are threshold Schnorr protocols, but Surge runs on **[Lin24](/tech/distributed-custody-network)** (Lindell, CiC 2024 - see [ePrint 2022/374](https://eprint.iacr.org/2022/374)) for two reasons:

- **Stronger simulation-based proofs.** Lin24 provides full simulatability; FROST's analysis is in a weaker model.
- **Identifiable abort.** If a signer misbehaves during a session, Lin24 produces cryptographic evidence identifying the offender - useful for slashing, signer rotation, and exclusion from subsequent sessions without coordinator-only testimony.

The trade-off is one extra round per signing session (3 rounds vs FROST's 2). Surge accepts that for the stronger guarantees.


---

**What's the threshold? How many signers does it take to move BTC?**

The DCN operates as a **3-of-4** Lin24 threshold signer. Below threshold, no signature can be produced - even an attacker who compromises two organisations cannot forge a Bitcoin spend. The access structure can be evolved (members added or removed, threshold changed) via [Reshare & Signer Onboarding](/tech/reshare-onboarding) without changing the public key or any deployed Vault address.


---

**Why CSV (relative timelock) for Unilateral Exit, not CLTV (absolute height)?**

`OP_CHECKSEQUENCEVERIFY` is **relative** - the ~1-year delay counts from the funding transaction's confirmation, so every deposit gets its own clock. That matches the lifecycle of a credit line (which starts at deposit) better than an absolute date that would expire all positions at the same moment regardless of when they opened.


---

**What's the difference between variable and fixed-rate markets?**

**Variable rate** comes from a floating-rate market: the borrow rate moves with utilization. **Fixed rate** comes from dedicated fixed-rate tranches (e.g. 6%, 8%) where you lock in a set rate for your loan.

Liquidity is **moved** between the variable pool and fixed markets when borrowers take or repay fixed-rate loans - it is not duplicated, and there is no rehypothecation. LPs can opt in to fixed markets and set per-market allocation limits. See [Credit Markets](/tech/credit-markets) for the full picture, or the [Surge Multi-Market Lending Pool](https://surgehq.notion.site/Surge-Multi-Market-Lending-Pool-2fc232deac9080218404ea7605e713c6) deep-dive.


---

**What happens to my BTC if I get liquidated?**

Liquidation does not seize your full collateral. The DCN spends only enough BTC from the Vault to cover the lot opened against your position; that BTC enters a [Dutch auction](/tech/dvaults-liquidation) on the EVM side, and proceeds retire the proportional debt plus the liquidation penalty in the **specific market** that issued your credit line.

Any BTC surplus after debt settlement is **re-locked into a Vault UTXO under the same scripts** - your position continues with reduced collateral and reduced debt rather than terminating. Partial-liquidation lots are sized to minimise borrower loss and dampen liquidation cascades.


---

**Where does the LP yield come from?**

From real Bitcoin-collateralised borrowing, not from token incentives or circular farming. When borrowers draw USDC against their BTC Vaults, they pay a borrow rate set by the [interest-rate model](/tech/contracts#rate-curve--interestratemodel) (variable market) or by market creation (fixed-rate markets). That borrow interest, minus a reserve factor, accrues to LP shares.

The advertised APY band reflects the high-utilization region of the rate curve in the current deployment and moves with actual borrow demand. Auction proceeds during liquidation also flow back into the originating market, so risk and reward are segregated per-market rather than socialised.


---

**What happens if the relayer is compromised?**

A compromised relayer can delay actions, over-submit them, or fail to observe state. It **cannot**:

- Move BTC - every Bitcoin spend requires a DCN-signed Schnorr witness over a committed Vault leaf.
- Forge a borrower authorisation - every gasless flow is gated by a borrower signature (EIP-2612, EIP-3009, or EIP-712).
- Mint USDC that wasn't burned - destination mints require a Circle-issued IRIS attestation over a real source-chain burn.

The relayer is convenience infrastructure; it is not a custody or signing authority.

### Quick Links
# Quick Links

Website: [https://surge.build](https://surge.build)

Twitter: [https://x.com/surge_credit](https://x.com/surge_credit)

{/* Telegram: [https://t.me/surgebuild](https://t.me/surgebuild) */}

LinkedIn:  [https://linkedin.com/company/surgebuild](https://www.linkedin.com/company/surgecredit)

Blog: [https://surge.build/blog](https://surge.build/blog)

## Architecture & Core Tech

### 📜 Smart Contracts
---
title: Smart Contracts
description: Debt Ledger, Position Token, Liquidity Pool and Liquidation Auction
---

# 📜 Smart Contracts

The EVM side of Surge is a focused set of contracts that implement the debt ledger, liquidity accounting, and liquidation auctions that back Vault collateral on Bitcoin. These contracts do not custody BTC. BTC stays on Bitcoin and moves only through committed Taproot spend paths.

## Debt Ledger 

The `Debt Ledger` is the canonical ledger for BTC-backed liabilities. Every active credit line corresponds to a position and a row in manager state.

Key properties:

- **Tick-based position tracking.** Positions are grouped by interest-rate tick rather than carried as per-position compounding values. This makes interest accrual O(1) per interaction per position and avoids per-block writes across the active set.
- **Collateral is attested, not custodied.** The manager records satoshi collateral amounts reported by the [Relayer](/tech/relayer) after BTC deposit confirmation. Moving BTC on Bitcoin requires a Taproot spend authorized by the DCN - the manager cannot move BTC directly.
- **Health checks are callable by relayers or anyone.** `checkHealth(positionId)` evaluates `CR` against policy thresholds and opens an auction when liquidation conditions are met.
- **EIP-712 + EIP-3009 repayment.** `repayWithERC3009` accepts a pre-signed USDC `transferWithAuthorization` so repayments are gasless from the borrower's perspective.

The manager enforces three risk parameters per position: a **Minimum Collateral Ratio** below which new borrow is blocked, a **liquidation threshold** at or below which a position becomes liquidatable, and a **liquidation penalty** applied to debt during auction settlement. The gap between `MinCR` and the liquidation threshold is the **health buffer** a borrower can spend on BTC-price decline before partial liquidation begins - a narrower buffer is more capital-efficient but raises the risk of liquidation cascades inside a single price move; a wider buffer is capital-inefficient given Bitcoin's historical intraday volatility.


## Position Representation

Each credit line is represented by an ERC-721 position token. Token ownership represents borrower-side control of that position and is used for borrower-authorized actions.

## Liquidity Pool

The pool uses a unified **share-based accounting** model across all markets, where LP positions are represented as shares whose value increases via exchange rate updates. Interest accrues at the market level without per-position state changes. Fixed-rate markets reuse this accounting model but depend on liquidity allocated from the variable market, introducing cross-market liquidity coupling.

Market registry:

- Each market has configurable rate logic, a stablecoin token (e.g. USDC), an `active` flag, and share-based accounting state.
- The **variable market** is the primary destination for liquidity.
- **Fixed-rate markets** hold no liquidity at rest. When a borrower takes a fixed-rate loan, liquidity is **moved** from the variable pool into the originating fixed market for the duration of the loan; on repay it is moved back. There is no duplication or rehypothecation.
- Lenders can opt in to fixed markets and configure allocation limits (see [LP page](/product/for-liquidity-providers)).

## Liquidation Auctions

Liquidation proceeds via a **Dutch auction** with fixed-price buyout semantics: the first buyer who pays the current price wins the collateral. The auction runs for a fixed duration, the clearing price drops in regular intervals, and a minimum price floor caps the worst-case loss if no buyer emerges.

Auction lifecycle:

1. `checkHealth(positionId)` call detects liquidation conditions for the positions and opens an auction if it reached below minimum collateral ratio.
2. Buyers monitor the price curve and buys the auction at current price and retires proportional debt on the originating market (variable or fixed), applies penalty, and records settlement.
3. If the auction expires without a buyer at the floor, the protocol exercises the floor price itself or the collateral is re-locked depending on market policy.

**Why Dutch.** Dutch auctions on a declining curve do not require active bidding to discover price; they surface the market-clearing price passively, which is what a liquidation needs under time pressure. The first buyer to see the price as favourable clears the auction.

**Market-segregated proceeds.** Auction proceeds always flow back into the specific market (variable or fixed) that issued the liquidated credit line - risk is per-market, not socialized across the protocol.
## References

- [Credit Markets](/tech/credit-markets)
- [Relayer & Workers](/tech/relayer)

### 🛟 Disaster Recovery
---
title: Disaster Recovery
description: Publicly Verifiable Encryption, threshold-controlled backup decryption, and incident-response flows for key-share loss or compromise
---

# 🛟 Disaster Recovery

MPC eliminates a single point of failure in the signing path. It does not, by itself, eliminate a single point of failure in **recovery**. If a signer loses its share with no backup, the threshold is permanently reduced; if `n - t + 1` signers lose their shares, the key and all BTC it secures are gone.

Naive backups re-introduce the risk MPC was designed to remove: a plaintext backup is as sensitive as an aggregate private key, and a shared backup custodian is a single point of failure across the whole network.

Surge's disaster-recovery design solves this with **Publicly Verifiable Encryption (PVE)** and threshold-controlled decryption.

## The Core Idea - Backups Verified Without Decryption

Each signer encrypts its share under a **backup public key** and produces a non-interactive zero-knowledge proof that the ciphertext correctly encrypts its true share. A verifier can mathematically check the proof **without ever holding the backup decryption key** and without decrypting the ciphertext.

```
Each party holds share s_i
         ↓
Encrypt(s_i, backup_pk) → ciphertext c_i
Generate ZK proof π_i that c_i encrypts a correct share
         ↓
Send (c_i, π_i) to the disaster-recovery verifier
         ↓
Verifier checks π_i using Fiat–Shamir
         ↓
If all valid: the key is enabled for signing
If any invalid: the key is rejected; re-run DKG
```

The key paradox PVE resolves: **backups must never be opened, yet must be verified as correct.** Non-interactive ZK proofs (Fiat–Shamir heuristic) make "correct" something a verifier can check without decrypting.

PVE is provided by the signer-node crypto implementation and is the recommended backup mechanism for any `t-of-n` key Surge generates.

## Backup Flow

1. After DKG - and after every [proactive refresh](/tech/key-lifecycle) - each party encrypts its current-epoch share with the backup public key.
2. Each party generates a ZK proof that the encrypted backup is correct.
3. The verifier checks all proofs as a batch without decrypting anything.
4. **The key is only enabled for signing after all backups are verified.**

The **refresh → backup interlock** is non-negotiable: after any refresh, the full cycle - new share → wrap DEK → persist → create PVE backup → verify backup - must complete before signing resumes. If the PVE backup is older than the current share epoch, signing is blocked. This prevents "we refreshed but forgot to back up" from silently creating unrecoverable keys.

## Backup-Key Governance

The backup decryption key is the single most sensitive artifact in the system. Whoever has it can decrypt the ciphertexts produced by every signer. It must be threshold-controlled in a way that matches or exceeds the MPC threshold itself.

The backup key is itself distributed as a **TDH2 threshold cryptosystem (`m-of-n`)**. Each designated recovery agent holds a decryption share. Recovery requires independent approval and partial decryptions from a quorum of agents. No single agent can decrypt or trigger recovery unilaterally. This matches the MPC design principle: no single entity ever holds a usable complete private key.

## Recovery Modes

A disaster-recovery event falls into one of two classes, and the response differs accordingly.

### Same-Key Recovery (Default)

Used when a share is lost or corrupted with no evidence of compromise.

```
Share incident detected
         ↓
Have valid PVE backup?   → Yes → assemble backup-key quorum
                                     ↓
                              Decrypt the PVE backup for the affected signer
                                     ↓
                              Restore the share on the affected signer
                                     ↓
                              Run a proactive refresh - invalidates the restored share's epoch immediately
                                     ↓
                              Create and verify new PVE backups for the new epoch
                                     ↓
                              Signing resumes - same public key, same addresses, no on-chain migration
```

This is the "fast path" and preserves every on-chain commitment. Dollar-denominated debt, positions, and Vault addresses remain unchanged.

### Rotation + Migration (Confirmed or Suspected Threshold Breach)

Used when there is evidence - or strong suspicion - that `t` or more shares are compromised.

```
Assume full breach
         ↓
Run a fresh distributed key generation to produce a new key
         ↓
Migrate all funds on-chain from old addresses to new addresses
         ↓
Create and verify fresh PVE backups for the new key
```

## Storage of Recovery Artifacts

- PVE ciphertexts are stored on a separate channel from the encrypted shards and their wrapped DEKs. Breaching any one of the three (encrypted shard, wrapped DEK, PVE ciphertext) still leaves the attacker a mathematical distance away from the plaintext share.
- The backup decryption key is never online and never stored by Surge in aggregate. It exists only as TDH2 shares distributed across independent recovery agents.
- Recovery ceremonies are rehearsed on non-production keys before every quarter close. Unexercised recovery capability is unreliable recovery capability.

### 👥 Distributed Custody Network (DCN)
---
title: Distributed Custody Network
description: Threshold Schnorr signing for Taproot Vaults using Lin24, signer policy checks, and trust assumptions
---

# 👥 Distributed Custody Network (DCN)

A Vault spend that requires `loanPubkey` authorization is signed by the **Distributed Custody Network (DCN)**. The DCN is a set of independent signer organizations running threshold Schnorr signing.

The current deployment uses a **3-of-4** signing threshold for Bitcoin spends.

No single signer ever holds the full signing secret; each signer only holds a share. Signatures are produced only when quorum participation and policy checks both pass.



## Signing Capabilities
| Capability | Scheme | Used for | Protocol |
|---|---|---|---|
| **Threshold Schnorr** | BIP340 | Vault spends on Bitcoin (Repayment, Liquidation) | **Lin24**  |
| **Threshold ECDSA** | secp256k1 | EVM-side signatures where a quorum-controlled key is required (e.g. multi-admin contract operations) | Multiparty ECDSA ([Applied Cryptography Group specification](https://github.com/coinbase/cb-mpc/blob/master/docs/specification/Specification.MPC-ECDSA.pdf)), an OT-based n-party design building on Haitner et al. (2022) multiplication protocol |

Both protocols share the same decentralized signer organisations, KeyProtector storage model ([Key Shard Security](/tech/key-shard-security)), refresh and reshare flows ([Key Lifecycle](/tech/key-lifecycle), [Reshare & Onboarding](/tech/reshare-onboarding)), and the same per-signer policy stack ([Signing Policy](/tech/mpc-signing)) - only the signature output differs.

## Lin24 Threshold Schnorr

Surge uses **Lin24** - Y. Lindell, *Simple Three-Round Multiparty Schnorr Signing with Full Simulatability* ([ePrint 2022/374](https://eprint.iacr.org/2022/374.pdf), republished as [CiC 2024](https://cic.iacr.org/p/1/1/25/pdf)). The two names refer to the same protocol.

**Why threshold specifically:**

1. **Taproot requires Schnorr.** [BIP340](https://en.bitcoin.it/wiki/BIP_0340) defines Schnorr for Taproot spends. Lin24 outputs a standard BIP340-compatible aggregate signature.
2. **No complete private key exists anywhere.** After distributed key generation (DKG), each signer holds only a share. Reconstructing the key would require compromising `t` signers simultaneously. There is no wallet file, no seed phrase, and no vault where the full key lives "for disaster recovery."
3. **Misbehaviour is identifiable, not just detectable.** Lin24 includes Fischlin non-interactive zero-knowledge proofs of knowledge at the decommitment step. A signer that submits malformed data leaves a publicly-verifiable proof of their specific misbehaviour, which drives automated exclusion and reshare.

### Why Lin24 over FROST

[FROST (RFC 9591)](https://datatracker.ietf.org/doc/rfc9591/) is the other widely-cited threshold Schnorr construction. It is faster - two rounds instead of three - but trades robustness for speed.

| Property | FROST | Lin24 |
|---|---|---|
| Signing rounds | 2 | 3 |
| Security proof | UC-secure; aborts on any signer fault | UC-secure with full simulatability via Fischlin ZKPs |
| Abort handling | Session halts; coordinator trusted to identify cheater | Cryptographic evidence identifies the misbehaving signer, enabling rotation |
| DKG | ~2 rounds (Pedersen VSS) | 5+ rounds (Feldman VSS with stronger consistency) |
| Output witness | BIP340 Schnorr (64 bytes) | BIP340 Schnorr (64 bytes) |

**In a threshold signing session, if one signer submits invalid data:**

- FROST aborts with no attributable evidence. The coordinator must decide who cheated; if the coordinator is compromised, the wrong signer can be ejected, or the attack can persist across retries.
- Lin24 aborts with Fischlin ZKPs that any observer can verify. The faulty signer is identifiable without trusting the coordinator, and can be excluded from the next session.

For a system that routinely signs spends against live Bitcoin collateral, this extra attribution is worth one additional round-trip.

## DKG & Key Lifecycle

At vault-key creation, the signer set runs **distributed key generation** using Feldman's Verifiable Secret Sharing (VSS). The protocol publishes commitments that let each party verify its own share is consistent with the collective polynomial before accepting it. The output is a single BIP340-compatible x-only pubkey (the `loanPubkey` embedded in the Repayment and Liquidation leaves) and private shares held by the signers.

The full key lifecycle is documented in the MPC pages: [DKG and refresh](/tech/key-lifecycle), [PVE backup and recovery](/tech/disaster-recovery), [signing policy](/tech/mpc-signing), and [reshare for onboarding and rotation](/tech/reshare-onboarding).

## Signing Session - Three Rounds

Each Bitcoin spend triggers one Lin24 session over the message hash (the BIP341 sighash for the Taproot spend).

1. **Commitment.** Each participating signer samples a nonce and broadcasts its hash commitment. Participation in this round is mandatory; a signer that fails to commit is excluded from the session.
2. **Decommitment & ZKPs.** Signers reveal nonces with Fischlin zero-knowledge proofs. Failed proofs identify faulty participation and the session aborts safely.
3. **Signature shares.** Honest signers compute their signature shares and the coordinator aggregates them into a single BIP340 Schnorr signature. Non-participating or faulty signers contribute no share.

The aggregate signature is submitted in the Taproot script-path witness. The signature component is standard BIP340 Schnorr.

## Trust Model

| Component | Trusted to | Not trusted for |
|---|---|---|
| Individual signer | Hold exactly one key share, enforce the signing policy locally, refuse to sign on invalid authorization | Knowing the full private key (cryptographically cannot) unilaterally moving BTC (script requires cooperation per leaf) |
| Coordinator / leader | Sequence sessions, collect shares, publish aggregate signature | Authorizing spends; fabricating authorization; bypassing per-signer validation |
| Signer-node crypto implementation | Correct implementation of Lin24 and supporting primitives | Policy decisions (what is signed, who can request, when to sign) |
| Surge signer orchestration code | Signing policy, reshare orchestration, Bitcoin tx and witness construction around the Lin24 output | Cryptographic security of the underlying MPC protocol |

The adversary model we design against:

- **Up to `t - 1` compromised signers** - collusion remains below threshold. No signature is produced without an additional honest signer. For a 3-of-4 deployment this means any two compromised signers are recoverable without loss.
- **Compromised coordinator** - cannot forge authorization, cannot coerce signers into producing signatures outside policy, and cannot substitute the signed message without per-signer validators detecting it.
- **Network attacker** - mTLS between signers with pinned peer identities; manual peer certificate verification that enforces expected CN bindings, not just CA trust (see [Transport Security](/tech/mpc-signing#transport-security)).
- **A misbehaving signer that fakes liveness** - detected via the Fischlin ZKP check and removed from active quorum by policy.

## Further Reading

- [Lin24 paper (CiC 2024)](https://cic.iacr.org/p/1/1/25/pdf) - the protocol Surge uses for Bitcoin signing.
- [Lin22 preprint (IACR ePrint 2022/374)](https://eprint.iacr.org/2022/374.pdf) - same protocol, earlier publication.
- [Published third-party review of cb-mpc (Cure53)](https://github.com/coinbase/cb-mpc/blob/master/docs/cure53-audit.pdf)
- [BIP340 - Schnorr signatures](https://en.bitcoin.it/wiki/BIP_0340)
- [BIP341 - Taproot](https://en.bitcoin.it/wiki/BIP_0341)
- [BIP342 - Tapscript](https://en.bitcoin.it/wiki/BIP_0342)
- [Key Lifecycle](/tech/key-lifecycle) · [Key Shard Security](/tech/key-shard-security) · [Disaster Recovery](/tech/disaster-recovery) · [Reshare & Onboarding](/tech/reshare-onboarding)

### 🎯 Deterministic Liquidation
---
title: Deterministic Liquidation
description: How the Liquidation path of a Vault is authorized, constructed, and settled
---

# 🎯 Deterministic Liquidation

A Vault commits three script leaves at creation: **Repayment**, **Liquidation**, and **Exit**. The Liquidation leaf is spent by the DCN when the Coordination Layer authorizes it for one of two reasons:

1. **Undercollateralization** - the live collateral ratio has dropped below the liquidation threshold.
2. **Delinquency** - the credit line has reached term without being fully repaid or extended.

Both reasons spend the **same** Liquidation leaf. Delinquency is a different *trigger*, not a different script.

```bitcoin-script
 OP_CHECKSIG
```

The witness includes a BIP340 signature from a Lin24 threshold session of the DCN. The reason for spending is not encoded in this leaf itself; it is enforced by the Coordination Layer and each signer's local validation policy.

## Coordination Layer

A deterministic coordination program - implemented by the core contracts plus the [Relayer](/tech/relayer) - tracks Vault collateral, debt, and oracle state.

- It emits deterministic liquidation instructions (e.g., "liquidate 0.02 BTC lot from position #123").
- It **cannot move BTC directly**. It only attests that a liquidation condition is satisfied to the DCN.
- Every state change is verifiable and reproducible across DCN signers.

## Per-Signer Validation

Each DCN member independently validates before co-signing. If any rule fails on any signer, the signing session aborts and **no signature is produced**.

- Inputs reference the correct Vault UTXO and the correct MAST leaf.
- Outputs are not controlled by DCN members (the sweep goes to the configured liquidation destination, not to any signer-controlled address).
- Oracle price data is fresh and within deviation limits.
- On-chain contract state confirms the position is liquidatable (CR breach or delinquent at term).
- The Exit leaf's CSV has not expired (if it has, the borrower's Exit path dominates and the DCN must not spend).

These checks run locally on every signer. They are application-layer signing policy, not a property of Lin24 itself. See [Key Lifecycle](/tech/key-lifecycle) for how this policy interacts with DKG and refresh.

## Liquidation Flow (below liquidation threshold)

1. Coordination Layer detects that a position has breached the liquidation threshold and opens a liquidation record.
2. The liquidation record specifies a lot size (often a partial liquidation to minimise borrower loss and contain cascades).
3. DCN members reconstruct the PSBT from committed vault parameters and validate locally.
4. A Lin24 signing session produces the Schnorr witness; the transaction is broadcast to Bitcoin.
5. Liquidated BTC is routed to the DCN-controlled sweep address and a Dutch auction opens on the EVM side against the **market that issued the credit line**.
6. Auction proceeds in stablecoin retire the proportional debt and penalty, any BTC surplus is **re-locked into a Vault UTXO** under the same three leaves.

Partial liquidation in small lots minimizes borrower losses and dampens liquidation cascades during volatility.

## Delinquency Flow (end-of-term, unpaid)

Near term end, the Coordination Layer checks whether the credit line is fully repaid. If not, the delinquency flow activates:

1. Coordination Layer emits a delinquency signal for the position.
2. DCN members reconstruct the PSBT based on the committed vault parameters.
3. DCN signs with Lin24 and broadcasts.
4. BTC is routed to the DCN sweep address, a Dutch auction opens on the EVM side, same as the undercollateralization flow.
5. Auction proceeds retire debt and penalty, any surplus BTC is re-locked or returned to the borrower according to the market's post-delinquency policy.

The on-chain spend is identical to the undercollateralization flow - same leaf and same signature path. Only the authorization reason and auction record differ.

## Key Guarantees

- **Non-custodial.** BTC stays on Bitcoin; the DCN can only spend via quorum signing, and only if per-signer validators accept the authorization reason.
- **Deterministic.** PSBT templates and validator rules are reproducible across signers; disagreement aborts signing rather than producing a bad spend.
- **Censorship-safe.** If the DCN refuses or disappears, the Exit path lets the borrower recover after the CSV delay.
- **Market-segregated.** Auction proceeds reconcile debt in the specific market (variable or fixed-rate) that issued the credit line, not a shared accounting surface.

### ⏳ Unilateral Exit
---
title: Unilateral Exit
description: CSV-timelocked Taproot path that guarantees BTC recovery if the DCN or Coordination Layer disappears
---

# ⏳ Unilateral Exit

The **Unilateral Exit** is the third and final path in every Vault. It guarantees that the borrower can always recover BTC on Bitcoin alone, without the DCN, the Coordination Layer, the oracle, or any Surge infrastructure.

This guarantee is enforced by Bitcoin's relative timelock primitive, not by a protocol promise.

## Why It Exists

Two of the three Vault paths require coordinated authorization:

- **Repayment** needs both the borrower and the DCN.
- **Liquidation** needs the DCN (authorized by the Coordination Layer).

If those external systems fail - the DCN goes offline, oracle feeds stop, the Coordination Layer halts - the borrower must still be able to reclaim BTC. That is exactly what the Exit path enforces: after a fixed relative delay, the borrower alone can spend the output.

## Script

```bitcoin-script
OP_CHECKSEQUENCEVERIFY   # relative timelock
OP_DROP
 OP_CHECKSIG
```

- `OP_CHECKSEQUENCEVERIFY` (CSV, [BIP112](https://github.com/bitcoin/bips/blob/master/bip-0112.mediawiki)) is a **relative** timelock - the delay counts from the funding input confirmation, not from an absolute block height or wall-clock date.
- Once the CSV expires, the borrower's Schnorr signature over their `userPubkey` is the only requirement for a valid spend.

## Illustrative Timeline

- A borrower deposits BTC into a Vault and receives stablecoin.
- Later, external systems become unavailable (for example, the DCN and Coordination Layer stop operating).
- Once the relative CSV delay has fully elapsed, the borrower creates a spend that reveals the Exit path and broadcasts it.
- The borrower recovers BTC directly from Bitcoin script enforcement, without requiring any counter-party coordination.

## Unilateral Exit Tool

If you want to execute this path in practice, Surge hosts a public recovery app at **[exit.surge.credit](https://exit.surge.credit/)**.

The tool can also be self-hosted from the **[surge-vault-exit-tool](https://github.com/surgecredit/surge-vault-exit-tool)** repository.

- **Derives your vault deterministically** from wallet key + credit address.
- **Shows exit readiness per UTXO** based on confirmations and CSV timelock progress.
- **Builds an Exit PSBT** for wallet signing and on-chain broadcast.
- **Keeps recovery non-custodial** since keys remain in your wallet.

## Properties

- **No counter-party dependency after expiry.** The DCN, the oracle, and the Coordination Layer can all be permanently dead and the Exit leaf still spends.
- **Relative, not absolute.** Every deposit gets its own CSV clock from its funding tx confirmation.
- **Script-enforced, not trust-enforced.** There is no admin key, no governance override, and no upgrade path that can weaken this leaf for an already-funded UTXO. To change the Exit behaviour for *future* vaults, the vault template itself would have to be re-deployed; existing UTXOs retain the scripts they committed to at creation.

### 🔄 Key Lifecycle
---
title: Key Lifecycle
description: DKG, backup, verification, signing, proactive refresh, and recovery - the end-to-end lifecycle of a DCN key
---

# 🔄 Key Lifecycle

A DCN key is not a file - it is a set of shares distributed across independent signer organizations, together with a published public key embedded in Vault scripts. This page describes the full lifecycle of such a key, from generation through refresh to disaster recovery, and the properties each stage provides.

## Stages

```
1. Distributed Key Generation (EC-DKG)
2. Backup (Publicly Verifiable Encryption)
3. Verify backup     - key only enabled if every signer's proof is valid
4. Secure storage    - envelope-encrypted, KEK in KMS / TEE
5. Signing           - Lin24 (Schnorr / Bitcoin) or ECDSA-MPC (EVM)
6. Proactive refresh - new shares, same public key
7a. Recovery         - decrypt PVE backup, restore share
7b. Rotation         - new DKG and on-chain migration
```

## 1. Distributed Key Generation (DKG)

Signers run EC-DKG for the `t-of-n` threshold setup used for Bitcoin / Lin24. Feldman's Verifiable Secret Sharing is used so each party can verify its own share is consistent with the collective polynomial before accepting it - a malicious dealer cannot silently seed a bad share.

The output is:

- A single BIP340-compatible x-only public key - used as the `loanPubkey` in Vault paths.
- One private share per signer.
- No plaintext aggregate private key at any signer.

The public key is recorded in coordination contracts and embedded in every new Vault. It never changes through deployment life except via explicit rotation (stage 7b).

## 2. Backup - Publicly Verifiable Encryption (PVE)

After DKG (and after every refresh), each signer encrypts its share under a **backup public key** and produces a zero-knowledge proof that the ciphertext correctly encrypts its true share. See [Disaster Recovery](/tech/disaster-recovery) for the detailed threat model.

Two properties that matter for lifecycle:

- **Backups are verified without being decrypted.** A verifier checks each ZK proof mathematically and gates key activation on all proofs passing. No one - not even Surge - holds the backup decryption key when the verification happens.
- **Backup is interlocked with signing.** Signing is blocked if the PVE backup is older than the current key-share epoch. Every refresh cycle must complete `encrypt share → wrap DEK → persist → create PVE backup → verify backup` before signing resumes.

## 3. Verify Backup

The verification system checks all signers' ZK proofs as a batch. If any proof fails, the key is **not enabled for signing**, and the cluster re-runs DKG before putting the key into production. A partially-verifiable backup is worse than no backup because it gives a false sense of recoverability.

## 4. Secure Storage

Each signer serializes its share and encrypts it at rest using envelope encryption (AES-256-GCM with identity metadata bound into the AAD), with the Data Encryption Key (DEK) wrapped by a Key Encryption Key (KEK) that lives in hardware each signer organization controls independently. The KEK never leaves its hardware boundary. See [Key Shard Security](/tech/key-shard-security) for storage layout and KEK options.

## 5. Signing

A signing session is the only moment a share is briefly decrypted into process memory. The [Signing Policy](/tech/mpc-signing) page covers the validators that gate this. Memory hygiene controls (memory locking, secure zeroization, core-dump prevention) bound the exposure to the brief active session.

## 6. Proactive Key Refresh

Refresh is a threshold protocol in which all signers jointly generate **new share values for the same public key**. On-chain state is unchanged - addresses, vault scripts, and the public key stay identical. What changes is every signer's share.

**Why refresh matters.** Old shares retain standalone value within their epoch: an attacker who slowly accumulates `t` shares from different compromised signers within the same epoch can reconstruct the key. Refresh invalidates the entire epoch: shares from two different epochs cannot be combined in a signing session, so an attacker's progress is reset the instant a new epoch begins.

## 7. Recovery vs Rotation

Two distinct incident classes demand two distinct responses:

- **Loss or corruption** - a share is unrecoverable but there is no evidence of compromise. The PVE backup is decrypted by a quorum of recovery agents (threshold-gated, see [Disaster Recovery](/tech/disaster-recovery)), the share is restored, and a refresh immediately invalidates the restored share's epoch. Same private key, same addresses - no on-chain migration needed.
- **Compromise or suspected compromise at or above threshold** - a new DKG is run to generate a fresh key. Funds are migrated on-chain from old addresses to new addresses. The old key is treated as toxic regardless of whether evidence conclusively proves compromise.

Below-threshold compromise of a single share is handled by refresh alone: old shares (including the compromised one) are made cryptographically useless, and the signer in question is re-provisioned or rotated out via [reshare](/tech/reshare-onboarding).

### 🛡 Key Shard Security
---
title: Key Shard Security
description: Envelope encryption, per-organization hardware trust anchors, and the KeyProtector abstraction
---

# 🛡 Key Shard Security

The signer protocol guarantees that no amount of compromise short of threshold produces a signature. What the protocol does not prescribe is **how each signer stores its share at rest**. That boundary - between MPC protocol logic and signer persistence - is where Surge applies envelope encryption, hardware-rooted key wrapping, and a hardened memory regime during signing.

## The Problem

A naive signer stores the share as plaintext in a local database. Anyone with filesystem access - a stolen backup, a compromised server, a careless export - obtains the raw share. Even though compromise of a single share is below threshold and thus not catastrophic, it erodes the temporal safety of refresh and starts the clock on a larger attack.

## Envelope Encryption

Each signer uses two-layer encryption:

1. A randomly-generated **Data Encryption Key (DEK)** - unique per key share, per version, never reused - is used to encrypt the serialized share with **AES-256-GCM**. Identity metadata (key ID, party index, epoch version, KMS key reference) is bound into the Additional Authenticated Data (AAD). Any tampering with the ciphertext or metadata fails decryption.
2. The DEK itself is **wrapped** by a **Key Encryption Key (KEK)** that lives in hardware. The KEK never leaves the hardware boundary. Unwrap is a remote operation from the signer's perspective - the wrapped DEK is sent to the KMS / HSM, the hardware unwraps it, and only the unwrapped DEK comes back.

### Flow at Each Signer

```
DKG / refresh produces share
   ↓
serialize → AES-256-GCM with fresh DEK (AAD = identity metadata)
   ↓
Send DEK to KeyProtector (Cloud KMS / HSM) to be wrapped by the KEK
   ↓
Persist { encrypted_share, wrapped_DEK, metadata } in the signer database
   ↓
Zeroize the plaintext share and the raw DEK from memory immediately
```

At signing time:

```
Load { encrypted_share, wrapped_DEK, metadata } from DB
   ↓
KeyProtector.UnwrapDEK(wrapped_DEK) → plaintext DEK (briefly in memory)
   ↓
AES-256-GCM decrypt the share with DEK + AAD-verified metadata
   ↓
Run Lin24 / ECDSA-MPC with the plaintext share
   ↓
Zeroize share + DEK from memory
```

### Why Two Layers

- **Rotation without re-encrypting all data.** Rotating the KEK re-wraps small DEKs; the large encrypted shards stay put.
- **Performance.** KMS calls are 50–200ms. AES-GCM in userspace is microseconds. One KMS call per share load is acceptable.
- **Defence in depth.** The encrypted shard and the wrapped DEK can be stored separately. An attacker who obtains only one of the two has no path to the plaintext.
- **Integrity binding.** AES-GCM authenticates both the ciphertext and the bound metadata; Cloud KMS providers with AAD support enforce the same matching on their side during unwrap.

## What Each Stored Record Contains

A signer's at-rest record for a single key share holds, conceptually:

- The **encrypted share**  and its authentication tag, with a unique random IV.
- The **wrapped DEK**, encrypted by the signer's hardware-backed KEK.
- A **KEK reference** identifying which KMS key wrapped the DEK, so rotation can find every record affected.
- An **encryption-version marker** so the format can evolve without ambiguity.
- An **audit timestamp** for forensic reconstruction.

The metadata fields (key identity, party index, epoch version, KEK reference) are bound into the AES-GCM Additional Authenticated Data, so any tampering with either the ciphertext or the metadata fails decryption.

## Where the KEK Lives - Per-Organization Hardware Trust

The encryption chain must terminate at hardware **each signer organization controls independently**. There is no shared KMS account, no shared credentials, and no shared backup custodian across the DCN. The security of the whole network depends on different organizations not having a single point of failure in common.

Each signer's host has its own root of trust chosen from the options below. The **KeyProtector** interface abstracts over these so the rest of the code sees only `WrapDEK` / `UnwrapDEK`.

## In-Memory Protection During Signing

Envelope encryption protects the share at rest. During signing, the share must be plaintext in process memory for the brief duration of the Lin24 / ECDSA-MPC protocol. The in-memory controls bound the exposure window:

| Control | Effect |
|---|---|
| Memory locking | Prevents the OS from swapping share memory to disk |
| Secure zeroization | Overwrites share memory with zeros immediately after the session, using constant-time clearing the compiler cannot optimise away |
| Core-dump prevention | Crashes during signing cannot persist share material |
| Runtime-level discipline | The language runtime is constrained so it cannot copy share-bearing memory into locations the code cannot reach |
| Proactive refresh | After each session, the in-memory share is rotated to a new epoch and the old share value cannot be combined with current-epoch shares in any subsequent session ([Key Lifecycle](/tech/key-lifecycle)) |

## Residual Risk

Even with every control above in place, two residual risks remain non-zero:

- **In-memory exposure during signing.** A root-level attacker who compromises the host during an active signing window could theoretically read the plaintext share. Memory locking, secure zeroization, and per-session refresh narrow this significantly.
- **Operator error.** Software-based controls depend on correct deployment. A misconfigured node could undermine guarantees that hardened infrastructure controls are designed to maintain. Surge mitigates this with automated validation and release-gate checks, but does not consider it eliminated.

Surge operates under the explicit assumption that the controls above reduce - not eliminate - these categories, and treats them in operational response planning accordingly.

### 🧾 Signing Policy
---
title: Signing Policy
description: How the DCN decides whether to sign - authentication, per-signer validation, the one-honest-node policy, and transport security
---

# 🧾 Signing Policy

The [Lin24 protocol](/tech/distributed-custody-network) guarantees that no signature is produced without a threshold of honest signers. It does **not** decide *what* gets signed - that is enforced by Surge's signer policy and quorum access-structure configuration. This page describes the policy each signer enforces locally, the one-honest-node policy enforced across the cluster, and the transport guarantees between signers.

## Defence-in-Depth Layers

A spend request has to pass nine independent checks before a Bitcoin transaction leaves the DCN:

| # | Layer | Role |
|---|---|---|
| 1 | Distributed trust | Lin24 threshold (`t-of-n`), no single party holds the key |
| 2 | Encryption at rest | Envelope-encrypted key shards; KEK in HSM-class hardware |
| 3 | Temporal invalidation | Proactive key refresh invalidates prior shards |
| 4 | Policy enforcement | One honest node policy: Surge's party must be in every quorum |
| 5 | Transport security | mTLS-only between signers with enforced peer identity |
| 6 | Anti-replay | Session-ID binding; replayed requests rejected |
| 7 | Memory hygiene | `mlock`, secure zeroization, core dumps disabled during signing |
| 8 | Disaster recovery | PVE backups verified by ZK proof; threshold-gated recovery key |
| 9 | Hardware attestation | TEE  optional per signer via KeyProtector abstraction |


## Per-Signer Validation

Each signer independently evaluates every spend request against on-chain contract state and local invariants **before** participating in the Lin24 protocol. A signer that rejects the request contributes no share; if rejections put the cluster below threshold, the session aborts with no signature.

Validator categories:

- **Deposit & script validators.** Confirm the input UTXO matches a known Vault with the expected MAST tree; confirm the leaf being spent matches the authorization reason (Repayment vs Liquidation).
- **Loan-state validators.** Read position state from contracts; confirm `debtUsd`, collateral ratio, and term match the authorization.
- **Oracle validators.** Confirm the BTC/USD price used for the authorization is current, within deviation bounds, and consistent across signers.
- **Output validators.** Confirm output addresses are in the expected set - user withdrawal address for Repayment, configured DCN sweep address for Liquidation. Reject any output going to a signer-controlled address.
- **Timelock validators.** Confirm the Exit CSV on this vault has not yet expired. Once it has, the borrower's Exit path dominates and the DCN must refuse to spend.
- **Session validators.** Confirm the session ID is well-formed and unused (anti-replay via a persistent `used_sessions` table).

A request that fails any validator on any signer produces no signature on that signer. Because a Lin24 signing round needs at least `t` honest participants to produce an output, even a single well-placed validator failure stops the spend.

## One Honest Node Policy

The Lin24 protocol treats signers symmetrically, but Surge configures the signer set with a quorum access structure that requires the Surge policy-enforcing signer in every valid signing set (`AND(HonestSigner, THRESHOLD(m-of-n))`).

This requirement is enforced at the signer and quorum level, not only as an application-layer convention. Local policy validators still run on every signer before shares are produced.

- A hard enforcement point for critical invariants. A request that clears threshold math still does not sign unless the policy-enforcing signer accepts it.
- Deterministic authorization behavior across the cluster. Requests that exclude or bypass the required signer are invalid by construction under the access structure.
- Clear operational accountability. Approval and rejection decisions follow one auditable policy path instead of ad-hoc coordinator routing.
- A deliberate liveness dependency on the required signer. If it is unavailable beyond timeout bounds, signing pauses even when other parties are online.
- Higher availability requirements for policy infrastructure. Monitoring, failover readiness, and response procedures must be stronger for the required signer than for optional participants.

**Failover.** A bounded, rate-limited, audit-logged override path lets multi-admin approval designate a temporary alternate policy-enforcing signer. Override windows are time-limited so an administrative compromise cannot permanently displace the required signer.

## Transport Security

All inter-signer traffic runs over mTLS with a cluster CA. Target production posture:

- **TLS-only listeners.** The HTTP listener is disabled when TLS is enabled.
- **Peer identity verified, not just CA chain.** Manual `VerifyPeerCertificate` callbacks enforce the expected Common Name / SAN for each peer index - a certificate signed by the cluster CA but with the wrong identity is rejected. This prevents a compromised party's cert from impersonating a different party in the quorum.
- **Certificate pinning via IP SAN.** When signers are addressed by IP, certificates include the IP in the SAN to prevent address-swapping attacks.
- **Internal routes require mTLS.** Administrative endpoints (e.g. reshare fragment transport) require a valid peer certificate; requests without a client cert are rejected.

## Anti-Replay

Every signing session carries a unique session identifier. Each signer records consumed identifiers and refuses any subsequent request that re-uses one. Identifier format is strictly validated so caller-controlled inputs cannot produce collisions.

## Memory Hygiene

Key-share material is only in plaintext memory for the brief duration of an active signing session. During that window:

- Memory locking prevents the OS from paging share memory to disk.
- Share buffers are cleared with constant-time secure zeroization (not a loop that the compiler can optimise away) immediately after the session returns.
- Core dumps are disabled so a crash during signing cannot persist share material.
- Runtime garbage-collection behaviour is constrained so the language runtime cannot copy share-bearing memory into locations the code cannot reach.

Residual risk after these controls: a root-level attacker on the host during the active signing window could theoretically read share memory. Surge treats this as a bounded exposure window and reduces it through memory controls, refresh policy, and infrastructure hardening.

### 🌐 Oracle System
---
title: Oracle System
description: Surge's BTC/USD price feed - medianized inputs, per-signer validation, deterministic enforcement of collateral health
---

# 🌐 Oracle System

The **Oracle System** is Surge's BTC/USD price feed. Unlike external oracle plug-ins, Surge treats price discovery as a **first-class part of the protocol**: the price that drives a borrower's collateral ratio is the same price every signer in the [Distributed Custody Network](/tech/distributed-custody-network) sees and validates against before producing a signature.

The Oracle System powered by:

1. Chainlink's decentralized oracle network updates their feed
2. Our Oracle system reads the latest price from Chainlink and updates

The Oracle System powers:

- **Collateral monitoring** - monitoring each Vault's live Collateral Ratio (CR).
- **Liquidation enforcement** - surfacing positions for `checkHealth(...)` when `CR < MinCR` or near liquidation threshold.
- **Per-signer validation** - every signing request is evaluated against the most recent confirmed price; stale or out-of-band prices abort signing rather than producing a bad spend.

The intent is that no single off-chain actor can move a position into liquidation, and no signer participates in a signing session whose authorisation is grounded in an unhealthy price.

## Failure Safety

- **Deterministic fallbacks.** If insufficient fresh updates are available for a new median, the system reuses the last confirmed price until new data finalises. No "best guess" or extrapolation.
- **Graceful degradation.** Rather than emitting a stale price, the protocol pauses CR updates and surfaces an alert. Existing positions remain readable; new health-trigger actions wait until fresh data is available.
- **Manipulation resistance.** No one can override prices, Immutable and All logic verifiable on-chain

## Per-Signer Oracle Validation

Each DCN signer validates the price grounding of every authorisation before participating in signing session:

- **Freshness.** The price is no older than the configured staleness window.
- **Cross-signer consistency.** The price the signer sees locally agrees with the protocol's consensus price within a configured delta.
- **Sanity bands.** The price has not deviated from the last confirmed value by more than a configured percentage over a single interval.

If any check fails on any signer, that signer refuses to participate, the quorum is not met, and **no signature is produced**. The cost of an oracle anomaly is a delayed liquidation, not a wrong one.

See [Signing Policy](/tech/mpc-signing) for how this validation interlocks with the rest of the per-signer policy stack.

## Oracle Events

The Oracle System emits canonical events consumable by the [Smart Contracts](/tech/contracts), the [Relayer](/tech/relayer), and external observers:

- `PriceUpdated { medianPrice, timestamp }`
- `CollateralRatioUpdated { positionId, newCR }`
- `LiquidationTriggered { positionId, CR }`

These events form a complete, replayable audit trail for liquidation decisions: any observer can reconstruct, from public data, exactly which price drove which collateral-ratio update and which liquidation.

## Roadmap

The oracle path will continue to evolve toward broader source diversity, public transparency of submitter identities and signed-update history, and a published deviation budget so any party can independently verify that the protocol's medianized output remained inside policy at every interval. The destination state is a feed whose correctness can be audited end-to-end by anyone, not trusted by configuration.

### 🔧 Technical Overview
---
title: Technical Overview
description: How Surge composes Bitcoin Taproot vaults, a distributed custody network, EVM credit contracts, and CCTP v2 into one Bitcoin-native credit market
---

# 🔧 Technical Overview

Surge is a Bitcoin-native credit market. Borrowers lock real BTC under programmable Taproot scripts, lenders supply stablecoins to a multi-market credit pool, rates, liquidation, and settlement are coordinated by audited code rather than custodians. The architecture is built so a borrower can always recover their BTC on Bitcoin alone, and so an LP's claim is always backed by a verifiable on-chain position.

## What Surge Is Made Of

The system is built from four cooperating components. Each owns a distinct layer of the protocol, everything else in the stack supports one of these.

| Component | Where it lives | What it owns |
|---|---|---|
| **Taproot Vaults** | Bitcoin | The collateral. Programmable spend conditions (Repayment / Liquidation / Exit) committed at vault creation. |
| **Distributed Custody Network (DCN)** | Off-chain decentralized signer organisations | Threshold Schnorr signatures on Bitcoin spends. No signer holds a complete key, no quorum can move BTC outside policy. |
| **Smart Contracts** | EVM (Base, Ethereum) | The debt ledger, share-based liquidity pool, interest-rate model, and Dutch-auction liquidation. |
| **Relayer & Workers** | Off-chain service | The coordinator. Watches Bitcoin, drives the contracts, proposes spends to the DCN, and finalises CCTP transfers. Holds no custody. |

A **stablecoin liquidity layer**  routes USDC across chains so the pool stays canonical regardless of where supply originated. A **per-signer oracle path** feeds BTC/USD into health calculations.

## How They Fit Together





1. **Borrower deposits BTC** to a Taproot output whose scriptTree commits the three spend leaves and uses a NUMS internal key derived from `SHA256("SURGE-NUMS")` (output: `6a1bac977b8af761b330d1473dba1e5cfc75b3256a1ae900b78a369e175423f2`), with key-path spend disabled. The deposit address is derived deterministically from the borrower's wallet plus an aggregate `loanPubkey` produced by the DCN.
2. **Relayer observes the deposit** at the configured confirmation depth and calls `VaultManager.submitLoan(...)` on the EVM side. A `PositionID` is minted and the stablecoin liability is recorded on the canonical ledger.
3. **Borrower receives USDC** - drawn from `LiquidityPool` on Base today, with Ethereum routing supported through CCTP v2. Additional chains are planned.
4. **Position lives.** The relayer streams oracle price updates into the position's health calculation; workers monitor the collateral ratio against `MinCR` and the liquidation threshold.
5. **Closure** happens on one of three Bitcoin spend paths:
   - **Repayment** (cooperative) - borrower repays USDC, the DCN co-signs a release of BTC to the borrower's withdrawal address.
   - **Liquidation** (DCN, authorised) - collateral ratio breaches the liquidation threshold, or the credit line is past term and unpaid, the DCN signs a sweep to a Dutch auction, proceeds retire the originating market's debt.
   - **Unilateral Exit** (borrower alone, after CSV) - if everything else fails, the borrower spends the Exit leaf after a relative timelock and walks away with their BTC.

## Why Each Layer Exists

- **Taproot Vaults keep custody on Bitcoin.** Collateral stays under script control; no bridge, wrapped BTC, or platform custody assumptions.
- **The DCN provides threshold signing without multisig footprint.** On-chain spends look like standard Schnorr signatures while signer policy is enforced off-chain by independent validators.
- **EVM contracts run the credit engine.** Debt accounting, market logic, rates, and liquidation are handled where stateful finance is efficient, while BTC custody remains on Bitcoin.
- **The relayer handles operations, not authority.** It automates monitoring, submissions, and cross-chain settlement, but cannot move BTC or mint unbacked USDC.

## The Trust Boundary

Bitcoin script enforces custody. Threshold cryptography enforces "no single signer compromise loses funds." EVM contracts enforce accounting. The relayer is convenience infrastructure. **A compromised relayer can delay things, it cannot move BTC, cannot mint debt, and cannot cause LPs to lose principal.**

### 💰 Repayment Path
---
title: Repayment
description: Cooperative closure of a Vault via the vaultId-bound Repayment path
---

# 💰 Repayment Path

The **Repayment path** is the cooperative closure path of a Vault. It releases the borrower's BTC once the stablecoin debt is settled. There is no bridge, wrapped asset, or custodial hand-off - only a Bitcoin spend that becomes valid when both the borrower and the DCN sign against the path bound to this specific position.

## How It Works

1. **Debt reduction.** The borrower repays stablecoins (e.g. USDC) to the protocol via `VaultManager.repay(...)` (or the gasless EIP-3009 variant `repayWithERC3009`). The on-chain ledger updates `debtUsd` for the position.
2. **Release authorization.** Once the on-chain ledger reflects the repayment and the position is healthy, the [Relayer](/tech/relayer) requests a Repayment-leaf spend for a proportional BTC amount; the DCN's per-signer validators independently confirm the on-chain state before participating.
3. **Co-signing.** The DCN runs a Lin24 threshold Schnorr signing session to produce the `loanPubkey` signature, and the borrower's wallet produces the `userPubkey` signature. The signatures are assembled into the Repayment witness.
4. **Full closure.** When `debtUsd == 0`, the whole UTXO can be spent. BTC is returned to the borrower's withdrawal address in a single transaction.

## Script

```bitcoin-script
                 # 32-byte vault commitment
OP_DROP
  OP_CHECKSIG
  OP_CHECKSIGADD
OP_2
OP_NUMEQUAL
```

The leading ` OP_DROP` is a commitment, not a runtime check - it forces the leaf (and therefore the taptree, the Taproot address, and the script tree root) to be unique to this position, so a valid witness for one Vault cannot be replayed against another.

The final `OP_2 OP_NUMEQUAL` requires exactly two valid signatures - both the borrower *and* the DCN aggregate key must sign. Neither side can close the Vault without the other via this path.

## Properties

- **User custody preserved.** The DCN cannot use Repayment to move BTC without the borrower's signature.
- **DCN attestation preserved.** The borrower cannot close the vault without the DCN's signature, which is only produced after the Coordination Layer confirms the repayment.
- **BIP340-compatible signature component.** The DCN authorization signature itself is standard Schnorr.

### 🛰 Relayer & Workers
---
title: Relayer & Workers
description: The service layer that keeps Bitcoin state and contract state synchronized
---

# 🛰 Relayer & Workers

Between Vaults on Bitcoin and the debt ledger on EVM sits a service whose job is to keep both sides in sync: observe deposits and withdrawals, drive contract calls, coordinate with the DCN for spends, and complete cross-chain transfers.

The relayer **does not hold custody** of BTC. It does not hold DCN signing keys. It can propose spends and submit EVM transactions, but BTC movement still requires DCN quorum signatures and contract-side authorization.

## Service Shape

- **Network-aware processing.** Mainnet and testnet workloads are isolated.
- **Worker model.** Independent workers own specific state transitions and reconcile through persistent state.
- **Idempotent retries.** Replayed work converges to the same result using stable identifiers.

## Workers

Each worker owns a slice of state and runs independently. Workers reconcile through persistent workflow state and are idempotent on retry.

### `btc-indexer`

Tracks BTC deposits from the moment a user's deposit address is issued through confirmation.

- Watches the Blockstream / Esplora indexers (primary + fallback) for transactions to each user's derived Taproot address.
- Advances deposit state through discovery → mempool → N-confirmation thresholds.
- At the confirmation threshold, triggers `submitLoan(...)` on `VaultManager` to open the credit line.
- Handles reorgs by rolling deposit state backward and re-observing.

### `loan-event-listener`

Ingests on-chain events from `VaultManager`, `AuctionHouse`, and `LiquidityPool`.

- Streams events via WebSocket where available; falls back to HTTP polling with bounded block ranges.
- Persists each event, sequences them per position, and dispatches to internal handlers.
- Handlers drive follow-up calls. For example, successful repayment triggers withdrawal authorization and liquidation events drive BTC-side sweep coordination with the DCN.

### `withdrawal-confirmation-worker`

When a borrower requests BTC withdrawal after partial or full repayment:

- The DCN produces a spend for the user's configured withdrawal address.
- This worker watches for the transaction on Bitcoin, verifies the sats moved and confirmations threshold, and calls `confirmWithdrawal(...)` on chain so the position accounting is finalized.
- Tolerances are bounded: amount is checked against the pending withdrawal minus an audit-configurable dust tolerance; timestamp is checked with a grace window to tolerate block-timestamp drift.

### `loan-health-monitor`

Scans active positions for health-factor breaches.

- Fetches current BTC/USD price from the Oracle System.
- Computes `CR` per position using stored collateral and debt.
- Submits `checkHealth(positionId)` so `VaultManager` can open an auction if liquidation conditions are met.
- Supports dry-run operation for safe staging validation.

## Gasless Flows

Surge supports gasless borrower actions:

- **USDC relay** - the relayer pays gas; the borrower signs authorization payloads.
- **Repay and withdraw** - borrower signatures authorize the action, and the relayer submits the transaction.
- **Cross-chain routing (CCTP)** - the relayer coordinates burn-and-mint flow without custody of user funds.

In every gasless flow the **borrower's signature is what authorizes the action**. The relayer pays gas; it does not authorize.

## Failure & Retry Semantics

- **Idempotency.** Workers use stable keys (position id, deposit tx hash, CCTP nonce) so retried work converges on the same outcome.
- **Persistence.** Every external action is persisted before submission. Crashes resume from persisted state, not memory.
- **Backoff.** Destination-chain gas shortfalls, attestation delays, and RPC flakiness use bounded exponential backoff with timeouts so no worker spins indefinitely.

## Liveness - What If the Relayer Stops

The relayer is convenience infrastructure, not a trust anchor. When it is unavailable, the system pauses for users; it does not lose funds and it does not change what is true on chain.

**What stays safe.**

- BTC remains under Taproot script on Bitcoin. Nothing the relayer does or fails to do can move it.
- EVM contract state is canonical - debt, shares, and position NFTs are unchanged by relayer downtime.
- The **Unilateral Exit** path stays available to any borrower whose CSV timelock has elapsed. A borrower who wants out does not need the relayer, the DCN, or any Surge-operated service to recover their BTC.

**What gets delayed while it is down.**

- **New borrows.** A BTC deposit still lands on Bitcoin, but `submitLoan(...)` is not called until the indexer catches up, so USDC is not disbursed yet.
- **Health checks and liquidations.** Oracle-driven health submissions pause; a position that would otherwise have been liquidated stays in its pre-event state until monitoring resumes.
- **Withdrawal finalization.** A DCN-signed BTC withdrawal may still broadcast, but `confirmWithdrawal(...)` on EVM only fires once the confirmation worker sees the transaction.
- **Cross-chain mints.** Pending CCTP burns wait for the attestation worker to submit `receiveMessage` on the destination chain. Funds are not lost - the burn is already recorded with Circle - the destination mint is simply delayed.
- **Gasless actions.** Repay / withdraw / bridge calls that rely on the relayer to pay gas queue until it returns; a user can always submit the same action themselves from a funded wallet.

The user-visible shape of an outage is a pause, not a loss. Positions sit where they were; new work begins flowing again once the service is back.

## What the Relayer Is Not

- **Not a custody service.** BTC is never at the relayer. Any BTC move requires a DCN-signed Taproot spend.
- **Not the signing authority.** The relayer proposes spends; per-signer validators in the DCN decide whether to sign.
- **Not the source of truth.** Canonical state is Bitcoin plus EVM contracts; relayer persistence is workflow state.

## References

- [Distributed Custody Network](/tech/distributed-custody-network) for DCN signing.
- [Smart Contracts](/tech/contracts) for the EVM side.
- [Credit Markets](/tech/credit-markets) for markets on liquidity pool.

### 🔁 Reshare & Signer Onboarding
---
title: Reshare & Signer Onboarding
description: Adding, removing, and rotating signer organizations without changing the public key or on-chain addresses
---

# 🔁 Reshare & Signer Onboarding

Adding a new signer organization to the DCN, retiring an existing one, or changing the threshold are not operations a Lin24 refresh can do. Refresh produces new shares for the **same** access structure. **Reshare** produces new shares for a **different** access structure - a new party count, a new threshold, a new set of signer organizations - while keeping the same public key and therefore the same on-chain addresses, vault scripts, and active commitments.

A reshare is the only way to evolve the DCN's membership safely. It is a cryptographic primitive, not a configuration change.

## Why Reshare Is Its Own Protocol

Three things make reshare hard:

1. **The public key must not change.** On-chain, the public key is baked into every active Vault (`loanPubkey` in the Repayment and Liquidation paths) and into every open position. Changing it would orphan live collateral.
2. **Old shares must become cryptographically useless.** If an old signer is being removed, the old access structure must not retain signing power. A naive "new signers get new shares, old signers keep their old shares" approach leaves the old quorum able to sign indefinitely.
3. **Failures must be recoverable without partial-state danger.** If the protocol is interrupted between old shares and new shares being committed, the cluster must end up in a clearly-defined state - either fully on the old access structure or fully on the new one - not in a hybrid state where neither quorum can sign.

## Four-Phase Reshare

The reshare protocol, as orchestrated by the DCN, runs in four phases. The transitions between phases are designed so a failure at any point is recoverable.

### Phase 1 - Fragment Generation

Old parties generate cryptographic fragments from their existing shares, each fragment destined for a specific new party. Fragments are signed and encrypted in transit. No new key material is committed yet.

### Phase 2 - Fragment Collection

New parties collect fragments from every old party. A new party that hasn't received its full set cannot progress; a fragment whose signature or encryption fails authentication is rejected and the affected old party is flagged.

### Phase 3 - Reconstruction & Public-Key Verification

Each new party mathematically reconstructs its new share from the fragments it received and verifies that the new set of shares produces the **same public key** as before. This is a non-negotiable check: if the reconstructed key differs from the committed on-chain key, the protocol aborts and the new shares are discarded.

Reconstructed shares are written to a **staging** table, not the live one. Signing continues to use the old shares throughout phases 1–3.

### Phase 4 - Promotion

The leader confirms all new parties have successfully reconstructed and verified. Promotion is a **single database transaction per party** that atomically swaps staged shares into live slots and **archives the old shares for destruction**. Signing resumes using the new access structure.

If anything fails between phases 3 and 4, the old shares remain live and the reshare can be retried or aborted cleanly - no partial state where neither quorum can sign.

## Transport Security for Reshare Fragments

Reshare fragments in transit are the most sensitive traffic in the network - anyone who intercepts all fragments from all old parties to a specific new party can reconstruct that new party's share. Transport has three requirements:

- **mTLS with enforced peer identity.** Fragment transport routes are required to present a client certificate; unauthenticated requests are rejected in staging and production.
- **End-to-end encryption to the new party's KeyProtector.** The new party must have its [KeyProtector](/tech/key-shard-security) configured and validated - `WrapDEK` / `UnwrapDEK` working against its own hardware - **before** any fragment is sent. Fragments are encrypted to a key bound to that KeyProtector.
- **No fragment persistence in cleartext at any hop.** The leader routes but does not store fragment plaintext; new parties decrypt and reconstruct without writing the fragments' cleartext to disk.

## When Reshare Runs

| Trigger | Action |
|---|---|
| New signer organization joining | Add party; change from `t-of-n` to `t-of-(n+1)` (or adjust threshold explicitly) |
| Signer organization leaving | Remove party; change from `t-of-n` to `t-of-(n-1)` |
| Threshold change (policy decision) | Same set of parties, new `t` |
| Key-share compromise at any single signer | Remove and re-add that signer with fresh KeyProtector; old shares destroyed |
| Periodic rotation (policy-driven) | Rotate the access structure itself to bound any single epoch's exposure, independent of refresh |

Reshare is distinct from [refresh](/tech/key-lifecycle#6-proactive-key-refresh): refresh keeps the access structure and rotates shares; reshare changes the access structure.

### 🔐 Self-Custody User Wallet
---
title: Self-Custody User Wallet
description: Surge's borrower wallet - sealed key generation and signing inside hardware-isolated execution environments, encrypted export, and cryptographic attestation
---

# 🔐 Self-Custody User Wallet

The Surge app holds the borrower's wallet and is designed with **self-custody at its core**. Every wallet instance ensures that private keys are created, stored, and used exclusively under the authenticated user's control. The user - not Surge - has authority over signing actions, key export, stablecoin distribution, and the return address used by every spend path.

The signing environment runs as a sealed runtime within hardware-isolated infrastructure. Once instantiated, its memory and code are cryptographically measured and isolated so that operators, administrators, and the host kernel cannot read, export, or modify a user's private key.



## Authentication & Key Lifecycle

### 1. Email login & session initialization

- The user authenticates with **email + OTP**.
- A short-lived **JWT session token** is issued on successful verification.
- The token authorizes enclave operations during its validity window; expiry forces re-authentication.

### 2. Deterministic key generation

- On first login the runtime queries the enclave for an existing keypair bound to the user.
- If none exists, the enclave **generates a new asymmetric keypair internally**.
- The **public key** is returned to the application layer and mapped as `{ userID, email, publicKey }`.
- The **private key** stays sealed inside isolated memory and is never serialized outside the trust boundary.

### 2b. Optional wallet import (mnemonic)

- If mnemonic import is enabled for a deployment, users can import an existing wallet during setup.
- The mnemonic is used only to derive key material inside the sealed runtime.
- After import, only sealed key state is retained; the mnemonic is not kept as persistent plaintext.
- The user confirms the derived public key before activating the imported wallet.

### 3. Transaction signing flow

- The client submits a transaction payload alongside the active JWT.
- The backend validates the session and forwards `{ userID, txData, signatureRequestID }` into the enclave.
- The enclave verifies request authenticity and authorization before signing.
- Signing happens entirely inside the sealed environment; only the resulting signature leaves the boundary.

### 4. Controlled key export

- A user can export their private key for self-managed custody.
- Export re-prompts for OTP and encrypts the key with a **user-defined passphrase**.
- The encrypted blob is portable: the user can store it offline, in another wallet, or in third-party custody.

## Self-Custody Properties

| Property | Enforcement |
|---|---|
| **User ownership** | Cryptographic operations originate from keys generated under the user's control. |
| **Key isolation** | Keys are sealed inside protected compute environments, isolated from application and infrastructure layers. |
| **Portability** | Encrypted key export allows migration and independent storage. |
| **No silent recovery** | Surge has no path to reconstruct a private key without the user's passphrase or active session. |

## Hardware-Backed Isolation

Wallet key management runs inside hardware-backed **Trusted Execution Environments (TEEs)**. Each instance produces a **cryptographic attestation report** at initialization that:

- Verifies the environment is running on **genuine, unmodified hardware**.
- Verifies the loaded code matches the **approved wallet binary**.
- Revokes trust automatically if either the code or the environment changes - any tamper alters the attestation fingerprint.

This produces verifiable proof that the wallet enclave is authentic, unmodified, and operating in a known-good state.

## Versioning & Update Lifecycle

Enclave binaries are immutable at runtime. Updates and bug fixes go through a versioned redeploy:

1. Build a new enclave image with the updated wallet logic.
2. Deploy and verify its new attestation measurement.
3. Migrate users to the new measurement only after the fingerprint is publicly recorded.

This guarantees that every running wallet instance corresponds to a code version that has been measured, attested, and observable from the outside.

## Roadmap

The Confidential VM platform underpinning the wallet enclave continues to evolve. The current roadmap includes broader hardware coverage (additional CVM platforms beyond the current deployment), public attestation transparency for the wallet's measurement history, and tighter integration between the wallet's attestation and the [Distributed Custody Network](/tech/distributed-custody-network)'s signing-policy validators so that authorisations from this wallet can be recognised by the DCN as originating from a measured, sealed environment.

The intent stays the same regardless of platform: the user holds the key, the runtime never reveals it, and any change to the runtime is publicly verifiable.

### 🔄 Transfers
---
title: Transfers
description: How cooperative position transfers between Surge and third-party marketplaces are coordinated
---

# 🔄 Transfers

Transfers allow a borrower to move a credit position to or from a third-party marketplace through a coordinated process across contracts and signer policy.

There is no separate on-chain "Transfer leaf" in the Taproot script tree. Transfer settlement is handled through cooperative authorization and state transitions.

## Transfer Flow

1. **Borrower request** - borrower initiates transfer intent.
2. **Coordination Layer validation** - policy checks validate the transfer terms and destination market conditions.
3. **Counterparty acceptance** - third-party marketplace accepts transfer terms.
4. **Cooperative settlement** - required approvals are collected, Bitcoin spend and contract updates are executed, and ownership/state are synchronized.

Settlement details are implementation-specific and evolve as integrations are finalized.

## Key points

- **Cooperative authorization:** Transfers require borrower consent, DCN policy compliance, and external market acceptance.
- **No dedicated Transfer script leaf:** Transfer behavior is coordinated at the application and contract layers.

### 🔐 Taproot Vaults
---
title: Taproot Vaults
description: Taproot-based Bitcoin Vaults with committed spend paths and threshold Schnorr authorization
---

# 🔐 Taproot Vaults

A **Vault** is a Pay-to-Taproot output ([BIP341](https://en.bitcoin.it/wiki/BIP_0341)) whose spend conditions are committed via **MAST / Tapscript** ([BIP342](https://en.bitcoin.it/wiki/BIP_0342)). Each Vault holds borrower BTC and can only move when one of three pre-committed spend paths is satisfied.

## Design Choices

- **MAST tree.** Three leaves committed at Vault creation: **Repayment**, **Liquidation**, **Exit**. Only the executed leaf is revealed at spend time; unused branches remain hidden.
- **Vault binding.** The Repayment leaf commits a 32-byte `vaultId = keccak256(abi.encodePacked(userEvmAddress, nonce))`, binding the UTXO to the borrower's on-chain position so that a spent leaf cannot be replayed against a different position.
- **Threshold Schnorr ([BIP340](https://en.bitcoin.it/wiki/BIP_0340)) via Lin24.** The `loanPubkey` is an aggregate x-only key produced by a 3-of-4 signing session.
- **Key-path spend disabled.** The internal key is a deterministic **NUMS** key derived from `SHA256("SURGE-NUMS")`, whose output used by Surge is `6a1bac977b8af761b330d1473dba1e5cfc75b3256a1ae900b78a369e175423f2`, and is set as the Taproot x-only internal pubkey. This guarantees there is no usable private key for key-path signing, so every spend must reveal and execute a script path.

## Trust Model

| Scenario | Who can spend | Leaf used |
|---|---|---|
| Cooperative closure | User **and** DCN co-sign | Repayment |
| Collateral unhealthy or credit delinquent at term | DCN unilateral | Liquidation |
| DCN / coordination layer disappears | User alone after ~1 year relative timelock | Exit |

Delinquency (credit line not paid at term) is handled by the **Liquidation** leaf, it is a different *trigger reason*, not a different script. Transfers to/from a third-party marketplace are coordinated cooperatively through the Repayment flow. See [Transfers](/tech/transfers).



## Script Anatomy

### 1. Repayment (user + DCN)

The path commits `vaultId`, drops it, then requires both signatures (`userPubkey` and `loanPubkey`) with `OP_CHECKSIG` + `OP_CHECKSIGADD == 2`.

Cooperative closure only. Neither side can close alone through this path.

### 2. Liquidation (DCN only)

The path requires a valid `loanPubkey` signature.

This path is used when the Coordination Layer authorizes liquidation, such as a collateral-ratio breach of the liquidation threshold or unpaid end-of-term delinquency.

### 3. Exit (user only, CSV timelock)

The path enforces `OP_CHECKSEQUENCEVERIFY`, then requires `userPubkey` signature.

After the delay elapses, the borrower can recover funds without DCN participation.

## Vault Lifecycle

1. **Deposit.** User locks BTC to the Taproot output whose script tree is compiled from the three leaves above with the NUMS internal key.
2. **Borrow.** The Coordination Layer issues stablecoin debt against the confirmed deposit via `VaultManager` and creates a position representing the loan.
3. **Monitoring.** Oracle price updates drive the position's live collateral ratio; worker processes track health and term.
4. **Closure.** One of three leaves is executed:
   - **Repay** - proportional BTC released to the user's withdrawal address.
   - **Liquidate** - BTC moves to the DCN-controlled sweep address, a Dutch auction runs on the EVM side against the market that issued the credit line, and any BTC surplus after debt settlement is re-locked into a Vault UTXO under the same scripts.
   - **Exit** - user alone spends after CSV expiry.

## Why This Is Safe

- **Bitcoin script is final authority.** Off-chain services can request actions, but BTC only moves when a valid committed Taproot leaf is satisfied on-chain.
- **No hidden key-path backdoor.** The Vault uses a NUMS internal key derived from `SHA256("SURGE-NUMS")`, so key-path signing is not available.
- **Repayment is bound to the correct position.** `vaultId` in the Repayment leaf prevents replaying a valid witness against a different Vault.
- **Borrower recovery is guaranteed by script.** After CSV expiry, the Exit path can be spent by the borrower without depending on the DCN or platform availability.

## Credit Markets

### 📊 Credit Markets
---
title: Credit Markets
description: How Surge's credit markets work and why the multi-market design is better than alternatives.
---

# 📊 Credit Markets

Surge's credit markets let borrowers and lenders meet on transparent, programmable terms. Instead of a single opaque pool or a custodial black box, Surge offers **variable** and **fixed-rate** markets where liquidity is shared, moved on demand, and always auditable.

## How It Works

### Variable and fixed markets

- **Variable market** - The primary market. Borrowers pay a utilization-driven floating rate; lenders earn yield that moves with demand. All deposits land here first.
- **Fixed-rate markets** - Optional tranches (e.g. 6%, 8%) where borrowers lock in a rate and lenders earn a fixed supply rate. Liquidity is **moved** from the variable pool when borrowers take fixed-rate loans and **moved back** on repay. There is no duplication or rehypothecation.

Borrowers choose which market fits their needs. Lenders can opt in to fixed markets and control how much of their capital is exposed to each. One liquidity base, multiple rate options, and clear rules for how funds flow.

## Why This Design

- **Two rate choices from one liquidity base.** Borrowers can choose fixed or variable pricing without splitting into isolated products, and LPs can control exposure per market.
- **Non-custodial and verifiable.** BTC collateral remains in Vault scripts on Bitcoin; utilization, rates, and accounting are on-chain and auditable.
- **Yield from real borrowing demand.** Returns come from BTC-collateralized credit activity (and liquidation flow where applicable), not token subsidies or circular leverage.
- **Capital stays deep instead of fragmented.** Liquidity is pooled canonically and routed deterministically, improving depth and execution quality.

---

Surge's credit markets are built for Bitcoin-native finance: transparent, programmable, and aligned with real credit demand rather than speculation or custodial intermediation.

### Cross-links

- [For Liquidity Providers](/product/for-liquidity-providers) - LP perspective on variable vs fixed  
- [Repayment](/tech/payment) - Normal closure path  
- [Liquidation](/tech/dvaults-liquidation) - Vault liquidation path

## Miscellaneous

### Borrow SDK
---
title: Borrow SDK
description: Integrate a Bitcoin-backed USDC credit line with the Surge Borrow SDK. Headless TypeScript client, variable market, Base.
---

# Borrow SDK


Offer a Bitcoin-backed credit line in your app with the headless Surge Borrow SDK.


This page is a preview of the integration surface. The package is not published yet and access is gated to approved partners, so reach out to the Surge team for access and test credentials. The shapes below are the v1 contract we are building against, and details can still change before release.

The SDK is headless and signer-agnostic: it never holds keys, renders no UI, and works in the browser, Node, and React Native. Your app brings a Bitcoin taproot public key, an EVM address, and the ability to sign what the SDK asks.

Scope: BTC collateral in a per-user taproot vault, USDC disbursed on Base (6 decimals), both live markets selectable at deposit, and the full position lifecycle: deposit + initial borrow in one intent, add collateral, borrow more, gasless repay, extend credit line, and withdraw, on signet + Base Sepolia (test) and Bitcoin mainnet + Base (production).

## How an integration works

1. **Create a session.** The user signs a Sign-In-with-Ethereum message through Supabase and a session JWT is issued. The Bitcoin public key comes from the wallet adapter you wired in and is recorded for vault derivation. There is no Bitcoin signature at login, and the withdraw PSBT is the only Bitcoin signature in the whole flow.
2. **Get the vault.** The SDK generates the taproot deposit vault address locally from the user's key, and the gateway verifies it with its own derivation and registers it for deposit tracking. Both sides must agree before the address is ever shown.
3. **Deposit and borrow.** One signed intent covers the collateral deposit and the initial borrow. The user sends BTC to the vault address from any wallet. Once the deposit confirms, Surge opens the position on Base and USDC lands at the user's EVM address, the same address that signed the intent.
4. **Manage the position.** Read collateral, debt, health, and the live rate. Borrow more against the same vault, repay and withdraw gaslessly (the user signs typed data, Surge sponsors the gas), and pull BTC back out once debt allows.

You wire two signers into the client once - an EVM signer and a Bitcoin signer. From then on you never handle a raw signing request. When you call an action, the SDK builds the intent, invokes your signer to have the user sign it, collects the signature, and submits it to the gateway - all inside that one call. The user still signs every intent, but through the callback you provided, not through a request your app has to catch and re-submit.

## Install and configure

```ts
// npm install @surgecredit/borrow-sdk viem

const client = createBorrowClient({
  network: "signet", // "signet" | "mainnet"
  storage,           // optional - see below
});
```

**`network`** selects the environment: `"signet"` (Bitcoin signet + Base Sepolia, for testing) or `"mainnet"` (Bitcoin mainnet + Base).

**`storage`** is where the login session (the auth token) is kept so the user does not have to sign in again on every app restart. It is a small key-value adapter with three methods:

```ts
interface StorageAdapter {
  getItem(key: string): string | null | Promise;
  setItem(key: string, value: string): void | Promise;
  removeItem(key: string): void | Promise;
}
```

Pass one that survives a restart on your platform:

```ts
// Browser
const storage: StorageAdapter = window.localStorage;

// React Native - use the platform's secure store, not AsyncStorage
// (AsyncStorage keeps values in plaintext; the session token should be encrypted at rest)

const storage: StorageAdapter = {
  getItem: (k) => SecureStore.getItemAsync(k),
  setItem: (k, v) => SecureStore.setItemAsync(k, v),
  removeItem: (k) => SecureStore.deleteItemAsync(k),
};
```

`storage` is **optional in the browser** - if you omit it, the SDK falls back to `localStorage`. It is **required on React Native and Node**, which have no `localStorage`. Do **not** pass `window.sessionStorage`: it is cleared when the tab or app closes, so the user would be logged out on every restart.

The core client has no framework dependencies and `viem` is its only peer dependency. React users can import ready-made hooks from `@surgecredit/borrow-sdk/react`, but nothing in the SDK requires React.

## Signers

The SDK defines two small interfaces, and both signers are required. Browser Bitcoin wallets (Xverse, Unisat, Leather) match `BtcSigner` almost one-to-one, and any EVM wallet matches `EvmSigner`. How you source or build each one is up to you.

```ts
interface BtcSigner {
  address: string;
  publicKey: string; // x-only taproot pubkey
  signPsbt(psbtBase64: string, inputs: TapInputRef[]): Promise;
}

interface EvmSigner {
  address: `0x${string}`;
  signMessage(message: string): Promise;   // EIP-191
  signTypedData(data: EIP712TypedData): Promise; // EIP-712
}
```

{/* Optional createDerivedBtcSigner helper hidden for now. Restore by removing this comment wrapper.


Optional helper: createDerivedBtcSigner

If your platform holds the Bitcoin key itself (an embedded wallet, or a key derived from account entropy you already manage), `createDerivedBtcSigner` implements `BtcSigner` from a raw secp256k1 key. It derives the taproot account with the standard BIP-86 path, so the address matches what any other BIP-86 wallet would produce from the same key, and it signs PSBT tapscript inputs in memory inside your app. The key never leaves your process, and the key must be deterministic and recover with the user's account, because the vault is bound to its public key.

```ts

// a 32-byte secp256k1 private key your wallet stack already holds
const btcSigner = createDerivedBtcSigner(privateKey, { network: "signet" });

btcSigner.address;   // taproot address (BIP-86)
btcSigner.publicKey; // x-only pubkey used for vault derivation
```



*/}

What each side must be able to do:

| Side | Requirement |
| --- | --- |
| EVM | An externally-owned account (EOA) that signs EIP-191 personal messages and EIP-712 typed data. Borrowed USDC is disbursed to this address. Smart-contract wallets (ERC-1271) are not supported yet, and support is planned through a contract upgrade |
| Bitcoin | A taproot (P2TR) account that exposes its x-only public key and signs a PSBT input over a tapscript the SDK provides (script-path Schnorr). This is the only Bitcoin signature in the flow. Key-path-only signers, which includes hardware wallets today, cannot hold the vault key, but they still work as a deposit source and a withdrawal destination |

### Address types

Three addresses appear in a borrow flow, and only one of them is constrained:

- **The user's Bitcoin key must be a taproot (P2TR) account key.** The vault's spending paths require Schnorr signatures over a taproot script, and a SegWit (`bc1q...`) or legacy account key cannot produce those. Wallets that expose multiple accounts (Xverse, Unisat, Leather all do) must hand the SDK their taproot address and its x-only public key.
- **The deposit can be funded from anywhere.** Any wallet, any address type, even an exchange withdrawal. Only the destination matters, and that is the taproot deposit vault address, which is always P2TR by construction.
- **Withdrawals pay out to any address the user chooses.** P2TR, native SegWit, or legacy all work. It is just a transaction output.

## Session and vault

```ts
const session = await client.createSession({ btcSigner, evmSigner });
// SIWE login (EVM signature) -> JWT. The Bitcoin pubkey is read from btcSigner
// and recorded for vault derivation. Resumable across restarts.

const vault = await session.getVault();
// { vaultId, depositAddress, scriptTree, network, minDepositSats, exitTimelockBlocks }
```

`getVault` generates the taproot deposit vault address in the SDK and confirms it through the gateway, which runs its own derivation and registers the address for deposit tracking. If the two derivations disagree it throws `VAULT_ADDRESS_MISMATCH`. Show the address only after this check passes.

## Deposit and borrow

The first borrow is bundled with the deposit in a single intent, there is no standalone borrow call. List the markets first and let the user pick where the position opens:

```ts
const markets = await session.getMarkets();
// [{ marketId, kind: "variable" | "fixed", borrowRateApr,
//    maxLtvBps, liquidationThresholdBps, active }]

const deposit = await session.createDeposit({
  collateralSats: 500_000n,
  borrowAmountUsd: "1000",
  marketId: markets[0].marketId,
  durationDays: 90,
  idempotencyKey,
});
// The SDK calls evmSigner.signMessage for the action envelope and submits it,
// then returns { vaultAddress, depositId }.

// show deposit.vaultAddress + QR; the user sends BTC from any wallet
session.watchDeposits(deposit.depositId, (s) => {
  // s.state: "seen" -> "confirming" (s.confirmations / s.required) -> "confirmed" -> "credited"
});
```

On confirmation Surge opens the position on Base and USDC is disbursed to the session's verified EVM address.

## Read the position

```ts
const position = await session.getPosition();
// { collateralSats, debtUsd, healthFactor, maxBorrowUsd,
//   liquidationPriceUsd, borrowRateApr, loanExpiresAt }

const quote = await session.getBorrowQuote({ amountUsd: "500" });
```

Debt accrues at the position's market rate: the live adaptive rate on the variable market, or the locked rate on the fixed market. All statuses are absolute data (timestamps, confirmation counts, amounts), never point-in-time booleans, so a UI re-rendering from history always derives the current state correctly. For example, sign requests carry `expiresAt`, not `isExpired`.

## Add collateral

Top up the collateral on an open position by sending more BTC to the **same vault address**, then registering it. Registration is a read-style sync, so there is no signature prompt.

```ts
// user sends BTC to vault.depositAddress from any wallet, then:
await session.addCollateral();
// syncs the new UTXOs into the position once they confirm
```

Adding collateral raises `maxBorrowUsd` and improves `healthFactor`. Read the position again after the sync to show the updated numbers.

## Borrow more

Draw more USDC against a confirmed vault. The request is pre-checked against the live LTV before any sign request is issued, and the funds always go to the same verified EVM address as the initial borrow.

```ts
const quote = await session.getBorrowQuote({ amountUsd: "250" }); // optional preview
await session.borrowMore({ amountUsd: "250" });
// The SDK calls evmSigner.signMessage for the action envelope and submits it.
```

A draw that would exceed the maximum loan-to-value fails with `LTV_EXCEEDED` before the wallet is prompted. If the user needs a larger credit line, add collateral first, then borrow more.

## Repay

Repay is gasless in the first version: the user signs two pieces of EIP-712 typed data (a repay authorization and a USDC EIP-3009 transfer authorization) and Surge submits the transaction and pays the gas. Overpayment is capped to the live debt and the excess is refunded by the contract.

```ts
await session.repay({ amountUsd: "200" });
// The SDK calls evmSigner.signTypedData twice - the repay authorization and the
// USDC EIP-3009 transfer authorization - then submits both for Surge to relay.
```

## Withdraw BTC

Withdrawal has two signatures: an EIP-712 authorization on the EVM side (relayed gaslessly, records the pending withdrawal on-chain) and a PSBT signature on the Bitcoin side (the vault's repayment path is a 2-of-2 between the user and the Surge lender key, which co-signs after validating the request).

```ts
await session.withdraw({
  toBtcAddress,
  amountSats: 200_000n,
  broadcast: "client", // "client" (default) or "relayer"
});
// The SDK calls evmSigner.signTypedData for the EVM authorization, then
// btcSigner.signPsbt for the repayment-leaf spend (the only Bitcoin signature).
```

Before it prompts `btcSigner.signPsbt`, the SDK verifies the PSBT it receives (outputs, amounts, change back to the vault) against your request. With `broadcast: "client"` the SDK finalizes the fully signed transaction and your app broadcasts it (a broadcast helper is included). With `broadcast: "relayer"` Surge broadcasts for you. Either way Surge watches the chain and settles the position after confirmations.

## Extend the credit line

Positions have a term (`durationDays` on the deposit intent), and `position.loanExpiresAt` tells you when it ends. Extending refreshes the term on the open position without repaying. The debt and collateral carry over unchanged.

```ts
await session.extendCreditLine();
// The SDK calls evmSigner.signMessage for the action envelope and submits it.
// position.loanExpiresAt reflects the new term after confirmation
```

Drive the renewal prompt in your UI from `loanExpiresAt` against the current time, not from a stored flag.

## What the SDK asks your signers to sign

You never handle a raw signing request. When an action needs a signature, the SDK calls the matching method on the signer you injected, passing a payload that carries a human-readable `reason` (display it next to the wallet prompt) and an `expiresAt`. Each payload is single-use; the gateway rejects expired or replayed submissions.

| Signer method | Signs | Used by |
| --- | --- | --- |
| `evmSigner.signMessage` | EIP-191 message | SIWE login, and the action envelope on deposit, borrow-more, and extend |
| `evmSigner.signTypedData` | EIP-712 typed data | repay (two - repay authorization + USDC EIP-3009), withdraw (EVM authorization) |
| `btcSigner.signPsbt` | Taproot script-path PSBT (Schnorr) | withdraw only - the single Bitcoin signature in the whole flow |

`addCollateral` and all reads need no signature.

## Errors

The SDK surfaces typed, stable error codes only. Raw backend messages are never exposed.

| Code | When |
| --- | --- |
| `SESSION_UNAUTHENTICATED` | An operation was called without a valid session. Create or resume the session first |
| `VAULT_ADDRESS_MISMATCH` | Local re-derivation of the deposit address failed. Stop and report, and never show the address |
| `VAULT_NOT_CONFIRMED` | Borrow or withdraw against a deposit that has not confirmed yet |
| `LTV_EXCEEDED` | Requested borrow would exceed the maximum loan-to-value |
| `INSUFFICIENT_COLLATERAL` | Withdrawal would leave the position under-collateralized |
| `WITHDRAWAL_AMOUNT_MISMATCH` | The PSBT amount does not match the authorized pending withdrawal |
| `SIGN_REQUEST_EXPIRED` | The signer returned a signature after the payload's `expiresAt`; the action retries with a fresh one |
| `NONCE_REUSED` | A signed action envelope was replayed |

Pre-flight validation runs before the SDK calls your signer, so the wallet is never prompted for an action that will fail. Pass an `idempotencyKey` on every mutating call so retries after a network failure never duplicate an action.

## Testing on signet

Integrate against signet first. Signet BTC is free from public faucets, and testnet USDC lives on Base Sepolia (the Circle faucet at [faucet.circle.com](https://faucet.circle.com) covers it). Completing a full lifecycle on signet, from deposit through withdraw, is the acceptance bar before mainnet access is issued.


v0.1

### 🏗️ Bitcoin-native Credit Infra
---
title: "Bitcoin-native Credit Infra"
description: "How Surge is structured across application and infrastructure layers"
---

# 🏗️ Bitcoin-native Credit Infra

Surge is best understood as two layers:

**An application layer** - the apps Bitcoiners actually use to borrow against BTC, supply stablecoins, and earn yield.

**An infrastructure layer** - the underlying protocol that holds the collateral, runs the markets, signs the spends, and enforces the rules. The same protocol any other team can build on.

The applications you see are one expression of Surge. The infrastructure underneath is open, and others can build their own.

## The application layer

These are Surge's own apps - the front doors most users will walk through.

- **Surge Borrow App (iOS, Android).** Where Bitcoiners open credit lines against their BTC. Sign in with email + OTP, deposit BTC into a programmable Taproot vault, draw stablecoins, repay flexibly. PWA support coming.
- **Surge Earn Dashboard.** Where liquidity providers supply stablecoins to the credit market and earn yield from real Bitcoin-collateralized borrowing. LPs configure exposure across variable and fixed-rate markets, monitor pool health, and (optionally) join the Distributed Custody Network.

These apps are designed, built, and operated by the team behind Surge. They are not the only way to access the protocol.

## The infrastructure layer

Underneath the apps sits the actual credit market - the part that makes Surge *Bitcoin-native* rather than just another lending UI.

The infrastructure has four cooperating components, each owning a distinct layer of the system:

- **Taproot Vaults.** BTC collateral lives in Pay-to-Taproot outputs on Bitcoin, with three pre-committed spend paths: cooperative repayment, authorized liquidation, and unilateral exit after a relative timelock. No bridge, no wrapped BTC, no platform custody.
- **Distributed Custody Network (DCN).** A set of independent signer organizations running threshold Schnorr signing. No single signer holds a complete key; signatures are produced only when quorum participation and policy checks both pass.
- **Smart Contracts (EVM).** The debt ledger, share-based liquidity pool, interest-rate model, and Dutch-auction liquidation. BTC custody stays on Bitcoin; stateful credit accounting runs where it is efficient.
- **Relayer & Workers.** Off-chain coordinator that watches Bitcoin, drives the contracts, proposes spends to the DCN, and finalizes cross-chain transfers. Holds no custody, holds no signing keys.

For a deeper walk through the architecture, see **[Tech Overview](/tech/overview)**.

## Others can build on it

The infrastructure is permissionless. Any team can integrate the same dVaults, DCN, and liquidity layer that power Surge's own apps - and ship borrow or earn products under their own brand.

- **White-label borrow.** Wallets, exchanges, and neobanks can offer "borrow against your Bitcoin" to their users without operating custody or running a lending book. Surge handles collateral verification, disbursement, and repayments; the partner owns the user experience.
- **White-label earn.** Savings apps and treasury products can offer yield on stablecoins, backed by real Bitcoin-collateralized credit, without operating the lending or custody infrastructure.
- **Same rails, your brand.** Partners plug into the same programmable dVaults, oracle-driven liquidation, and multi-market liquidity that Surge's own apps use. Each credit line is still a verifiable Taproot UTXO; partners can surface proof of non-custodial, unrehypothecated collateral to their users and regulators.

There are no gatekeepers, no exclusive partnerships, and no approval gates. The protocol is integrated through public interfaces.

## Stewardship - the Surge Foundation

A protocol that holds Bitcoin under script, distributes signing across independent organizations, and runs an open credit market needs a steward - but it cannot be owned by a single company. Ownership and operation must be separable, or the "open infrastructure" promise breaks the moment commercial interests diverge from protocol integrity.

Surge separates the two explicitly.

**The Surge Foundation stewards the protocol.** It maintains the open-source codebase, publishes specifications, coordinates upgrades, and acts as the long-term custodian of protocol integrity. The Foundation does not operate apps, does not capture fees commercially, and does not gatekeep access. Its job is to keep the infrastructure open, public, and trustworthy.

**A separate company builds the apps.** The team behind the Surge Borrow App and Earn Dashboard operates as a normal product company - shipping software, running infrastructure for its own products, and competing on user experience. It is one builder on Surge among many possible builders.

This separation is structural, not cosmetic.

- **The protocol outlives any single operator.** If the app company stopped tomorrow, the dVaults, DCN, smart contracts, and Foundation-stewarded specs would continue to exist and continue to be usable by other builders.
- **No commercial conflict at the protocol layer.** Decisions about specs, parameters, and signer membership are made by the Foundation under public, open-source governance - not by whichever company has the largest book.
- **Builders compete on equal footing.** The same APIs, the same liquidity, the same custody guarantees are available to Surge's own app and to a third-party wallet on day one.

What the Foundation publishes - repos, specs, audits, signer-set composition, oracle history, governance decisions - is the surface that distinguishes a credit market that *is* open infrastructure from one that merely *claims* to be.

## How to read the rest of these docs

- **Curious how the Bitcoin side works?** Start with [Taproot Vaults](/tech/vaults).
- **Curious how signatures are produced without a private key?** Start with the [Distributed Custody Network](/tech/distributed-custody-network).
- **Curious how rates, debt, and liquidations are accounted for?** Start with [Smart Contracts](/tech/contracts) and [Credit Markets](/tech/credit-markets).
- **Want the whole architecture in one page?** Start with [Tech Overview](/tech/overview).

