import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ScoreCard({ score = 680 }: { score?: number }) {
  const pct = Math.max(0, Math.min(1, score / 1000))
  return (
    <div className="glass-card rounded-xl p-6 hover-lift">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg text-slate-100">On-chain Credit Score</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-3xl font-bold text-slate-100">{score}</div>
        <div
          className="mt-3 h-3 w-full rounded-full bg-slate-700/50"
          role="progressbar"
          aria-valuenow={Math.round(pct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400 shadow-lg shadow-red-500/25"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">Repay on time to increase your score and future borrowing limits.</p>
      </CardContent>
    </div>
  )
}
