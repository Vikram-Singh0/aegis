
"use client"
import { SiteHeader } from "@/components/site-header"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoanList } from "@/components/loan-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScoreCard } from "@/components/score-card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, Shield } from "lucide-react"
import { useAccountData, useTokenBalances, usePrices, formatTokenAmount, formatDebtAmount, isDebtEffectivelyZero } from "@/hooks/useContract"

export default function DashboardPage() {
  // Contract hooks
  const { accountData, hasAccount, isLoading: accountLoading } = useAccountData()
  const { wethBalance, usdcBalance } = useTokenBalances()
  const { collateralPrice, debtPrice } = usePrices()

  // Calculate real values from contract data
  const collateralRaw = accountData ? accountData[0] : 0n
  const debtRaw = accountData ? accountData[1] : 0n
  const collateralValueUSD = accountData ? Number(formatTokenAmount(accountData[2], 18)) : 0
  const debtValueUSD = accountData ? Number(formatTokenAmount(accountData[3], 18)) : 0
  // Some deployments may return debt value with 6 decimals instead of 18. Fallback safely.
  const debtValueUSDSafe = debtValueUSD > 0
    ? debtValueUSD
    : (accountData ? Number(formatTokenAmount(accountData[1], 6)) : 0)
  const healthFactor = accountData ? Number(formatTokenAmount(accountData[5], 18)) : 0
  
  // Check if debt is effectively zero
  const isDebtZero = debtRaw ? isDebtEffectivelyZero(debtRaw, 6) : true
  
  // Token balances
  const wethBalanceFormatted = wethBalance ? Number(formatTokenAmount(wethBalance, 18)) : 0
  const usdcBalanceFormatted = usdcBalance ? Number(formatTokenAmount(usdcBalance, 6)) : 0

  // Health factor status
  const isHealthy = healthFactor > 1.2
  const healthStatus = healthFactor > 2 ? "Excellent" : healthFactor > 1.5 ? "Good" : healthFactor > 1.2 ? "Fair" : "At Risk"

  if (!hasAccount) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="glass-card rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">Connect Your Wallet</h1>
            <p className="text-slate-400 mb-6">Please connect your wallet to view your dashboard</p>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <SiteHeader />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />

      <section className="relative mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Collateral</p>
                <p className="text-2xl font-bold money-positive">
                  {accountLoading ? "Loading..." : `$${collateralValueUSD.toFixed(2)}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {wethBalanceFormatted.toFixed(4)} WETH in wallet
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Borrowed</p>
                <p className="text-2xl font-bold money-negative">
                  {accountLoading ? "Loading..." : isDebtZero ? "Settled" : `$${formatDebtAmount(debtRaw, 6)}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {usdcBalanceFormatted.toFixed(2)} USDC available
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Health Factor</p>
                <p className={`text-2xl font-bold ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                  {accountLoading ? "Loading..." : healthFactor > 0 ? healthFactor.toFixed(2) : "N/A"}
                </p>
                <p className={`text-xs mt-1 ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                  {healthStatus}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Available to Borrow</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {accountLoading ? "Loading..." : `$${(collateralValueUSD * 0.6 - debtValueUSD).toFixed(2)}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">Based on 60% LTV</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Credit Score Card */}
          <div className="lg:col-span-1">
            <ScoreCard score={680} />
          </div>

          {/* Health Factor Breakdown */}
          <div className="glass-card rounded-xl p-6 hover-lift">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg text-slate-100">Portfolio Health</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Loan-to-Value (LTV)</span>
                  <span className="text-emerald-400">
                    {accountLoading ? "Loading..." : (() => {
                      const raw = collateralValueUSD > 0 ? (debtValueUSDSafe / collateralValueUSD) * 100 : 0
                      const safe = Number.isFinite(raw) && !Number.isNaN(raw) ? raw : 0
                      return `${safe.toFixed(1)}%`
                    })()}
                  </span>
                </div>
                <div className="h-3 bg-slate-700/50 rounded-full">
                  <div 
                    className="h-3 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-lg shadow-red-500/25" 
                    style={{ 
                      width: `${(() => { const raw = collateralValueUSD > 0 ? (debtValueUSDSafe / collateralValueUSD) * 100 : 0; const safe = Number.isFinite(raw) && !Number.isNaN(raw) ? raw : 0; return Math.min(100, Math.max(0, safe)); })()}%` 
                    }} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Liquidation Threshold</span>
                  <span className="text-slate-300">85%</span>
                </div>
                <div className="h-3 bg-slate-700/50 rounded-full">
                  <div className="h-3 w-4/5 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg shadow-red-600/25" />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Badge className={isHealthy ? "health-excellent" : "health-warning"}>
                  {healthStatus}
                </Badge>
                <p className="text-xs text-slate-500">
                  {isHealthy 
                    ? "Your position is well-collateralized and safe from liquidation"
                    : "Monitor your health factor closely to avoid liquidation risk"
                  }
                </p>
              </div>
            </CardContent>
          </div>

          {/* Notifications */}
          <div className="glass-card rounded-xl p-6 hover-lift">
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-slate-100">Alerts</CardTitle>
              <Link
                href="/notifications"
                className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Manage
              </Link>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-400 font-medium">Payment Due Soon</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Repayment due in 5 days for LN-1001. On-time payment boosts your score.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-medium">Collateral Increased</p>
                    <p className="text-slate-400 text-xs mt-1">
                      ETH price up 5.2% - your collateral value increased by $625
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-100">Active Positions</h2>
          <div className="flex gap-3">
            <Link href="/borrow">
              <Button className="bg-gradient-primary hover:opacity-90 text-white font-medium px-6">New Loan</Button>
            </Link>
            <Link href="/repay">
              <Button variant="outline" className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700">
                Repay
              </Button>
            </Link>
          </div>
        </div>

        <LoanList />
      </section>
    </main>
  )
}
