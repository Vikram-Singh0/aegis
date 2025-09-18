"use client"

import { SiteHeader } from "@/components/site-header"
import { LoanForm } from "@/components/loan-form"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, TrendingUp, Bell, Info, Wallet } from "lucide-react"
import { useActiveAccount } from "thirdweb/react"
import { useAccountData, formatTokenAmount } from "@/hooks/useContract"
import { useCalculations } from "@/hooks/useCalculations"

export default function BorrowPage() {
  const account = useActiveAccount()
  const hasAccount = !!account?.address
  
  // Get real data for LTV bars
  const { accountData } = useAccountData()
  const calculations = useCalculations()
  
  // Calculate real values
  const collateralValueUSD = accountData ? Number(formatTokenAmount(accountData[2], 18)) : 0
  const debtValueUSD = accountData ? Number(formatTokenAmount(accountData[3], 18)) : 0
  const healthFactor = accountData ? Number(formatTokenAmount(accountData[5], 18)) : 0
  const ltv = calculations.ltv
  const ltvDisplay = Number.isFinite(ltv) ? ltv : 0
  const availableToBorrow = calculations.availableToBorrowUSD
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />

      <SiteHeader />

      <section className="mx-auto max-w-6xl px-4 py-8 relative z-10">
        <div className="mb-8">
          <Badge variant="outline" className="mb-4 border-blue-500/30 bg-blue-500/10 text-blue-400">
            <TrendingUp className="w-3 h-3 mr-1" />
            Borrow Assets
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Borrow Stablecoins
          </h1>
          <p className="text-xl text-slate-400">
            Use your crypto as collateral to borrow USDC with competitive rates and flexible terms
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LoanForm />
          </div>

          <div className="space-y-6">
            {hasAccount ? (
              <>
                <div className="glass-card rounded-xl p-6 hover-lift">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      Risk Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-sm font-medium text-emerald-400">Health Factor</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-400">
                        {healthFactor > 0 ? healthFactor.toFixed(2) : 'N/A'}
                      </div>
                      <div className="text-xs text-emerald-300/80">
                        {healthFactor > 2 ? 'Excellent' : healthFactor > 1.5 ? 'Good' : healthFactor > 1.2 ? 'Fair' : 'At Risk'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Liquidation Threshold</span>
                          <span className="text-red-400">85%</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full">
                          <div className="h-2 w-4/5 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-lg shadow-red-500/25" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Current LTV</span>
                          <span className="text-blue-400">{ltv.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-slate-700/50 rounded-full">
                          <div 
                            className="h-2 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-lg shadow-red-500/25" 
                            style={{ width: `${Math.min(100, ltv)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-slate-400">Available to Borrow</span>
                        <span className="text-emerald-400 font-semibold">${availableToBorrow.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="glass-card rounded-xl p-6 hover-lift">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-100">
                      <Bell className="w-5 h-5 text-blue-400" />
                      Smart Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-sm text-slate-400 mb-4">
                      Set custom notification thresholds to get early warnings before liquidation risk increases.
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Personal Alert</span>
                          <span className="text-amber-400">75% LTV</span>
                        </div>
                        <div className="h-1.5 bg-slate-700/50 rounded-full">
                          <div className="h-1.5 w-3/4 bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Protocol Liquidation</span>
                          <span className="text-red-400">85% LTV</span>
                        </div>
                        <div className="h-1.5 bg-slate-700/50 rounded-full">
                          <div className="h-1.5 w-4/5 bg-gradient-to-r from-red-600 to-red-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <Alert className="glass-card border-amber-500/30 bg-amber-500/5 rounded-xl">
                  <Info className="h-4 w-4 text-amber-400" />
                  <AlertDescription className="text-amber-200/80">
                    <strong>Partial Liquidation:</strong> Only the minimum required amount will be liquidated to restore
                    your health factor, protecting the majority of your collateral.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <div className="glass-card rounded-xl p-6 border-amber-500/30 bg-amber-500/5">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-amber-400">
                    <Wallet className="w-5 h-5" />
                    Connect Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AlertDescription className="text-amber-200/80">
                    Connect your wallet to view your health factor, risk metrics, and set up smart alerts for your borrowing position.
                  </AlertDescription>
                </CardContent>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
