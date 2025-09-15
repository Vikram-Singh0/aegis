import { SiteHeader } from "@/components/site-header"
import { WithdrawForm } from "@/components/withdraw-form"
import { Card, CardContent } from "@/components/ui/card"

export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Withdraw Collateral</h1>
        <WithdrawForm />
        <Card className="border-neutral-200 bg-white">
          <CardContent className="p-4 text-sm text-neutral-700">
            Withdrawing collateral will reduce your borrowing capacity and may affect your health factor. 
            Ensure you maintain a safe LTV ratio to avoid liquidation risk.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}


