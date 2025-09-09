import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MetricCard({
  title,
  value,
  subtext,
}: {
  title: string
  value: string
  subtext?: string
}) {
  return (
    <Card className="bg-white text-black border-neutral-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-neutral-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {subtext ? <p className="mt-1 text-xs text-neutral-600">{subtext}</p> : null}
      </CardContent>
    </Card>
  )
}
