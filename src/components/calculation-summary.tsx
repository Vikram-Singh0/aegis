"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccountData, formatDebtAmount, isDebtEffectivelyZero } from "@/hooks/useContract";
import { useCalculations, formatHealthStatus, formatLTVStatus, getHealthStatusColor, getLTVStatusColor } from "@/hooks/useCalculations";

/**
 * Component to demonstrate consistent LTV and health factor calculations
 * This shows how all calculations are now centralized and consistent
 */
export function CalculationSummary() {
  const calculations = useCalculations();
  const { accountData } = useAccountData();
  
  // Get raw debt data for better formatting
  const debtRaw = accountData ? accountData[1] : 0n;
  const isDebtZero = debtRaw ? isDebtEffectivelyZero(debtRaw, 6) : true;

  return (
    <Card className="glass-card border-blue-500/30 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="text-blue-400">Centralized Calculations</CardTitle>
        <p className="text-sm text-slate-400">
          All LTV and health factor calculations are now consistent across the entire UI
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Factor Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Health Factor</h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current Value:</span>
            <span className={`font-bold ${getHealthStatusColor(calculations.healthStatus)}`}>
              {calculations.healthFactor.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <Badge className={`${getHealthStatusColor(calculations.healthStatus)} bg-opacity-20`}>
              {formatHealthStatus(calculations.healthStatus)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Is Healthy:</span>
            <span className={calculations.isHealthy ? "text-emerald-400" : "text-red-400"}>
              {calculations.isHealthy ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* LTV Section */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Loan-to-Value (LTV)</h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Current LTV:</span>
            <span className={`font-bold ${getLTVStatusColor(calculations.ltvStatus)}`}>
              {calculations.ltv.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <Badge className={`${getLTVStatusColor(calculations.ltvStatus)} bg-opacity-20`}>
              {formatLTVStatus(calculations.ltvStatus)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Max Borrowable:</span>
            <span className="text-emerald-400">
              ${calculations.maxBorrowableUSD.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Available to Borrow:</span>
            <span className="text-emerald-400">
              ${calculations.availableToBorrowUSD.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Risk Metrics</h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Collateral Utilization:</span>
            <span className="text-slate-300">
              {calculations.collateralUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Safety Margin:</span>
            <span className="text-emerald-400">
              {calculations.safetyMargin.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Liquidatable:</span>
            <span className={calculations.isLiquidatable ? "text-red-400" : "text-emerald-400"}>
              {calculations.isLiquidatable ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Contract Values */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Contract Values</h4>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Collateral Value:</span>
            <span className="text-blue-400">
              ${calculations.collateralValueUSD.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Debt Value:</span>
            <span className="text-red-400">
              {isDebtZero ? "Settled" : `$${formatDebtAmount(debtRaw, 6)}`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
