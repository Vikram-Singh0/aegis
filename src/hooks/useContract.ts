"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, defineChain, waitForReceipt } from "thirdweb";
import { client } from "@/app/client";
import { CONTRACT_ADDRESSES, COLLATERAL_MANAGER_ABI, ERC20_ABI } from "@/lib/contracts";
import { useState, useCallback } from "react";
import { toast } from "sonner";

// Define the chain (Somnia testnet)
const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  rpc: "https://dream-rpc.somnia.network",
  nativeCurrency: {
    name: "Somnia",
    symbol: "SOM",
    decimals: 18,
  },
});

// Contract instances
const collateralManagerContract = getContract({
  client,
  chain: somniaTestnet,
  address: CONTRACT_ADDRESSES.COLLATERAL_MANAGER,
  abi: COLLATERAL_MANAGER_ABI,
});

const wethContract = getContract({
  client,
  chain: somniaTestnet,
  address: CONTRACT_ADDRESSES.WETH,
  abi: ERC20_ABI,
});

const usdcContract = getContract({
  client,
  chain: somniaTestnet,
  address: CONTRACT_ADDRESSES.USDC,
  abi: ERC20_ABI,
});

// Hook for getting user account data
export function useAccountData() {
  const account = useActiveAccount();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: accountData, isLoading, error, refetch } = useReadContract({
    contract: collateralManagerContract,
    method: "getAccountData",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: 3,
    },
  });

  const refreshAccountData = useCallback(async () => {
    setRefreshKey(prev => prev + 1);
    try {
      await refetch();
    } catch (error) {
      console.error("Failed to refresh account data:", error);
    }
  }, [refetch]);

  return {
    accountData,
    isLoading,
    error,
    hasAccount: !!account?.address,
    refreshAccountData,
  };
}

// Hook for getting token balances
export function useTokenBalances() {
  const account = useActiveAccount();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { data: wethBalance, refetch: refetchWeth, error: wethError } = useReadContract({
    contract: wethContract,
    method: "balanceOf",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 30000,
      retry: 3,
    },
  });

  const { data: usdcBalance, refetch: refetchUsdc, error: usdcError } = useReadContract({
    contract: usdcContract,
    method: "balanceOf",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 30000,
      retry: 3,
    },
  });

  const refreshBalances = useCallback(async () => {
    setRefreshKey(prev => prev + 1);
    try {
      await Promise.all([refetchWeth(), refetchUsdc()]);
    } catch (error) {
      console.error("Failed to refresh token balances:", error);
    }
  }, [refetchWeth, refetchUsdc]);

  return {
    wethBalance: wethBalance || 0n,
    usdcBalance: usdcBalance || 0n,
    refreshBalances,
    error: wethError || usdcError,
  };
}

// Hook for getting current prices
export function usePrices() {
  const { data: collateralPrice, error: collateralPriceError } = useReadContract({
    contract: collateralManagerContract,
    method: "getCurrentCollateralPrice",
    queryOptions: {
      refetchInterval: 60000, // Refetch every 60 seconds
      retry: 3,
    },
  });

  const { data: debtPrice, error: debtPriceError } = useReadContract({
    contract: collateralManagerContract,
    method: "getCurrentDebtPrice",
    queryOptions: {
      refetchInterval: 60000,
      retry: 3,
    },
  });

  return {
    collateralPrice: collateralPrice || 0n,
    debtPrice: debtPrice || 0n,
    error: collateralPriceError || debtPriceError,
  };
}

// Hook to fetch USDC decimals dynamically
export function useUsdcDecimals() {
  const { data: usdcDecimals } = useReadContract({
    contract: usdcContract,
    method: "decimals",
    params: [],
    queryOptions: {
      refetchInterval: 60000,
    },
  });

  const decimalsNum = typeof usdcDecimals === 'number'
    ? usdcDecimals
    : usdcDecimals !== undefined
      ? Number(usdcDecimals as any)
      : undefined;

  return decimalsNum;
}

