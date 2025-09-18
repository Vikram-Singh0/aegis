import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { useAccountData, usePrices, formatTokenAmount, formatDebtAmount, isDebtEffectivelyZero } from "@/hooks/useContract"
import { useCalculations, formatHealthStatus, getHealthStatusColor, getLTVStatusColor } from "@/hooks/useCalculations"
import Link from "next/link"

export function LoanList({ showActions = true }: { showActions?: boolean }) {
  const { accountData, hasAccount, isLoading } = useAccountData()
  const { collateralPrice } = usePrices()
  
  // Use centralized calculations
  const calculations = useCalculations()

  // Get real data from contract
  const collateralRaw = accountData ? accountData[0] : 0n
  const debtRaw = accountData ? accountData[1] : 0n
  
  // Check if debt is effectively zero
  const isDebtZero = debtRaw ? isDebtEffectivelyZero(debtRaw, 6) : true
  
  // Determine status based on health factor (for backward compatibility)
  const getStatus = (healthFactor: number) => {
    if (healthFactor > 2) return "ok" as const
    if (healthFactor > 1.5) return "warning" as const
    return "risk" as const
  }

  // Format collateral amount
  const collateralAmount = collateralRaw ? Number(formatTokenAmount(collateralRaw, 18)) : 0

  if (!hasAccount) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-slate-400">Please connect your wallet to view your positions</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-slate-400">Loading positions...</p>
      </div>
    )
  }

  // If no positions, show empty state
  if (collateralRaw === 0n && debtRaw === 0n) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-slate-400 mb-4">No active positions</p>
        <Link href="/borrow">
          <Button className="bg-gradient-primary hover:opacity-90 text-white">
            Start Borrowing
          </Button>
        </Link>
      </div>
    )
  }

  const safeLtv = Number.isFinite(calculations.ltv) ? calculations.ltv : 0
  const position = {
    id: "POS-001",
    asset: "WETH",
    collateral: `${collateralAmount.toFixed(4)} WETH`,
    collateralUSD: calculations.collateralValueUSD,
    borrowed: calculations.debtValueUSD,
    ltv: safeLtv,
    apr: "0.0%", // No interest for Day 1
    status: getStatus(calculations.healthFactor),
  }

  return (
    <div className="grid gap-4">
      <div className="glass-card rounded-xl p-6 hover-lift">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg text-slate-100">{position.id}</CardTitle>
          <StatusBadge status={position.status} />
        </CardHeader>
        <CardContent className="p-0 grid gap-4 md:grid-cols-4">
          <div className="text-sm">
            <div className="text-slate-400 mb-1">Collateral</div>
            <div className="font-semibold text-slate-100">{position.collateral}</div>
            <div className="text-xs text-emerald-400">${position.collateralUSD.toFixed(2)}</div>
          </div>
          <div className="text-sm">
            <div className="text-slate-400 mb-1">Borrowed</div>
            <div className="font-semibold money-negative">
              {isDebtZero ? "Settled" : `$${formatDebtAmount(debtRaw, 6)}`}
            </div>
          </div>
          <div className="text-sm">
            <div className="text-slate-400 mb-1">LTV</div>
            <div className="font-semibold text-slate-100">{position.ltv.toFixed(1)}%</div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-700/50">
              <div
                className={`h-1.5 rounded-full ${
                  position.ltv > 80 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                  position.ltv > 60 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                  'bg-gradient-to-r from-emerald-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, position.ltv)}%` }}
              />
            </div>
          </div>
          <div className="text-sm">
            <div className="text-slate-400 mb-1">APR</div>
            <div className="font-semibold text-slate-100">{position.apr}</div>
          </div>
          {showActions && (
            <div className="md:col-span-4 flex gap-3 pt-4">
              <Link href="/repay">
                <Button className="bg-gradient-primary hover:opacity-90 text-white font-medium">
                  Repay
                </Button>
              </Link>
              <Link href="/borrow">
                <Button
                  variant="outline"
                  className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700"
                >
                  Add Collateral
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700"
                disabled
              >
                View Details
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  )
}
