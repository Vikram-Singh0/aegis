import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"

const loans = [
  {
    id: "LN-1001",
    asset: "ETH",
    collateral: "2.00 ETH",
    collateralUSD: 6000,
    borrowed: 1500,
    ltv: 25,
    apr: "5.0%",
    status: "ok" as const,
  },
  {
    id: "LN-1002",
    asset: "WBTC",
    collateral: "0.10 WBTC",
    collateralUSD: 6500,
    borrowed: 3000,
    ltv: 46,
    apr: "5.0%",
    status: "warning" as const,
  },
]

export function LoanList({ showActions = true }: { showActions?: boolean }) {
  return (
    <div className="grid gap-3">
      {loans.map((loan) => (
        <Card key={loan.id} className="border-neutral-200 bg-white text-black">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{loan.id}</CardTitle>
            <StatusBadge status={loan.status} />
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-4">
            <div className="text-sm">
              <div className="text-neutral-600">Collateral</div>
              <div className="font-medium">{loan.collateral}</div>
              <div className="text-xs text-neutral-600">${loan.collateralUSD.toLocaleString()}</div>
            </div>
            <div className="text-sm">
              <div className="text-neutral-600">Borrowed</div>
              <div className="font-medium">${loan.borrowed.toLocaleString()}</div>
            </div>
            <div className="text-sm">
              <div className="text-neutral-600">LTV</div>
              <div className="font-medium">{loan.ltv}%</div>
            </div>
            <div className="text-sm">
              <div className="text-neutral-600">APR</div>
              <div className="font-medium">{loan.apr}</div>
            </div>
            {showActions && (
              <div className="md:col-span-4 flex gap-2 pt-2">
                <Button size="sm" className="bg-black text-white hover:bg-neutral-900">
                  Repay
                </Button>
                <Button size="sm" variant="outline" className="border-neutral-300 bg-white text-black">
                  Add Collateral
                </Button>
                <Button size="sm" variant="outline" className="border-neutral-300 bg-white text-black">
                  View
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