// Hook for contract interactions
export function useContractActions() {
  const { mutateAsync: sendTransactionAsync, isPending, error } = useSendTransaction();
  const account = useActiveAccount();
  const { refreshAccountData } = useAccountData();
  const { refreshBalances } = useTokenBalances();
  
  // Local state for individual transaction loading states
  const [isDepositing, setIsDepositing] = useState(false);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Helper function to check contract connection
  const checkContractConnection = () => {
    return !!account?.address;
  };

  // Deposit collateral
  const depositCollateral = async (amount: bigint) => {
    if (!checkContractConnection()) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsDepositing(true);
    try {
      // First approve the contract to spend WETH
      const approveCall = prepareContractCall({
        contract: wethContract,
        method: "approve",
        params: [CONTRACT_ADDRESSES.COLLATERAL_MANAGER, amount],
      });

      {
        const { transactionHash } = await sendTransactionAsync(approveCall);
        await waitForReceipt({ client, chain: somniaTestnet, transactionHash });
      }

      // Then deposit collateral
      const depositCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "depositCollateral",
        params: [amount],
      });

      const { transactionHash: depositHash } = await sendTransactionAsync(depositCall);
      const depositReceipt = await waitForReceipt({ client, chain: somniaTestnet, transactionHash: depositHash });
      toast.success("Collateral deposited successfully!");
      
      // Refresh data after successful transaction
      await refreshAccountData();
      await refreshBalances();
    } catch (err: any) {
      console.error("Deposit error:", err);
      toast.error(err.message || "Failed to deposit collateral");
    } finally {
      setIsDepositing(false);
    }
  };

  // Borrow USDC
  const borrow = async (amount: bigint) => {
    if (!checkContractConnection()) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsBorrowing(true);
    try {
      const borrowCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "borrow",
        params: [amount],
      });

      const { transactionHash: borrowHash } = await sendTransactionAsync(borrowCall);
      const borrowReceipt = await waitForReceipt({ client, chain: somniaTestnet, transactionHash: borrowHash });
      toast.success("Borrowed successfully!");
      
      // Refresh data after successful transaction
      await refreshAccountData();
      await refreshBalances();
    } catch (err: any) {
      console.error("Borrow error:", err);
      toast.error(err.message || "Failed to borrow");
    } finally {
      setIsBorrowing(false);
    }
  };

  // Repay loan
  const repay = async (amount: bigint) => {
    if (!checkContractConnection()) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsRepaying(true);
    try {
      // First approve the contract to spend USDC
      const approveCall = prepareContractCall({
        contract: usdcContract,
        method: "approve",
        params: [CONTRACT_ADDRESSES.COLLATERAL_MANAGER, amount],
      });

      {
        const { transactionHash } = await sendTransactionAsync(approveCall);
        await waitForReceipt({ client, chain: somniaTestnet, transactionHash });
      }

      // Then repay
      const repayCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "repay",
        params: [amount],
      });

      const { transactionHash: repayHash } = await sendTransactionAsync(repayCall);
      const repayReceipt = await waitForReceipt({ client, chain: somniaTestnet, transactionHash: repayHash });
      toast.success("Repaid successfully!");
      
      // Refresh data after successful transaction
      await refreshAccountData();
      await refreshBalances();
    } catch (err: any) {
      console.error("Repay error:", err);
      toast.error(err.message || "Failed to repay");
    } finally {
      setIsRepaying(false);
    }
  };

  // Withdraw collateral
  const withdrawCollateral = async (amount: bigint) => {
    if (!checkContractConnection()) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsWithdrawing(true);
    try {
      const withdrawCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "withdrawCollateral",
        params: [amount],
      });

      const { transactionHash: withdrawHash } = await sendTransactionAsync(withdrawCall);
      const withdrawReceipt = await waitForReceipt({ client, chain: somniaTestnet, transactionHash: withdrawHash });
      toast.success("Collateral withdrawn successfully!");
      
      // Refresh data after successful transaction
      await refreshAccountData();
      await refreshBalances();
    } catch (err: any) {
      console.error("Withdraw error:", err);
      toast.error(err.message || "Failed to withdraw collateral");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    depositCollateral,
    borrow,
    repay,
    withdrawCollateral,
    isPending,
    isDepositing,
    isBorrowing,
    isRepaying,
    isWithdrawing,
    error,
  };
}

// Utility functions for formatting
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = 10n ** BigInt(decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

// Enhanced formatting function for debt amounts that shows more precision for small amounts
export function formatDebtAmount(amount: bigint, decimals: number = 6): string {
  const divisor = 10n ** BigInt(decimals);
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  
  // For very small amounts, show more decimal places
  const amountNumber = Number(formatTokenAmount(amount, decimals));
  if (amountNumber < 0.01) {
    // Show up to 6 decimal places for amounts less than 1 cent
    const trimmedFractional = fractionalStr.replace(/0+$/, '');
    if (trimmedFractional === '') {
      return wholePart.toString();
    }
    return `${wholePart}.${trimmedFractional}`;
  } else if (amountNumber < 1) {
    // Show up to 4 decimal places for amounts less than $1
    const trimmedFractional = fractionalStr.substring(0, 4).replace(/0+$/, '');
    if (trimmedFractional === '') {
      return wholePart.toString();
    }
    return `${wholePart}.${trimmedFractional}`;
  } else {
    // Show 2 decimal places for larger amounts
    const trimmedFractional = fractionalStr.substring(0, 2).replace(/0+$/, '');
    if (trimmedFractional === '') {
      return wholePart.toString();
    }
    return `${wholePart}.${trimmedFractional}`;
  }
}

// Check if a debt amount is effectively zero (below dust threshold)
export function isDebtEffectivelyZero(amount: bigint, decimals: number = 6): boolean {
  // Consider amounts less than 0.000001 (1 micro-unit) as effectively zero
  const dustThreshold = 10n ** BigInt(decimals - 6); // 0.000001 for 6 decimals
  return amount < dustThreshold;
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const [wholeRaw, fractionalRaw = ''] = amount.split('.');
  const whole = wholeRaw && /^\d+$/.test(wholeRaw) ? wholeRaw : '0';
  const fractionalClean = fractionalRaw.replace(/[^\d]/g, '');
  const paddedFractional = fractionalClean.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFractional);
}

export function formatUSD(amount: bigint): string {
  const divisor = 10n ** 18n;
  const wholePart = amount / divisor;
  const fractionalPart = amount % divisor;
  
  if (fractionalPart === 0n) {
    return `$${wholePart.toLocaleString()}`;
  }
  
  const fractionalStr = fractionalPart.toString().padStart(18, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return `$${wholePart.toLocaleString()}`;
  }
  
  return `$${wholePart.toLocaleString()}.${trimmedFractional}`;
}