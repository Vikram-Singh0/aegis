import { SiteHeader } from "@/components/site-header"
import { ScoreCard } from "@/components/score-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreditPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Credit Score & History</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <ScoreCard score={710} />
          <Card className="border-neutral-200 bg-white text-black">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="rounded-md border border-neutral-300 p-3">+10 • On-time repayment for LN-1001</div>
              <div className="rounded-md border border-neutral-300 p-3">+5 • LTV maintained under 40% for 30 days</div>
              <div className="rounded-md border border-neutral-300 p-3">- • No late payments recorded</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
