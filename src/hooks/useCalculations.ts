"use client";

import { useMemo } from "react";
import { useAccountData, usePrices, formatTokenAmount } from "./useContract";

// Contract parameters - these should match your deployed contract
export const CONTRACT_PARAMS = {
  // These will be fetched from contract, but we have fallbacks
  COLLATERAL_FACTOR: 0.6, // 60% - max LTV
  LIQUIDATION_THRESHOLD: 0.85, // 85% - liquidation threshold
  HEALTH_FACTOR_THRESHOLDS: {
    EXCELLENT: 2.0,
    GOOD: 1.5,
    FAIR: 1.2,
    AT_RISK: 1.0,
  }
} as const;

// Health factor status types
export type HealthStatus = "excellent" | "good" | "fair" | "at_risk" | "liquidatable";

// LTV status types  
export type LTVStatus = "safe" | "warning" | "danger" | "liquidatable";

// Position data interface
export interface PositionData {
  collateralRaw: bigint;
  debtRaw: bigint;
  collateralValueUSD: number;
  debtValueUSD: number;
  maxBorrowDebtRaw: bigint;
  healthFactor: number;
}

// Calculation results interface
export interface CalculationResults {
  // Basic values
  collateralValueUSD: number;
  debtValueUSD: number;
  healthFactor: number;
  ltv: number; // as percentage (0-100)
  
  // Derived values
  maxBorrowableUSD: number;
  availableToBorrowUSD: number;
  liquidationPrice: number;
  
  // Status indicators
  healthStatus: HealthStatus;
  ltvStatus: LTVStatus;
  isHealthy: boolean;
  isLiquidatable: boolean;
  
  // Risk metrics
  collateralUtilization: number; // how much of max LTV is used
  safetyMargin: number; // how much buffer before liquidation
}

/**
 * Centralized hook for all LTV and health factor calculations
 * This ensures consistency across the entire UI
 */
export function useCalculations(): CalculationResults {
  const { accountData, hasAccount } = useAccountData();
  const { collateralPrice, debtPrice } = usePrices();

  return useMemo(() => {
    // Default values when no account or data
    if (!hasAccount || !accountData) {
      return {
        collateralValueUSD: 0,
        debtValueUSD: 0,
        healthFactor: 0,
        ltv: 0,
        maxBorrowableUSD: 0,
        availableToBorrowUSD: 0,
        liquidationPrice: 0,
        healthStatus: "at_risk" as HealthStatus,
        ltvStatus: "safe" as LTVStatus,
        isHealthy: false,
        isLiquidatable: false,
        collateralUtilization: 0,
        safetyMargin: 0,
      };
    }

    // Extract data from contract
    const collateralRaw = accountData[0];
    const debtRaw = accountData[1];
    const collateralValueUSD = Number(formatTokenAmount(accountData[2], 18));
    // Some deployments return debt value with 18 decimals (USD 1e18) while others may
    // only store raw USDC debt with 6 decimals. Fallback safely to avoid showing 0.
    const parsedDebt18 = Number(formatTokenAmount(accountData[3], 18));
    const parsedDebt6 = Number(formatTokenAmount(accountData[1], 6));
    const debtValueUSD = parsedDebt18 > 0 ? parsedDebt18 : parsedDebt6;
    const maxBorrowDebtRaw = accountData[4];
    // Health factor is 1e18 fixed-point. If debt is zero it can be extremely large.
    // Cap for display/derived calculations to avoid UI overflow while preserving semantics.
    const rawHealthFactor = Number(formatTokenAmount(accountData[5], 18));
    const healthFactor = Number.isFinite(rawHealthFactor) ? Math.min(rawHealthFactor, 1e6) : 0;

    // Calculate LTV (Loan-to-Value) as percentage
    const ltv = collateralValueUSD > 0 ? (debtValueUSD / collateralValueUSD) * 100 : 0;

    // Calculate max borrowable amount (using contract's collateral factor)
    const collateralFactor = CONTRACT_PARAMS.COLLATERAL_FACTOR;
    const maxBorrowableUSD = collateralValueUSD * collateralFactor;
    const availableToBorrowUSD = Math.max(0, maxBorrowableUSD - debtValueUSD);


    // Calculate liquidation price (simplified - assumes 1:1 collateral to debt ratio)
    const liquidationPrice = debtValueUSD > 0 ? (debtValueUSD / CONTRACT_PARAMS.LIQUIDATION_THRESHOLD) : 0;

    // Determine health status
    const healthStatus = getHealthStatus(healthFactor);
    
    // Determine LTV status
    const ltvStatus = getLTVStatus(ltv);

    // Calculate risk metrics
    const collateralUtilization = maxBorrowableUSD > 0 ? (debtValueUSD / maxBorrowableUSD) * 100 : 0;
    const safetyMargin = Math.max(0, CONTRACT_PARAMS.LIQUIDATION_THRESHOLD * 100 - ltv);

    return {
      collateralValueUSD,
      debtValueUSD,
      healthFactor,
      ltv,
      maxBorrowableUSD,
      availableToBorrowUSD,
      liquidationPrice,
      healthStatus,
      ltvStatus,
      isHealthy: healthFactor > CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.FAIR,
      isLiquidatable: healthFactor <= CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.AT_RISK,
      collateralUtilization,
      safetyMargin,
    };
  }, [accountData, hasAccount]);
}

