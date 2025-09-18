# Aegis - DeFi Lending Protocol

Aegis is a decentralized lending protocol built on Somnia Testnet that allows users to deposit WETH as collateral and borrow USDC stablecoins. The protocol features real-time health factor monitoring, LTV tracking, and comprehensive risk management.

## 🚀 Features

- **Collateral Management**: Deposit and withdraw WETH as collateral
- **Borrowing**: Borrow USDC against your WETH collateral with competitive rates
- **Repayment**: Flexible repayment options with real-time health factor updates
- **Risk Management**: Live LTV monitoring and liquidation threshold alerts
- **Health Factor**: Real-time health factor calculation to prevent liquidation
- **Modern UI**: Beautiful, responsive interface with dark theme
- **Wallet Integration**: Seamless wallet connection with thirdweb

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Blockchain**: thirdweb SDK, Somnia Testnet
- **Smart Contracts**: Solidity, Hardhat
- **State Management**: React hooks, custom hooks

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MetaMask or compatible wallet
- Somnia Testnet RPC access

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd aegis
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_CHAIN_ID=50312
NEXT_PUBLIC_RPC_URL=https://dream-rpc.somnia.network
```

### 3. Contract Addresses

Update contract addresses in `src/config/contracts.ts` with your deployed contracts:

```typescript
export const CONTRACT_ADDRESSES = {
  COLLATERAL_MANAGER: "0x...",
  WETH: "0x...",
  USDC: "0x...",
  PRICE_ORACLE: "0x..."
}
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Smart Contracts

The protocol consists of several smart contracts:

- **CollateralManager**: Main protocol contract handling deposits, borrows, and repayments
- **WETHTest**: Wrapped ETH test token for collateral
- **USDCTest**: USDC test token for borrowing
- **MockPriceOracle**: Price oracle for asset valuations

### Deploy Contracts

```bash
cd aegis-contract
pnpm install
pnpm hardhat compile
pnpm hardhat deploy --network somnia
```

## 📱 Usage

### 1. Connect Wallet
- Click "Connect Wallet" in the header
- Select your preferred wallet (MetaMask, etc.)
- Ensure you're on Somnia Testnet

### 2. Deposit Collateral
- Navigate to "Borrow" page
- Enter WETH amount to deposit
- Click "Deposit Collateral"
- Approve transaction in wallet

### 3. Borrow USDC
- After depositing collateral, enter USDC amount to borrow
- Maximum borrowable amount is calculated based on LTV ratio
- Click "Borrow USDC"
- Approve transaction in wallet

### 4. Monitor Position
- View your position on the Dashboard
- Monitor health factor and LTV ratio
- Track available borrowing capacity

### 5. Repay Loan
- Navigate to "Repay" page
- Enter USDC amount to repay
- Click "Confirm Repayment"
- Approve transaction in wallet

### 6. Withdraw Collateral
- Navigate to "Withdraw" page
- Enter WETH amount to withdraw
- Ensure health factor remains safe
- Click "Confirm Withdrawal"

## ⚠️ Risk Management

- **Liquidation Threshold**: 85% LTV
- **Max LTV**: 60% (collateral factor)
- **Health Factor**: Must stay above 1.0 to avoid liquidation
- **Price Oracle**: Uses mock oracle for testing (replace with real oracle for production)

## 🔧 Configuration

### Contract Parameters

Update parameters in `src/hooks/useCalculations.ts`:

```typescript
export const CONTRACT_PARAMS = {
  COLLATERAL_FACTOR: 0.6, // 60% max LTV
  LIQUIDATION_THRESHOLD: 0.85, // 85% liquidation threshold
  HEALTH_FACTOR_THRESHOLDS: {
    EXCELLENT: 2.0,
    GOOD: 1.5,
    FAIR: 1.2,
    AT_RISK: 1.0,
  }
}
```

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Deploy to Other Platforms

The app is a standard Next.js application and can be deployed to:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

## 🧪 Testing

### Run Tests

```bash
# Frontend tests
pnpm test

# Smart contract tests
cd aegis-contract
pnpm test
```

### Test on Somnia Testnet

1. Get testnet tokens from Somnia faucet
2. Deploy contracts to testnet
3. Test all functionality with test tokens

## 📁 Project Structure

```
aegis/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configurations
│   └── utils/              # Helper functions
├── aegis-contract/         # Smart contracts
│   ├── contracts/          # Solidity contracts
│   ├── scripts/            # Deployment scripts
│   └── test/               # Contract tests
└── public/                 # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community Discord

## ⚠️ Disclaimer

This is a testnet application for demonstration purposes. Do not use with mainnet assets or real money. Always conduct thorough testing before deploying to production.

---

Built with ❤️ using Next.js, thirdweb, and Somnia Testnet