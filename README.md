# APACash: Global Crypto. Local Cash.

**Instant cross-border payments for Asia-Pacific on Arbitrum.**

![APACash Demo](https://raw.githubusercontent.com/edwardtay/APACash/main/public/demo-banner.png)

APACash bridges the gap between global stablecoins (USDC) and local currencies across 17 APAC nations. Using an **Atomic Swap** architecture secured by **EIP-712** signatures, it allows users to pay in USDC and recipients to receive local currency (IDR, PHP, THB, etc.) instantly.

## 🚀 Live Demo

- **App:** [Localhost Demo](http://localhost:3003) (Testnet)
- **Network:** Arbitrum Sepolia

## ✨ Key Features

- **🌐 17 APAC Currencies**: Support for IDR, PHP, THB, VND, SGD, INR, JPY, KRW, and more.
- **⚡ Instant Settlement**: Sub-second finality using Arbitrum L2.
- **🔐 Trustless & Non-Custodial**: Secured by `APACashRouter` contract. Funds never held by us.
- **💸 Zero Slippage**: Intent-based RFQ model provides exact quotes.
- **📱 Mobile-First Design**: Elegant, glassmorphism UI optimized for minimal friction.

## 🏗 Architecture

**The "Dealer Model" (RFQ)**
We replace complex AMMs with a professional Dealer (Market Maker) model:

1.  **User Intent**: User requests a quote (e.g., "10 USDC for IDR").
2.  **Off-Chain Pricing**: Dealer API calculates best rate from real-world FX feeds.
3.  **Cryptographic Signature**: Dealer yields an EIP-712 signed quote.
4.  **Atomic Execution**: User submits quote to `APACashRouter`. Contract atomically pulls USDC and pushes IDR.

No bonding curves. No impermanent loss. Just efficient settlement.

## 📜 Deployed Contracts (Arbitrum Sepolia)

| Contract | Address |
|----------|---------|
| **APACashRouter** | [`0x93fc90a3fb7d8c15bbaf50bfcc612b26ca8e68c8`](https://sepolia.arbiscan.io/address/0x93fc90a3fb7d8c15bbaf50bfcc612b26ca8e68c8) |
| **MockUSDC** | [`0xcff09905f8f18b35f5a1ba6d2822d62b3d8c48be`](https://sepolia.arbiscan.io/address/0xcff09905f8f18b35f5a1ba6d2822d62b3d8c48be) |
| **MockIDRX** | [`0xf98a4a0482d534c004cdb9a3358fd71347c4395b`](https://sepolia.arbiscan.io/address/0xf98a4a0482d534c004cdb9a3358fd71347c4395b) |

## 🛠 Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi, Viem, RainbowKit
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Security**: OpenZeppelin (EIP-712, SafeERC20, Ownable)

## 📦 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/edwardtay/APACash.git
   cd APACash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env.local
   # Fill in PRIVATE_KEY and DEALER_PRIVATE_KEY
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🛡 Security

- **Atomic Access**: The Router contract can ONLY transfer funds if a valid, unexpired signature from the Dealer is provided.
- **Nonce Protection**: Every user has an on-chain nonce to strictly prevent replay attacks.
- **Deadline Enforcement**: Quotes expire after 10 minutes to protect against FX volatility.

## 📄 License

MIT
