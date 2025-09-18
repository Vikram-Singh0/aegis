"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAccountData, useContractActions, parseTokenAmount, formatTokenAmount, useUsdcDecimals } from "@/hooks/useContract"
import WalletConnection from "@/app/walletConnection"

export function WithdrawForm() {
  const [amount, setAmount] = useState<string>("1.0")
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Contract hooks
  const { accountData, hasAccount } = useAccountData()
  const { withdrawCollateral, isPending } = useContractActions()

  // Get real collateral amount from contract
  const usdcDecimals = useUsdcDecimals() || 6
  const currentCollateral = accountData ? Number(formatTokenAmount(accountData[0], 18)) : 0 // collateralRaw
  const currentDebt = accountData ? Number(formatTokenAmount(accountData[3], 18)) : 0 // debtValue1e18 is already scaled
  const healthFactor = accountData ? Number(formatTokenAmount(accountData[5], 18)) : 0 // healthFactor1e18
  
  const after = Math.max(0, currentCollateral - Number(amount || 0))

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!hasAccount) return
    
    setIsWithdrawing(true)
    try {
      const withdrawAmount = parseTokenAmount(amount, 18)
      await withdrawCollateral(withdrawAmount)
    } catch (error) {
      console.error("Withdraw failed:", error)
    } finally {
      setIsWithdrawing(false)
    }
  }

  if (!hasAccount) {
    return (
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-amber-400">Withdraw Collateral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-amber-500/30 bg-amber-500/10">
            <AlertTitle className="text-amber-400">Connect Wallet</AlertTitle>
            <AlertDescription className="text-amber-200/80">
              Please connect your wallet to manage your collateral withdrawals.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <WalletConnection/>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-blue-500/20 bg-slate-800/50 text-slate-100">
      <CardHeader>
        <CardTitle className="text-slate-100">Withdraw Collateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertTitle className="text-blue-400">Account Status</AlertTitle>
          <AlertDescription className="text-blue-200/80">
            Current Collateral: {formatTokenAmount(BigInt(Math.floor(currentCollateral * 1e18)), 18)} WETH | 
            Current Debt: ${currentDebt.toLocaleString()} | 
            Health Factor: {healthFactor > 0 ? healthFactor.toFixed(2) : "N/A"}
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount" className="text-slate-300">Withdraw Amount (WETH)</Label>
            <Input
              id="withdraw-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
              inputMode="decimal"
              disabled={isWithdrawing}
            />
            <p className="text-xs text-slate-400">
              Remaining after withdrawal: {formatTokenAmount(BigInt(Math.floor(after * 1e18)), 18)} WETH | 
              Max: {formatTokenAmount(BigInt(Math.floor(currentCollateral * 1e18)), 18)} WETH
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300">Summary</Label>
            <div className="rounded-lg bg-slate-700/30 border border-slate-600 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current collateral</span>
                <span className="font-medium text-slate-300">{formatTokenAmount(BigInt(Math.floor(currentCollateral * 1e18)), 18)} WETH</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-400">After withdrawal</span>
                <span className="font-medium text-slate-300">{formatTokenAmount(BigInt(Math.floor(after * 1e18)), 18)} WETH</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-400">Health factor impact</span>
                <span className="font-medium text-slate-300">
                  {after < currentCollateral * 0.5 ? "Significant" : "Moderate"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          className="bg-gradient-primary hover:opacity-90 text-white"
          onClick={handleWithdraw}
          disabled={isWithdrawing || !amount || Number(amount) <= 0 || Number(amount) > currentCollateral}
        >
          {isWithdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
        </Button>
      </CardFooter>
    </Card>
  )
}


