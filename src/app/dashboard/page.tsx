import { SiteHeader } from "@/components/site-header"
import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoanList } from "@/components/loan-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScoreCard } from "@/components/score-card"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard title="Wallet Assets (USD)" value="$12,500" subtext="Auto-verified from wallet" />
          <MetricCard title="Total Borrowed" value="$4,500" subtext="Across 2 active loans" />
          <MetricCard title="Average LTV" value="36%" subtext="Keep below 50% for safety" />
          <MetricCard title="Pending Repayment" value="$1,500" subtext="Due in 5 days" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <ScoreCard score={680} />
          <Card className="border-neutral-200 bg-white text-black">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Notifications</CardTitle>
              <Link href="/notifications" className="text-sm underline underline-offset-4">
                Manage
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-neutral-300 p-3 text-sm">
                Collateral USD for LN-1002 approaching threshold. Current LTV: 46%.
              </div>
              <div className="rounded-md border border-neutral-300 p-3 text-sm">
                Repayment due in 5 days for LN-1001. On-time payment boosts your score.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Loans</h2>
          <div className="flex gap-2">
            <Link href="/borrow">
              <Button className="bg-black text-white hover:bg-neutral-900">New Loan</Button>
            </Link>
            <Link href="/repay">
              <Button variant="outline" className="border-neutral-300 bg-white text-black">
                Repay
              </Button>
            </Link>
          </div>
        </div>
        <LoanList />
      </section>
    </main>
  )
}
