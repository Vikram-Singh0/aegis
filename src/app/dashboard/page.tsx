"use client"
import { SiteHeader } from "@/components/site-header"
import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoanList } from "@/components/loan-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScoreCard } from "@/components/score-card"
import { useAccountData, useTokenBalances, usePrices, formatTokenAmount, formatUSD, useUsdcDecimals } from "@/hooks/useContract"
import { DebugPanel } from "@/components/debug-panel"

import WalletConnection from "@/app/walletConnection"

export default function DashboardPage() {
  // Contract hooks
  const { accountData, hasAccount, isLoading } = useAccountData()
  const { wethBalance, usdcBalance } = useTokenBalances()
  const { collateralPrice } = usePrices()
  const usdcDecimals = useUsdcDecimals() || 6

  // Calculate real values from contract data
  const collateralAmount = accountData ? Number(formatTokenAmount(accountData[0], 18)) : 0 // collateralRaw
  const debtAmount = accountData ? Number(formatTokenAmount(accountData[1], usdcDecimals)) : 0 // debtRaw
  const collateralValueUSD = accountData ? Number(formatTokenAmount(accountData[2], 18)) : 0 // collateralValue1e18
  const healthFactor = accountData ? Number(formatTokenAmount(accountData[5], 18)) : 0 // healthFactor1e18
  
  const walletAssetsUSD = Number(formatTokenAmount(wethBalance, 18)) * (Number(formatTokenAmount(collateralPrice, 18)) || 3000)
  const ltv = collateralValueUSD > 0 ? (debtAmount / collateralValueUSD) * 100 : 0

  if (!hasAccount) {
    return (
      <main className="min-h-screen bg-white text-black">
        <SiteHeader />
        <section className="mx-auto max-w-6xl px-4 py-8 space-y-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <h1 className="text-2xl font-semibold">Connect Your Wallet</h1>
            <p className="text-neutral-600">Connect your wallet to view your lending dashboard</p>
            {/* <ConnectButton /> */}
            <WalletConnection />
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard 
            title="Wallet Assets (USD)" 
            value={isLoading ? "Loading..." : `$${walletAssetsUSD.toLocaleString()}`} 
            subtext="Auto-verified from wallet" 
          />
          <MetricCard 
            title="Total Borrowed" 
            value={isLoading ? "Loading..." : `$${debtAmount.toLocaleString()}`} 
            subtext="Current outstanding debt" 
          />
          <MetricCard 
            title="Current LTV" 
            value={isLoading ? "Loading..." : `${ltv.toFixed(1)}%`} 
            subtext="Keep below 80% for safety" 
          />
          <MetricCard 
            title="Health Factor" 
            value={isLoading ? "Loading..." : healthFactor > 0 ? healthFactor.toFixed(2) : "N/A"} 
            subtext="Above 1.0 is safe" 
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ScoreCard score={680} />
          <Card className="border-neutral-200 bg-white text-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Notifications</CardTitle>
              <Link href="/notifications" className="text-sm underline underline-offset-4">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-neutral-300 p-3 text-sm">
                Collateral USD for LN-1002 approaching threshold. Current LTV: 46%.
              </div>
              <div className="rounded-md border border-neutral-300 p-3 text-sm">
                Repayment due in 5 days for LN-1001. On-time payment boosts your score.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Loans</h2>
          <div className="flex gap-2">
            <Link href="/borrow">
              <Button className="bg-black text-white hover:bg-neutral-900">New Loan</Button>
            </Link>
            <Link href="/repay">
              <Button variant="outline" className="border-neutral-300 bg-white text-black">
                Repay
              </Button>
            </Link>
            <Link href="/withdraw">
              <Button variant="outline" className="border-neutral-300 bg-white text-black">
                Withdraw
              </Button>
            </Link>
          </div>
        </div>
        <LoanList />
      </section>
      <DebugPanel />
    </main>
  )
}
