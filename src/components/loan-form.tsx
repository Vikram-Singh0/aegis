"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAccountData, useTokenBalances, usePrices, useContractActions, parseTokenAmount, formatTokenAmount, formatUSD, useUsdcDecimals } from "@/hooks/useContract"
import WalletConnection from "@/app/walletConnection"

export function LoanForm() {
  const [asset, setAsset] = useState<string>("WETH")
  const [collateral, setCollateral] = useState<string>("2.0")
  const [borrow, setBorrow] = useState<string>("1500")
  const [reviewing, setReviewing] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isBorrowing, setIsBorrowing] = useState(false)

  // Contract hooks
  const { accountData, hasAccount } = useAccountData()
  const { wethBalance, usdcBalance } = useTokenBalances()
  const { collateralPrice, debtPrice } = usePrices()
  const { depositCollateral, borrow: borrowAction, isPending } = useContractActions()
  const usdcDecimals = useUsdcDecimals() || 6

  // If user already has collateral deposited (or has borrow capacity), jump to borrow step
  useEffect(() => {
    const hasCollateral = accountData ? (accountData[0] as bigint) > 0n : false
    const hasCapacity = accountData ? (accountData[4] as bigint) > 0n : false
    if ((hasCollateral || hasCapacity) && !reviewing) {
      setReviewing(true)
    }
  }, [accountData, reviewing])

  // Calculate real values from contract data
  const collateralPriceUSD = Number(formatTokenAmount(collateralPrice, 18))
  const collateralUSD = Number(collateral || 0) * (collateralPriceUSD || 3000)
  const maxBorrow = accountData ? Number(formatTokenAmount(accountData[4], usdcDecimals)) : 0 // maxBorrowDebtRaw
  const currentDebt = accountData ? Number(formatTokenAmount(accountData[1], usdcDecimals)) : 0 // debtRaw
  const healthFactor = accountData ? Number(formatTokenAmount(accountData[5], 18)) : 0 // healthFactor1e18
  
  const ltv = collateralUSD > 0 ? (Number(borrow || 0) / collateralUSD) : 0
  const interestAPR = "5.0%"
  const liquidationThreshold = "80% LTV"

  // Handle deposit collateral
  const handleDepositCollateral = async () => {
    if (!hasAccount) return
    
    setIsDepositing(true)
    try {
      const amount = parseTokenAmount(collateral, 18)
      await depositCollateral(amount)
      setReviewing(true)
    } catch (error) {
      console.error("Deposit failed:", error)
    } finally {
      setIsDepositing(false)
    }
  }

  // Handle borrow
  const handleBorrow = async () => {
    if (!hasAccount) return
    
    setIsBorrowing(true)
    try {
      const amount = parseTokenAmount(borrow, usdcDecimals)
      await borrowAction(amount)
    } catch (error) {
      console.error("Borrow failed:", error)
    } finally {
      setIsBorrowing(false)
    }
  }

  if (!hasAccount) {
    return (
      <Card className="border-neutral-200 bg-white text-black">
        <CardHeader>
          <CardTitle className="text-balance">Borrow Stablecoins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-neutral-300 bg-white">
            <AlertTitle>Connect Wallet</AlertTitle>
            <AlertDescription>
              Please connect your wallet to start borrowing against your collateral.
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
        <CardTitle className="text-balance">Borrow Stablecoins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-neutral-300 bg-white">
          <AlertTitle>Account Status</AlertTitle>
          <AlertDescription>
            Health Factor: {healthFactor > 0 ? (healthFactor / 1e18).toFixed(2) : "N/A"} | 
            Current Debt: ${currentDebt.toLocaleString()} | 
            Max Borrow: ${maxBorrow.toLocaleString()}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="asset">Collateral Asset</Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger id="asset" className="border-neutral-300">
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WETH">WETH</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-600">
              Live price: ${collateralPriceUSD.toLocaleString()} | 
              Balance: {formatTokenAmount(wethBalance, 18)} WETH
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collateral">Collateral Amount (WETH)</Label>
            <Input
              id="collateral"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              className="border-neutral-300"
              inputMode="decimal"
              aria-describedby="collateral-hint"
              disabled={isDepositing}
            />
            <p id="collateral-hint" className="text-xs text-neutral-600">
              Enter how much WETH to lock. Est. USD: ${collateralUSD.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="borrow">Borrow Amount (USDC)</Label>
            <Input
              id="borrow"
              value={borrow}
              onChange={(e) => setBorrow(e.target.value)}
              className="border-neutral-300"
              inputMode="decimal"
              disabled={isBorrowing}
            />
            <p className="text-xs text-neutral-600">
              Current LTV: {(ltv * 100).toFixed(1)}% | 
              Max: ${maxBorrow.toLocaleString()} USDC
            </p>
          </div>

          <div className="space-y-2">
            <Label>Terms Summary</Label>
            <div className="rounded-md border border-neutral-300 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Interest</span>
                <span className="font-medium">{interestAPR} APR</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Liquidation threshold</span>
                <span className="font-medium">{liquidationThreshold}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Credit score boost on timely pay</span>
                <span className="font-medium">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {!reviewing ? (
          <Button 
            className="bg-black text-white hover:bg-neutral-900" 
            onClick={handleDepositCollateral}
            disabled={isDepositing || !collateral || Number(collateral) <= 0}
          >
            {isDepositing ? "Depositing..." : "Deposit Collateral"}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="border-neutral-300 bg-white text-black"
              onClick={() => setReviewing(false)}
              disabled={isBorrowing}
            >
              Edit
            </Button>
            <Button 
              className="bg-black text-white hover:bg-neutral-900"
              onClick={handleBorrow}
              disabled={isBorrowing || !borrow || Number(borrow) <= 0 || Number(borrow) > maxBorrow}
            >
              {isBorrowing ? "Borrowing..." : "Confirm Borrow"}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
