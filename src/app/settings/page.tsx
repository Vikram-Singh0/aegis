import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Settings & Profile
        </h1>
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display-name" className="text-gray-300">
                Display Name
              </Label>
              <Input
                id="display-name"
                placeholder="Your name"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email (for alerts)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone" className="text-gray-300">
                Timezone
              </Label>
              <Input
                id="timezone"
                placeholder="UTC"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-blue-400"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