/**
 * Get health status based on health factor
 */
function getHealthStatus(healthFactor: number): HealthStatus {
  if (healthFactor >= CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.EXCELLENT) return "excellent";
  if (healthFactor >= CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.GOOD) return "good";
  if (healthFactor >= CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.FAIR) return "fair";
  if (healthFactor > CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.AT_RISK) return "at_risk";
  return "liquidatable";
}

/**
 * Get LTV status based on LTV percentage
 */
function getLTVStatus(ltv: number): LTVStatus {
  if (ltv >= CONTRACT_PARAMS.LIQUIDATION_THRESHOLD * 100) return "liquidatable";
  if (ltv >= 75) return "danger";
  if (ltv >= 60) return "warning";
  return "safe";
}

/**
 * Hook for getting contract parameters (collateral factor, liquidation threshold)
 * This can be extended to fetch from contract in the future
 */
export function useContractParameters() {
  return {
    collateralFactor: CONTRACT_PARAMS.COLLATERAL_FACTOR,
    liquidationThreshold: CONTRACT_PARAMS.LIQUIDATION_THRESHOLD,
    healthFactorThresholds: CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS,
  };
}

/**
 * Utility function to format health status for display
 */
export function formatHealthStatus(status: HealthStatus): string {
  switch (status) {
    case "excellent": return "Excellent";
    case "good": return "Good";
    case "fair": return "Fair";
    case "at_risk": return "At Risk";
    case "liquidatable": return "Liquidatable";
    default: return "Unknown";
  }
}

/**
 * Utility function to format LTV status for display
 */
export function formatLTVStatus(status: LTVStatus): string {
  switch (status) {
    case "safe": return "Safe";
    case "warning": return "Warning";
    case "danger": return "Danger";
    case "liquidatable": return "Liquidatable";
    default: return "Unknown";
  }
}

/**
 * Utility function to get color class for health status
 */
export function getHealthStatusColor(status: HealthStatus): string {
  switch (status) {
    case "excellent": return "text-emerald-400";
    case "good": return "text-green-400";
    case "fair": return "text-yellow-400";
    case "at_risk": return "text-orange-400";
    case "liquidatable": return "text-red-400";
    default: return "text-slate-400";
  }
}

/**
 * Utility function to get color class for LTV status
 */
export function getLTVStatusColor(status: LTVStatus): string {
  switch (status) {
    case "safe": return "text-emerald-400";
    case "warning": return "text-yellow-400";
    case "danger": return "text-orange-400";
    case "liquidatable": return "text-red-400";
    default: return "text-slate-400";
  }
}

/**
 * Hook for calculating projected values after a transaction
 * Useful for showing "what if" scenarios in forms
 */
export function useProjectedCalculations(
  additionalCollateral: number = 0,
  additionalDebt: number = 0
): CalculationResults {
  const baseCalculations = useCalculations();
  
  return useMemo(() => {
    const newCollateralValue = baseCalculations.collateralValueUSD + additionalCollateral;
    const newDebtValue = baseCalculations.debtValueUSD + additionalDebt;
    
    // Recalculate with new values
    const newLtv = newCollateralValue > 0 ? (newDebtValue / newCollateralValue) * 100 : 0;
    const newHealthFactor = newDebtValue > 0 ? 
      (newCollateralValue * CONTRACT_PARAMS.LIQUIDATION_THRESHOLD) / newDebtValue : 
      Number.MAX_SAFE_INTEGER;
    
    return {
      ...baseCalculations,
      collateralValueUSD: newCollateralValue,
      debtValueUSD: newDebtValue,
      ltv: newLtv,
      healthFactor: newHealthFactor,
      healthStatus: getHealthStatus(newHealthFactor),
      ltvStatus: getLTVStatus(newLtv),
      isHealthy: newHealthFactor > CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.FAIR,
      isLiquidatable: newHealthFactor <= CONTRACT_PARAMS.HEALTH_FACTOR_THRESHOLDS.AT_RISK,
    };
  }, [baseCalculations, additionalCollateral, additionalDebt]);
}
