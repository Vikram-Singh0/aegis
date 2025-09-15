"use client";

import { useReadContract, useSendTransaction, useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, defineChain } from "thirdweb";
import { client } from "@/app/client";
import { CONTRACT_ADDRESSES, COLLATERAL_MANAGER_ABI, ERC20_ABI } from "@/lib/contracts";
import { useState, useEffect } from "react";
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
  
  const { data: accountData, isLoading, error } = useReadContract({
    contract: collateralManagerContract,
    method: "getAccountData",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  return {
    accountData,
    isLoading,
    error,
    hasAccount: !!account?.address,
  };
}

// Hook for getting token balances
export function useTokenBalances() {
  const account = useActiveAccount();
  
  const { data: wethBalance } = useReadContract({
    contract: wethContract,
    method: "balanceOf",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 10000,
    },
  });

  const { data: usdcBalance } = useReadContract({
    contract: usdcContract,
    method: "balanceOf",
    params: [account?.address || "0x0000000000000000000000000000000000000000"],
    queryOptions: {
      enabled: !!account?.address,
      refetchInterval: 10000,
    },
  });

  return {
    wethBalance: wethBalance || 0n,
    usdcBalance: usdcBalance || 0n,
  };
}

// Hook for getting current prices
export function usePrices() {
  const { data: collateralPrice } = useReadContract({
    contract: collateralManagerContract,
    method: "getCurrentCollateralPrice",
    queryOptions: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  const { data: debtPrice } = useReadContract({
    contract: collateralManagerContract,
    method: "getCurrentDebtPrice",
    queryOptions: {
      refetchInterval: 30000,
    },
  });

  return {
    collateralPrice: collateralPrice || 0n,
    debtPrice: debtPrice || 0n,
  };
}

// Hook for contract interactions
export function useContractActions() {
  const { mutate: sendTransaction, isPending, error } = useSendTransaction();
  const account = useActiveAccount();

  // Deposit collateral
  const depositCollateral = async (amount: bigint) => {
    if (!account?.address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // First approve the contract to spend WETH
      const approveCall = prepareContractCall({
        contract: wethContract,
        method: "approve",
        params: [CONTRACT_ADDRESSES.COLLATERAL_MANAGER, amount],
      });

      await sendTransaction(approveCall);

      // Then deposit collateral
      const depositCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "depositCollateral",
        params: [amount],
      });

      await sendTransaction(depositCall);
      toast.success("Collateral deposited successfully!");
    } catch (err: any) {
      console.error("Deposit error:", err);
      toast.error(err.message || "Failed to deposit collateral");
    }
  };

  // Borrow USDC
  const borrow = async (amount: bigint) => {
    if (!account?.address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const borrowCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "borrow",
        params: [amount],
      });

      await sendTransaction(borrowCall);
      toast.success("Borrowed successfully!");
    } catch (err: any) {
      console.error("Borrow error:", err);
      toast.error(err.message || "Failed to borrow");
    }
  };

  // Repay loan
  const repay = async (amount: bigint) => {
    if (!account?.address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      // First approve the contract to spend USDC
      const approveCall = prepareContractCall({
        contract: usdcContract,
        method: "approve",
        params: [CONTRACT_ADDRESSES.COLLATERAL_MANAGER, amount],
      });

      await sendTransaction(approveCall);

      // Then repay
      const repayCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "repay",
        params: [amount],
      });

      await sendTransaction(repayCall);
      toast.success("Repaid successfully!");
    } catch (err: any) {
      console.error("Repay error:", err);
      toast.error(err.message || "Failed to repay");
    }
  };

  // Withdraw collateral
  const withdrawCollateral = async (amount: bigint) => {
    if (!account?.address) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      const withdrawCall = prepareContractCall({
        contract: collateralManagerContract,
        method: "withdrawCollateral",
        params: [amount],
      });

      await sendTransaction(withdrawCall);
      toast.success("Collateral withdrawn successfully!");
    } catch (err: any) {
      console.error("Withdraw error:", err);
      toast.error(err.message || "Failed to withdraw collateral");
    }
  };

  return {
    depositCollateral,
    borrow,
    repay,
    withdrawCollateral,
    isPending,
    error,
  };
}

// Utility functions for formatting
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
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

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  const [whole, fractional = ''] = amount.split('.');
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFractional);
}

export function formatUSD(amount: bigint): string {
  const divisor = BigInt(10 ** 18);
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