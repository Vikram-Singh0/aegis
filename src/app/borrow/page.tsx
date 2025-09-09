import { SiteHeader } from "@/components/site-header"
import { LoanForm } from "@/components/loan-form"
import { Card, CardContent } from "@/components/ui/card"

export default function BorrowPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Borrow</h1>
        <LoanForm />
        <Card className="border-neutral-200 bg-white">
          <CardContent className="p-4 text-sm text-neutral-700">
            Partial liquidation is enforced automatically if collateral value drops below threshold. Set custom alerts
            in Notifications to prevent surprises.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
