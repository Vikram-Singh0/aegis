"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function RepayForm() {
  const [amount, setAmount] = useState<string>("250")
  const due = 1500
  const after = Math.max(0, due - Number(amount || 0))

  return (
    <Card className="border-neutral-200 bg-white text-black">
      <CardHeader>
        <CardTitle>Repay Loan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-neutral-300 bg-white">
          <AlertTitle>Reminder</AlertTitle>
          <AlertDescription>Timely repayments increase your on-chain credit score and future limits.</AlertDescription>
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
            />
            <p className="text-xs text-neutral-600">Remaining after payment: ${after.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <Label>Summary</Label>
            <div className="rounded-md border border-neutral-300 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Due now</span>
                <span className="font-medium">${due.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>After payment</span>
                <span className="font-medium">${after.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Liquidation risk</span>
                <span className="font-medium">Reduced</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button className="bg-black text-white hover:bg-neutral-900">Confirm Repayment</Button>
      </CardFooter>
    </Card>
  )
}
