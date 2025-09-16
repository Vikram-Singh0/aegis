"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import Link from "next/link"
import { useAccountData, usePrices, formatTokenAmount, useUsdcDecimals } from "@/hooks/useContract"

export function LoanList({ showActions = true }: { showActions?: boolean }) {
  const { accountData, hasAccount, isLoading } = useAccountData()
  const { collateralPrice } = usePrices()
  const usdcDecimals = useUsdcDecimals() || 6

  // Derive values from on-chain data
  const collateralRaw = accountData ? accountData[0] : 0n
  const debtRaw = accountData ? accountData[1] : 0n
  const collateralValue1e18 = accountData ? accountData[2] : 0n
  const healthFactor1e18 = accountData ? accountData[5] : 0n

  const collateralWETH = formatTokenAmount(collateralRaw, 18)
  const debtUSDC = formatTokenAmount(debtRaw, usdcDecimals)
  const collateralUSD = formatTokenAmount(collateralValue1e18, 18)
  const healthFactor = healthFactor1e18 > 0n ? Number(formatTokenAmount(healthFactor1e18, 18)) : 0
  const ltvPct = Number(collateralUSD) > 0 ? Math.min(100, (Number(debtUSDC) / Number(collateralUSD)) * 100) : 0

  const status: "ok" | "warning" | "danger" = ltvPct < 50 ? "ok" : ltvPct < 80 ? "warning" : "danger"

  return (
    <div className="grid gap-3">
      <Card className="border-neutral-200 bg-white text-black">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Your Position</CardTitle>
          <StatusBadge status={status} />
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          <div className="text-sm">
            <div className="text-neutral-600">Collateral</div>
            <div className="font-medium">{collateralWETH} WETH</div>
            <div className="text-xs text-neutral-600">${Number(collateralUSD || '0').toLocaleString()}</div>
          </div>
          <div className="text-sm">
            <div className="text-neutral-600">Borrowed</div>
            <div className="font-medium">${Number(debtUSDC || '0').toLocaleString()}</div>
          </div>
          <div className="text-sm">
            <div className="text-neutral-600">LTV</div>
            <div className="font-medium">{ltvPct.toFixed(1)}%</div>
          </div>
          <div className="text-sm">
            <div className="text-neutral-600">Health Factor</div>
            <div className="font-medium">{healthFactor > 0 ? healthFactor.toFixed(2) : "N/A"}</div>
          </div>
          {showActions && (
            <div className="md:col-span-4 flex gap-2 pt-2">
              <Link href="/repay">
                <Button size="sm" className="bg-black text-white hover:bg-neutral-900">
                  Repay
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="border-neutral-300 bg-white text-black">
                Add Collateral
              </Button>
              <Button size="sm" variant="outline" className="border-neutral-300 bg-white text-black">
                View
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
