import { SiteHeader } from "@/components/site-header"
import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Admin & Analytics</h1>
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard title="TVL (USD)" value="$1.2M" />
          <MetricCard title="Active Loans" value="342" />
          <MetricCard title="Avg. LTV" value="38%" />
          <MetricCard title="Liquidations (30d)" value="3 partial" />
        </div>
        <Card className="border-neutral-200 bg-white text-black">
          <CardHeader>
            <CardTitle>Operational Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="rounded-md border border-neutral-300 p-3">
              Monitoring oracle updates and price feeds (mock).
            </div>
            <div className="rounded-md border border-neutral-300 p-3">
              Smart contract partial liquidation triggers functioning nominally (mock).
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
