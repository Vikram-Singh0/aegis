import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ScoreCard({ score = 680 }: { score?: number }) {
  const pct = Math.max(0, Math.min(1, score / 1000))
  return (
    <Card className="border-neutral-200 bg-white text-black">
      <CardHeader>
        <CardTitle>On-chain Credit Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{score}</div>
        <div
          className="mt-3 h-2 w-full rounded-full bg-neutral-200"
          role="progressbar"
          aria-valuenow={Math.round(pct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-2 rounded-full bg-black" style={{ width: `${pct * 100}%` }} />
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Repay on time to increase your score and future borrowing limits.
        </p>
      </CardContent>
    </Card>
  )
}
