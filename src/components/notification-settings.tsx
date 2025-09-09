"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export function NotificationSettings() {
  return (
    <Card className="border-neutral-200 bg-white text-black">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ltv-threshold">Warning Threshold (LTV %)</Label>
          <Input id="ltv-threshold" defaultValue="50" className="border-neutral-300" inputMode="numeric" />
          <p className="text-xs text-neutral-600">Get alerts when your loan-to-value exceeds this percent.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="usd-threshold">Collateral Floor (USD)</Label>
          <Input id="usd-threshold" defaultValue="5000" className="border-neutral-300" inputMode="decimal" />
          <p className="text-xs text-neutral-600">Alert when your collateral USD value falls below this amount.</p>
        </div>
        <div className="flex items-center justify-between rounded-md border border-neutral-300 p-3">
          <div>
            <div className="text-sm font-medium">Email Alerts</div>
            <div className="text-xs text-neutral-600">Send alerts to your profile email</div>
          </div>
          <Switch defaultChecked aria-label="Toggle email alerts" />
        </div>
        <div className="flex items-center justify-between rounded-md border border-neutral-300 p-3">
          <div>
            <div className="text-sm font-medium">In-App Alerts</div>
            <div className="text-xs text-neutral-600">Show alerts inside your dashboard</div>
          </div>
          <Switch defaultChecked aria-label="Toggle in-app alerts" />
        </div>
      </CardContent>
    </Card>
  )
}
