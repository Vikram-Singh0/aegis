"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function LoanForm() {
  const [asset, setAsset] = useState<string>("ETH")
  const [collateral, setCollateral] = useState<string>("2.0")
  const [borrow, setBorrow] = useState<string>("1500")
  const [reviewing, setReviewing] = useState(false)

  const mockPriceUSD = asset === "ETH" ? 3000 : 1 // simplified mock
  const collateralUSD = Number(collateral || 0) * mockPriceUSD
  const ltv = Math.min(0.5, Number(borrow || 0) / (collateralUSD || 1)) // 50% max LTV
  const interestAPR = "5.0%"
  const liquidationThreshold = "60% LTV"

  return (
    <Card className="border-neutral-200 bg-white text-black">
      <CardHeader>
        <CardTitle className="text-balance">Borrow Stablecoins</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-neutral-300 bg-white">
          <AlertTitle>Tip</AlertTitle>
          <AlertDescription>
            Keep LTV at or below 50% to reduce liquidation risk. Collateral USD: ${collateralUSD.toLocaleString()}
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
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="WBTC">WBTC</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-neutral-600">Live price (mock): ${mockPriceUSD.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collateral">Collateral Amount</Label>
            <Input
              id="collateral"
              value={collateral}
              onChange={(e) => setCollateral(e.target.value)}
              className="border-neutral-300"
              inputMode="decimal"
              aria-describedby="collateral-hint"
            />
            <p id="collateral-hint" className="text-xs text-neutral-600">
              Enter how much {asset} to lock. Est. USD: ${collateralUSD.toLocaleString()}
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
            />
            <p className="text-xs text-neutral-600">Current LTV (approx): {(ltv * 100).toFixed(0)}%</p>
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
          <Button className="bg-black text-white hover:bg-neutral-900" onClick={() => setReviewing(true)}>
            Review Terms
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="border-neutral-300 bg-white text-black"
              onClick={() => setReviewing(false)}
            >
              Edit
            </Button>
            <Button className="bg-black text-white hover:bg-neutral-900">Confirm Borrow</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
