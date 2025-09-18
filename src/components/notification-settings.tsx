"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
  return (
    <Card className="glass-card border-blue-500/20 bg-slate-800/50 text-slate-100">
      <CardHeader>
        <CardTitle className="text-slate-100">Alert Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ltv-threshold" className="text-slate-300">
            Warning Threshold (LTV %)
          </Label>
          <Input
            id="ltv-threshold"
            defaultValue="75"
            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400"
            inputMode="numeric"
          />
          <p className="text-xs text-slate-400">Get alerts when your loan-to-value exceeds this percent.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="usd-threshold" className="text-slate-300">
            Collateral Floor (USD)
          </Label>
          <Input
            id="usd-threshold"
            defaultValue="5000"
            className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-400"
            inputMode="decimal"
          />
          <p className="text-xs text-slate-400">Alert when your collateral USD value falls below this amount.</p>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-700/30 border border-slate-600 p-3">
          <div>
            <div className="text-sm font-medium text-slate-100">Email Alerts</div>
            <div className="text-xs text-slate-400">Send alerts to your profile email</div>
          </div>
          <Switch defaultChecked aria-label="Toggle email alerts" />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-slate-700/30 border border-slate-600 p-3">
          <div>
            <div className="text-sm font-medium text-slate-100">In-App Alerts</div>
            <div className="text-xs text-slate-400">Show alerts inside your dashboard</div>
          </div>
          <Switch defaultChecked aria-label="Toggle in-app alerts" />
        </div>
      </CardContent>
    </Card>
  )
}
