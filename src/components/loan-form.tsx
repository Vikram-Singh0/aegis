"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAccountData, useTokenBalances, usePrices, useContractActions, formatTokenAmount, parseTokenAmount } from "@/hooks/useContract"
import { useCalculations, useProjectedCalculations, useContractParameters, formatHealthStatus, getHealthStatusColor, getLTVStatusColor } from "@/hooks/useCalculations"
import { toast } from "sonner"

export function LoanForm() {
  const [asset, setAsset] = useState<string>("WETH")
  const [collateral, setCollateral] = useState<string>("")
  const [borrow, setBorrow] = useState<string>("")
  const [reviewing, setReviewing] = useState(false)
  const [lastAction, setLastAction] = useState<string>("")

  // Contract hooks
  const { accountData, hasAccount, refreshAccountData } = useAccountData()
  const { wethBalance, usdcBalance, refreshBalances } = useTokenBalances()
  const { collateralPrice, debtPrice } = usePrices()
  const { depositCollateral, borrow: borrowAction, isPending, isDepositing, isBorrowing } = useContractActions()
  
  // Use centralized calculations
  const calculations = useCalculations()

  // Calculate real values from contract data
  const collateralPriceUSD = collateralPrice ? Number(formatTokenAmount(collateralPrice, 18)) : 3000
  const collateralAmount = Number(collateral || 0)
  const collateralUSD = collateralAmount * collateralPriceUSD
  const borrowAmount = Number(borrow || 0)
  
  // Calculate projected values for the form
  const projectedCalculations = useProjectedCalculations(collateralUSD, borrowAmount)
  
  // Get contract parameters
  const { collateralFactor, liquidationThreshold } = useContractParameters()

  // Available balance
  const availableWeth = wethBalance ? Number(formatTokenAmount(wethBalance, 18)) : 0
  const availableUsdc = usdcBalance ? Number(formatTokenAmount(usdcBalance, 6)) : 0

  // Handle deposit collateral
  const handleDepositCollateral = async () => {
    if (!collateralAmount || collateralAmount <= 0) {
      toast.error("Please enter a valid collateral amount")
      return
    }
    
    if (collateralAmount > availableWeth) {
      toast.error("Insufficient WETH balance")
      return
    }

    try {
      const amount = parseTokenAmount(collateralAmount.toString(), 18)
      await depositCollateral(amount)
      setLastAction("deposit")
      // Auto-clear form after 3 seconds
      setTimeout(() => {
        clearForm()
        setLastAction("")
      }, 3000)
    } catch (error) {
      console.error("Deposit error:", error)
    }
  }

  // Handle borrow
  const handleBorrow = async () => {
    if (!borrowAmount || borrowAmount <= 0) {
      toast.error("Please enter a valid borrow amount")
      return
    }
    
    // Calculate available to borrow based on current position
    const existingCollateralValue = accountData ? Number(formatTokenAmount(accountData[2], 18)) : 0
    const existingDebtValue = accountData ? Number(formatTokenAmount(accountData[3], 18)) : 0
    const totalCollateralValue = existingCollateralValue + (collateralAmount > 0 ? collateralUSD : 0)
    const totalDebtValue = existingDebtValue + borrowAmount
    const maxBorrowableFromTotal = totalCollateralValue * collateralFactor
    const availableToBorrow = Math.max(0, maxBorrowableFromTotal - existingDebtValue)
    
    // Check if borrow amount exceeds available borrowing capacity
    if (borrowAmount > availableToBorrow) {
      toast.error(`Insufficient collateral. Available to borrow: $${availableToBorrow.toFixed(2)}`)
      return
    }
    
    // Check if the new total debt would exceed liquidation threshold
    const newLTV = totalCollateralValue > 0 ? (totalDebtValue / totalCollateralValue) * 100 : 0
    const liquidationThresholdPercent = liquidationThreshold * 100
    if (newLTV > liquidationThresholdPercent) {
      toast.error(`Borrowing this amount would exceed liquidation threshold. Max LTV: ${liquidationThresholdPercent}%`)
      return
    }

    try {
      const amount = parseTokenAmount(borrowAmount.toString(), 6) // USDC has 6 decimals
      await borrowAction(amount)
      setLastAction("borrow")
      // Auto-clear form after 3 seconds
      setTimeout(() => {
        clearForm()
        setLastAction("")
      }, 3000)
    } catch (error) {
      console.error("Borrow error:", error)
    }
  }

  // Auto-calculate max borrowable when collateral changes
  useEffect(() => {
    if (collateralAmount > 0) {
      const maxBorrow = collateralUSD * collateralFactor
      setBorrow(maxBorrow.toFixed(2))
    }
  }, [collateralAmount, collateralUSD, collateralFactor])

  // Clear form function
  const clearForm = () => {
    setCollateral("")
    setBorrow("")
  }

  if (!hasAccount) {
    return (
      <Card className="glass-card border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6 text-center">
          <AlertTitle className="text-amber-400 mb-2">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-amber-200/80">
            Please connect your wallet to start borrowing
          </AlertDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-blue-500/20 bg-slate-800/50 text-slate-100">
      <CardHeader>
        <CardTitle className="text-slate-100">Borrow Stablecoins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-blue-500/30 bg-blue-500/10">
          <AlertTitle className="text-blue-400">Live Contract Data</AlertTitle>
          <AlertDescription className="text-blue-200/80">
            WETH Price: ${collateralPriceUSD.toLocaleString()} | 
            Health Factor: {calculations.healthFactor > 0 ? calculations.healthFactor.toFixed(2) : 'N/A'} | 
            Max LTV: {(collateralFactor * 100).toFixed(0)}%
          </AlertDescription>
        </Alert>

        {lastAction && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10">
            <AlertTitle className="text-emerald-400">Success!</AlertTitle>
            <AlertDescription className="text-emerald-200/80">
              {lastAction === "deposit" 
                ? "Collateral deposited successfully! Form will clear in 3 seconds." 
                : "USDC borrowed successfully! Form will clear in 3 seconds."
              }
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="asset" className="text-slate-300">Collateral Asset</Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger id="asset" className="bg-slate-700/50 border-slate-600 text-slate-100">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="WETH">WETH</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              Live price: ${collateralPriceUSD.toLocaleString()} | 
              Available: {availableWeth.toFixed(4)} WETH
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collateral" className="text-slate-300">Collateral Amount (WETH)</Label>
            <Input
              id="collateral"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
              inputMode="decimal"
              placeholder="0.0"
              aria-describedby="collateral-hint"
            />
            <p id="collateral-hint" className="text-xs text-slate-400">
              Est. USD: ${collateralUSD.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrow" className="text-slate-300">Borrow Amount (USDC)</Label>
            <Input
              id="borrow"
              value={borrow}
              onChange={(e) => setBorrow(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
              inputMode="decimal"
              placeholder="0.0"
            />
            <p className="text-xs text-slate-400">
              {collateralAmount > 0 ? (
                <>
                  LTV: {projectedCalculations.ltv.toFixed(1)}% | 
                  Max: ${projectedCalculations.maxBorrowableUSD.toFixed(2)}
                </>
              ) : (
                <>
                  Available: ${accountData ? Math.max(0, (Number(formatTokenAmount(accountData[2], 18)) * collateralFactor - Number(formatTokenAmount(accountData[3], 18)))).toFixed(2) : '0.00'}
                </>
              )}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Account Summary</Label>
            <div className="rounded-lg bg-slate-700/30 border border-slate-600 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Health Factor</span>
                <span className={`font-medium ${getHealthStatusColor(calculations.healthStatus)}`}>
                  {calculations.healthFactor > 0 ? calculations.healthFactor.toFixed(2) : 'N/A'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-400">Liquidation Threshold</span>
                <span className="font-medium text-slate-300">{liquidationThreshold}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-400">Available USDC</span>
                <span className="font-medium text-slate-300">{availableUsdc.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600"
          onClick={clearForm}
          disabled={isDepositing || isBorrowing}
        >
          Clear Form
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600"
            onClick={handleDepositCollateral}
            disabled={isDepositing || !collateralAmount}
          >
            {isDepositing ? "Depositing..." : "Deposit Collateral"}
          </Button>
          <Button
            className="bg-gradient-primary hover:opacity-90 text-white"
            onClick={handleBorrow}
            disabled={isBorrowing || !borrowAmount || (collateralAmount > 0 && projectedCalculations.ltv > collateralFactor * 100)}
          >
            {isBorrowing ? "Borrowing..." : "Borrow USDC"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
