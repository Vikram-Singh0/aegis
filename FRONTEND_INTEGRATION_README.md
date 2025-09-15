# Frontend ↔ Contract Integration Guide

This guide explains how to connect the Next.js frontend to the deployed Aegis smart contracts using thirdweb.

## 🚀 Quick Start

### 1. Deploy Contracts and Update Configuration

```bash
# Navigate to contract directory
cd aegis-contract

# Install dependencies
npm install

# Deploy contracts and update frontend config
npx hardhat run scripts/deploy-and-update.js --network localhost
```

### 2. Set Environment Variables

Create a `.env.local` file in the `aegis` directory:

```env
# Thirdweb Client ID (get from https://portal.thirdweb.com)
NEXT_PUBLIC_TEMPLATE_CLIENT_ID=your_thirdweb_client_id

# Network configuration
NEXT_PUBLIC_NETWORK=LOCAL
```

### 3. Start the Frontend

```bash
# Navigate to frontend directory
cd aegis

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Features Implemented

### ✅ Core Lending Functions
- **Deposit Collateral**: Deposit WETH as collateral
- **Borrow USDC**: Borrow against deposited collateral
- **Repay Loan**: Repay borrowed USDC
- **Withdraw Collateral**: Withdraw collateral (if health factor allows)

### ✅ Real-time Data
- **Health Factor**: Live health factor calculation
- **LTV Ratio**: Current loan-to-value ratio
- **Token Balances**: Real wallet balances
- **Price Updates**: Live token prices from oracle

### ✅ User Experience
- **Wallet Connection**: Seamless wallet connection with thirdweb
- **Error Handling**: Toast notifications for success/error states
- **Loading States**: Visual feedback during transactions
- **Form Validation**: Input validation and limits

## 📁 File Structure

```
aegis/
├── src/
│   ├── hooks/
│   │   └── useContract.ts          # Contract interaction hooks
│   ├── lib/
│   │   └── contracts.ts            # Contract ABIs and addresses
│   ├── config/
│   │   └── contracts.ts            # Network-specific contract addresses
│   ├── components/
│   │   ├── loan-form.tsx           # Borrow form with contract integration
│   │   ├── repay-form.tsx          # Repay form with contract integration
│   │   └── withdraw-form.tsx       # Withdraw form with contract integration
│   └── app/
│       ├── dashboard/page.tsx      # Dashboard with real-time data
│       ├── borrow/page.tsx         # Borrow page
│       ├── repay/page.tsx          # Repay page
│       └── withdraw/page.tsx       # Withdraw page
```

## 🔌 Contract Integration Details

### Hooks Available

#### `useAccountData()`
Returns user's account data from the CollateralManager contract:
- Collateral amount
- Debt amount
- Health factor
- Max borrowable amount

#### `useTokenBalances()`
Returns user's token balances:
- WETH balance
- USDC balance

#### `usePrices()`
Returns current token prices from oracle:
- Collateral price (WETH)
- Debt price (USDC)

#### `useContractActions()`
Provides contract interaction functions:
- `depositCollateral(amount)`
- `borrow(amount)`
- `repay(amount)`
- `withdrawCollateral(amount)`

### Error Handling

All contract interactions include comprehensive error handling:
- Transaction failures show toast notifications
- Form validation prevents invalid inputs
- Loading states provide user feedback
- Network errors are caught and displayed

## 🧪 Testing the Integration

### 1. Connect Wallet
- Click "Connect Wallet" on any page
- Select your preferred wallet (MetaMask, WalletConnect, etc.)

### 2. Deposit Collateral
- Go to `/borrow` page
- Enter amount of WETH to deposit
- Click "Deposit Collateral"
- Approve the transaction in your wallet

### 3. Borrow USDC
- After depositing collateral, click "Confirm Borrow"
- Enter amount of USDC to borrow
- Click "Confirm Borrow"
- Approve the transaction in your wallet

### 4. Repay Loan
- Go to `/repay` page
- Enter amount of USDC to repay
- Click "Confirm Repayment"
- Approve the transaction in your wallet

### 5. Withdraw Collateral
- Go to `/withdraw` page
- Enter amount of WETH to withdraw
- Click "Confirm Withdrawal"
- Approve the transaction in your wallet

## 🔧 Configuration

### Contract Addresses
Contract addresses are automatically updated when you run the deployment script. They are stored in `src/config/contracts.ts`.

### Network Configuration
Set the `NEXT_PUBLIC_NETWORK` environment variable to:
- `LOCAL` - For local development
- `SOMNIA_TESTNET` - For Somnia testnet
- `SOMNIA_MAINNET` - For Somnia mainnet

### Thirdweb Setup
1. Go to [thirdweb portal](https://portal.thirdweb.com)
2. Create a new project
3. Get your client ID
4. Add it to your `.env.local` file

## 🐛 Troubleshooting

### Common Issues

1. **"No client ID provided"**
   - Make sure you've set `NEXT_PUBLIC_TEMPLATE_CLIENT_ID` in your `.env.local`

2. **"Contract not deployed"**
   - Run the deployment script: `npx hardhat run scripts/deploy-and-update.js --network localhost`

3. **"Insufficient funds"**
   - Make sure you have enough WETH/USDC in your wallet
   - Check that the contracts are funded with test tokens

4. **"Transaction failed"**
   - Check your wallet has enough ETH for gas
   - Ensure you're on the correct network
   - Verify contract addresses are correct

### Debug Mode
Enable debug logging by adding to your `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

## 🚀 Next Steps

1. **Deploy to Somnia Testnet**
   - Update hardhat config with Somnia RPC URL
   - Deploy contracts to testnet
   - Update contract addresses in config

2. **Add More Features**
   - Interest accrual system
   - Credit scoring
   - Notification system
   - Multi-collateral support

3. **Production Deployment**
   - Security audit
   - Mainnet deployment
   - Frontend optimization

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your wallet is connected
3. Ensure contracts are deployed and funded
4. Check network configuration

Happy coding! 🎉

