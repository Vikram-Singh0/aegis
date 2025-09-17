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
  const currentDebt = accountData ? Number(formatTokenAmount(accountData[1], usdcDecimals)) : 0 // debtRaw
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
      <Card className="border-neutral-200 bg-white text-black">
        <CardHeader>
          <CardTitle>Withdraw Collateral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-neutral-300 bg-white">
            <AlertTitle>Connect Wallet</AlertTitle>
            <AlertDescription>
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
    <Card className="border-neutral-200 bg-white text-black">
      <CardHeader>
        <CardTitle>Withdraw Collateral</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-neutral-300 bg-white">
          <AlertTitle>Account Status</AlertTitle>
          <AlertDescription>
            Current Collateral: {formatTokenAmount(BigInt(Math.floor(currentCollateral * 1e18)), 18)} WETH | 
            Current Debt: ${currentDebt.toLocaleString()} | 
            Health Factor: {healthFactor > 0 ? healthFactor.toFixed(2) : "N/A"}
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Withdraw Amount (WETH)</Label>
            <Input
              id="withdraw-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-neutral-300"
              inputMode="decimal"
              disabled={isWithdrawing}
            />
            <p className="text-xs text-neutral-600">
              Remaining after withdrawal: {formatTokenAmount(BigInt(Math.floor(after * 1e18)), 18)} WETH | 
              Max: {formatTokenAmount(BigInt(Math.floor(currentCollateral * 1e18)), 18)} WETH
            </p>
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <div className="rounded-md border border-neutral-300 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Current collateral</span>
                <span className="font-medium">{formatTokenAmount(BigInt(Math.floor(currentCollateral * 1e18)), 18)} WETH</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>After withdrawal</span>
                <span className="font-medium">{formatTokenAmount(BigInt(Math.floor(after * 1e18)), 18)} WETH</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Health factor impact</span>
                <span className="font-medium">
                  {after < currentCollateral * 0.5 ? "Significant" : "Moderate"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          className="bg-black text-white hover:bg-neutral-900"
          onClick={handleWithdraw}
          disabled={isWithdrawing || !amount || Number(amount) <= 0 || Number(amount) > currentCollateral}
        >
          {isWithdrawing ? "Withdrawing..." : "Confirm Withdrawal"}
        </Button>
      </CardFooter>
    </Card>
  )
}


