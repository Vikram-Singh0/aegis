"use client"
import { SiteHeader } from "@/components/site-header"
import { ScoreCard } from "@/components/score-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAccountData } from "@/hooks/useContract"

export default function CreditPage() {
  const { accountData, hasAccount } = useAccountData()
  
  // Mock credit score data (since this is not integrated with contracts yet)
  const creditScore = 720
  const creditHistory = [
    {
      id: 1,
      event: "On-time repayment for POS-001",
      impact: "+15",
      type: "positive",
      date: "2 days ago"
    },
    {
      id: 2,
      event: "LTV maintained under 60% for 30 days",
      impact: "+10",
      type: "positive",
      date: "1 week ago"
    },
    {
      id: 3,
      event: "No late payments recorded",
      impact: "0",
      type: "neutral",
      date: "2 weeks ago"
    },
    {
      id: 4,
      event: "First successful loan completion",
      impact: "+25",
      type: "positive",
      date: "1 month ago"
    }
  ]

  if (!hasAccount) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="glass-card rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">Connect Your Wallet</h1>
            <p className="text-slate-400 mb-6">Please connect your wallet to view your credit score</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <SiteHeader />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />
      
      <section className="relative mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          Credit Score & History
        </h1>
          <p className="text-xl text-slate-400">
            Track your on-chain credit reputation and borrowing history
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Current Score</h2>
            <ScoreCard score={creditScore} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Credit History</h2>
            <Card className="glass-card border-blue-500/20 bg-slate-800/50 text-slate-100">
            <CardHeader>
                <CardTitle className="text-slate-100">Recent Events</CardTitle>
            </CardHeader>
              <CardContent className="space-y-3">
                {creditHistory.map((event) => (
                  <div key={event.id} className={`rounded-lg p-3 border ${
                    event.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    event.type === 'negative' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{event.event}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          event.type === 'positive' ? 'border-emerald-500/30 text-emerald-400' :
                          event.type === 'negative' ? 'border-red-500/30 text-red-400' :
                          'border-blue-500/30 text-blue-400'
                        }>
                          {event.impact}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{event.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Credit Score Factors</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-100">Payment History (40%)</h3>
              <p className="text-sm text-slate-400">Timely repayments boost your score</p>
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-slate-700/50 rounded-full">
                  <div className="h-2 w-4/5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                </div>
                <span className="text-sm text-emerald-400">Excellent</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-100">Credit Utilization (30%)</h3>
              <p className="text-sm text-slate-400">Lower LTV ratios improve your score</p>
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-slate-700/50 rounded-full">
                  <div className="h-2 w-3/5 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full" />
                </div>
                <span className="text-sm text-yellow-400">Good</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-100">Account Age (20%)</h3>
              <p className="text-sm text-slate-400">Longer history builds trust</p>
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-slate-700/50 rounded-full">
                  <div className="h-2 w-2/5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                </div>
                <span className="text-sm text-blue-400">Fair</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 border-amber-500/30 bg-amber-500/5">
          <h2 className="text-xl font-bold text-amber-400 mb-2">Coming Soon</h2>
          <p className="text-amber-200/80">
            Advanced credit scoring with CIBIL integration, cross-chain reputation tracking, 
            and personalized lending terms based on your on-chain history.
          </p>
        </div>
      </section>
    </main>
  )
}
