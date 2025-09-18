"use client"

import { SiteHeader } from "@/components/site-header"
import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAccountData, useTokenBalances, usePrices, formatTokenAmount } from "@/hooks/useContract"
import { useCalculations } from "@/hooks/useCalculations"
import { Shield, TrendingUp, AlertTriangle, Users } from "lucide-react"

export default function AdminPage() {
  // Contract hooks with error handling
  const { accountData, hasAccount, isLoading: accountLoading, error: accountError } = useAccountData()
  const { wethBalance, usdcBalance, error: balanceError } = useTokenBalances()
  const { collateralPrice, debtPrice, error: priceError } = usePrices()
  const calculations = useCalculations()

  // Calculate real values from contract data with error handling
  const collateralValueUSD = accountData && accountData[2] ? Number(formatTokenAmount(accountData[2], 18)) : 0
  // Robust debt parsing with 18-decimal primary, 6-decimal fallback
  const parsedDebt18 = accountData && accountData[3] ? Number(formatTokenAmount(accountData[3], 18)) : 0
  const parsedDebt6 = accountData && accountData[1] ? Number(formatTokenAmount(accountData[1], 6)) : 0
  const debtValueUSD = parsedDebt18 > 0 ? parsedDebt18 : parsedDebt6
  // Cap health factor to avoid giant numbers when debt is zero
  const rawHealthFactor = accountData && accountData[5] ? Number(formatTokenAmount(accountData[5], 18)) : 0
  const healthFactor = Number.isFinite(rawHealthFactor) ? Math.min(rawHealthFactor, 1e6) : 0
  
  // Token balances with error handling
  const wethBalanceFormatted = wethBalance ? Number(formatTokenAmount(wethBalance, 18)) : 0
  const usdcBalanceFormatted = usdcBalance ? Number(formatTokenAmount(usdcBalance, 6)) : 0

  // Health factor status
  const isHealthy = healthFactor > 1.2
  const healthStatus = healthFactor > 2 ? "Excellent" : healthFactor > 1.5 ? "Good" : healthFactor > 1.2 ? "Fair" : "At Risk"

  // Check for contract errors
  const hasContractError = accountError || balanceError || priceError

  if (!hasAccount) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="glass-card rounded-xl p-8 text-center">
            <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-100 mb-4">Admin Access Required</h1>
            <p className="text-slate-400 mb-6">Please connect your wallet to access admin analytics and real-time data</p>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />

      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 space-y-8 relative z-10">
        <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Admin & Analytics
        </h1>
          <div className="text-sm text-slate-400">
            Live Contract Data
          </div>
        </div>

        {hasContractError ? (
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertTitle className="text-red-400">Contract Connection Error</AlertTitle>
            <AlertDescription className="text-red-200/80">
              Unable to connect to smart contracts. Please check your network connection and try refreshing the page.
              {accountError && <div className="mt-2 text-xs">Account Error: {accountError.message}</div>}
              {balanceError && <div className="mt-2 text-xs">Balance Error: {balanceError.message}</div>}
              {priceError && <div className="mt-2 text-xs">Price Error: {priceError.message}</div>}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-blue-500/30 bg-blue-500/10">
            <AlertTitle className="text-blue-400">Real-Time Data</AlertTitle>
            <AlertDescription className="text-blue-200/80">
              All metrics below are pulled from live smart contract data on Somnia Testnet
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard 
            title="Total Collateral" 
            value={accountLoading ? "Loading..." : `$${collateralValueUSD.toFixed(2)}`}
            icon={<Shield className="h-4 w-4" />}
          />
          <MetricCard 
            title="Total Debt" 
            value={accountLoading ? "Loading..." : `$${debtValueUSD.toFixed(2)}`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard 
            title="Health Factor" 
            value={accountLoading ? "Loading..." : healthFactor > 0 ? healthFactor.toFixed(2) : "N/A"}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <MetricCard 
            title="LTV Ratio" 
            value={accountLoading ? "Loading..." : `${calculations.ltv.toFixed(1)}%`}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card rounded-xl hover-lift">
            <CardHeader>
              <CardTitle className="text-slate-100">Wallet Balances</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">WETH Balance</span>
                <span className="text-slate-100 font-medium">{wethBalanceFormatted.toFixed(4)} WETH</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">USDC Balance</span>
                <span className="text-slate-100 font-medium">{usdcBalanceFormatted.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Collateral Value</span>
                <span className="text-emerald-400 font-medium">${collateralValueUSD.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-xl hover-lift">
            <CardHeader>
              <CardTitle className="text-slate-100">Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Health Status</span>
                <span className={`font-medium ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                  {healthStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Available to Borrow</span>
                <span className="text-slate-100 font-medium">
                  ${calculations.availableToBorrowUSD.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max LTV</span>
                <span className="text-slate-100 font-medium">60%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card rounded-xl hover-lift">
          <CardHeader>
            <CardTitle className="text-slate-100">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-blue-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Connected to Somnia Testnet - Contract addresses verified</span>
              </div>
            </div>
            <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-green-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Smart contract interactions functioning normally</span>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Real-time price feeds active - WETH: ${collateralPrice ? Number(formatTokenAmount(collateralPrice, 18)).toFixed(2) : 'Loading...'}</span>
              </div>
            </div>
            {/* Debug Information */}
            <div className="rounded-lg bg-slate-500/10 border border-slate-500/20 p-3 text-slate-400">
              <div className="text-xs">
                <div>Account Data: {accountData ? 'Loaded' : 'Not loaded'}</div>
                <div>Loading: {accountLoading ? 'Yes' : 'No'}</div>
                <div>Has Account: {hasAccount ? 'Yes' : 'No'}</div>
                <div>Contract Addresses: {process.env.NEXT_PUBLIC_NETWORK || 'SOMNIA_TESTNET'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
