import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Settings & Profile</h1>
        <Card className="border-neutral-200 bg-white text-black">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input id="display-name" placeholder="Your name" className="border-neutral-300" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (for alerts)</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="border-neutral-300" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" placeholder="UTC" className="border-neutral-300" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-black text-white hover:bg-neutral-900">Save Changes</Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
