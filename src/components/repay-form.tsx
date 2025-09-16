"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAccountData, useTokenBalances, useContractActions, parseTokenAmount, formatTokenAmount, useUsdcDecimals } from "@/hooks/useContract"
import WalletConnection from "@/app/walletConnection"

export function RepayForm() {
  const [amount, setAmount] = useState<string>("250")
  const [isRepaying, setIsRepaying] = useState(false)

  // Contract hooks
  const { accountData, hasAccount } = useAccountData()
  const { usdcBalance } = useTokenBalances()
  const { repay, isPending } = useContractActions()
  const usdcDecimals = useUsdcDecimals() || 6

  // Get real debt amount from contract
  const currentDebt = accountData ? Number(formatTokenAmount(accountData[1], usdcDecimals)) : 0 // debtRaw
  const after = Math.max(0, currentDebt - Number(amount || 0))

  // Handle repay
  const handleRepay = async () => {
    if (!hasAccount) return
    
    setIsRepaying(true)
    try {
      const repayAmount = parseTokenAmount(amount, usdcDecimals)
      await repay(repayAmount)
    } catch (error) {
      console.error("Repay failed:", error)
    } finally {
      setIsRepaying(false)
    }
  }

  if (!hasAccount) {
    return (
      <Card className="border-neutral-200 bg-white text-black">
        <CardHeader>
          <CardTitle>Repay Loan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-neutral-300 bg-white">
            <AlertTitle>Connect Wallet</AlertTitle>
            <AlertDescription>
              Please connect your wallet to manage your loan repayments.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
           <WalletConnection />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-neutral-200 bg-white text-black">
      <CardHeader>
        <CardTitle>Repay Loan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-neutral-300 bg-white">
          <AlertTitle>Account Status</AlertTitle>
          <AlertDescription>
            Current Debt: ${currentDebt.toLocaleString()} | 
            USDC Balance: {formatTokenAmount(usdcBalance, 6)}
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="repay-amount">Repay Amount (USDC)</Label>
            <Input
              id="repay-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-neutral-300"
              inputMode="decimal"
              disabled={isRepaying}
            />
            <p className="text-xs text-neutral-600">
              Remaining after payment: ${after.toLocaleString()} | 
              Max: ${currentDebt.toLocaleString()}
            </p>
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <div className="rounded-md border border-neutral-300 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Current debt</span>
                <span className="font-medium">${currentDebt.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>After payment</span>
                <span className="font-medium">${after.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Liquidation risk</span>
                <span className="font-medium">{after < currentDebt * 0.5 ? "Reduced" : "Monitor"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          className="bg-black text-white hover:bg-neutral-900"
          onClick={handleRepay}
          disabled={isRepaying || !amount || Number(amount) <= 0 || Number(amount) > currentDebt}
        >
          {isRepaying ? "Repaying..." : "Confirm Repayment"}
        </Button>
      </CardFooter>
    </Card>
  )
}
