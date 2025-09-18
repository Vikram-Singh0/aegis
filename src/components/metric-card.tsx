import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ReactNode } from "react"

export function MetricCard({
  title,
  value,
  subtext,
  icon,
}: {
  title: string
  value: string
  subtext?: string
  icon?: ReactNode
}) {
  return (
    <Card className="glass-card rounded-xl hover-lift">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {icon && <div className="text-slate-400">{icon}</div>}
          <CardTitle className="text-sm text-slate-400">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-100">{value}</div>
        {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
      </CardContent>
    </Card>
  )
}
