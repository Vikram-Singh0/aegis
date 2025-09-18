"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAccountData, useTokenBalances, useContractActions, formatTokenAmount, formatDebtAmount, isDebtEffectivelyZero, parseTokenAmount } from "@/hooks/useContract"
import { useCalculations } from "@/hooks/useCalculations"
import { toast } from "sonner"

export function RepayForm() {
  const [amount, setAmount] = useState<string>("")
  const [isRepaying, setIsRepaying] = useState(false)

  // Contract hooks
  const { accountData, hasAccount, refreshAccountData } = useAccountData()
  const { usdcBalance, refreshBalances } = useTokenBalances()
  const { repay: repayAction, isPending } = useContractActions()
  const calculations = useCalculations()

  // Get real debt data from contract
  const debtRaw = accountData ? accountData[1] : 0n // debtRaw from getAccountData
  const debtAmount = debtRaw ? Number(formatTokenAmount(debtRaw, 6)) : 0 // USDC has 6 decimals
  const repayAmount = Number(amount || 0)
  const remainingAfterRepay = Math.max(0, debtAmount - repayAmount)
  
  // Check if debt is effectively zero
  const isDebtZero = debtRaw ? isDebtEffectivelyZero(debtRaw, 6) : true
  
  // Available USDC balance
  const availableUsdc = usdcBalance ? Number(formatTokenAmount(usdcBalance, 6)) : 0

  // Health factor after repayment
  const currentHealthFactor = accountData ? Number(formatTokenAmount(accountData[5], 18)) : 0
  const isHealthy = currentHealthFactor > 1.2

  // Handle repay
  const handleRepay = async () => {
    if (!repayAmount || repayAmount <= 0) {
      toast.error("Please enter a valid repay amount")
      return
    }
    
    if (repayAmount > debtAmount) {
      toast.error(`Maximum repayable amount is $${debtAmount.toFixed(2)}`)
      return
    }

    if (repayAmount > availableUsdc) {
      toast.error("Insufficient USDC balance")
      return
    }

    setIsRepaying(true)
    try {
      const amountBigInt = parseTokenAmount(repayAmount.toString(), 6) // USDC has 6 decimals
      await repayAction(amountBigInt)
      setAmount("")
      toast.success("Repayment successful!")
    } catch (error) {
      console.error("Repay error:", error)
    } finally {
      setIsRepaying(false)
    }
  }

  // Auto-fill max repay amount
  const handleMaxRepay = () => {
    setAmount(debtAmount.toString())
  }

  // Auto-fill available balance
  const handleMaxAvailable = () => {
    setAmount(Math.min(debtAmount, availableUsdc).toString())
  }

  if (!hasAccount) {
    return (
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6 text-center">
          <AlertTitle className="text-amber-400 mb-2">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-amber-200/80">
            Please connect your wallet to manage repayments
          </AlertDescription>
        </CardContent>
      </Card>
    )
  }

  if (debtAmount === 0 || isDebtZero) {
    return (
      <Card className="glass-card border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6 text-center">
          <AlertTitle className="text-emerald-400 mb-2">No Active Debt</AlertTitle>
          <AlertDescription className="text-emerald-200/80">
            {isDebtZero && debtAmount > 0 
              ? `Debt effectively settled (${formatDebtAmount(debtRaw, 6)} USDC remaining)`
              : "You do not have any outstanding debt to repay"
            }
          </AlertDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-blue-500/20 bg-slate-800/50 text-slate-100">
      <CardHeader>
        <CardTitle className="text-slate-100">Repay Loan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertTitle className="text-blue-400">Live Contract Data</AlertTitle>
          <AlertDescription className="text-blue-200/80">
            Current Debt: ${formatDebtAmount(debtRaw, 6)} | 
            Health Factor: {currentHealthFactor > 0 ? currentHealthFactor.toFixed(2) : 'N/A'} | 
            Available USDC: ${availableUsdc.toFixed(2)}
          </AlertDescription>
        </Alert>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="repay-amount" className="text-slate-300">
              Repay Amount (USDC)
            </Label>
            <div className="flex gap-2">
            <Input
              id="repay-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
              inputMode="decimal"
                placeholder="0.0"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxRepay}
                className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600"
              >
                Max
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMaxAvailable}
                className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600"
              >
                Available
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Remaining after payment: ${remainingAfterRepay < 0.01 ? remainingAfterRepay.toFixed(6) : remainingAfterRepay.toFixed(2)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-slate-300">Repayment Summary</Label>
            <div className="rounded-lg bg-slate-700/30 border border-slate-600 p-3 text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Debt</span>
                <span className="font-medium text-red-400">${formatDebtAmount(debtRaw, 6)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">After Payment</span>
                <span className="font-medium text-emerald-400">
                  ${remainingAfterRepay < 0.01 ? remainingAfterRepay.toFixed(6) : remainingAfterRepay.toFixed(2)}
                </span>
              </div>
              
              {/* LTV Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Current LTV</span>
                  <span className="text-blue-400">{(Number.isFinite(calculations.ltv) ? calculations.ltv : 0).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-red-500 to-red-400 rounded-full shadow-lg shadow-red-500/25" 
                    style={{ width: `${Math.min(100, Math.max(0, Number.isFinite(calculations.ltv) ? calculations.ltv : 0))}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Health Factor</span>
                <span className={`font-medium ${isHealthy ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentHealthFactor > 0 ? currentHealthFactor.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Credit Score Impact</span>
                <span className="font-medium text-emerald-400">+10 points</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          className="bg-gradient-primary hover:opacity-90 text-white"
          onClick={handleRepay}
          disabled={isPending || isRepaying || !repayAmount || repayAmount > debtAmount || repayAmount > availableUsdc}
        >
          {isPending || isRepaying ? "Processing..." : "Confirm Repayment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
