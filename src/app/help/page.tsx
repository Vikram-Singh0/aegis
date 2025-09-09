import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const faqs = [
  {
    q: "How does borrowing work?",
    a: "Deposit supported assets as collateral. Based on your collateral USD value, borrow USDC up to the allowed LTV. Repay anytime.",
  },
  {
    q: "What triggers partial liquidation?",
    a: "If collateral value falls below the liquidation threshold (e.g., 60% LTV), a contract-enforced partial liquidation occurs to restore safety.",
  },
  {
    q: "How do I improve my credit score?",
    a: "Make on-time repayments and maintain conservative LTV. Your score increases and boosts future borrowing limits.",
  },
  {
    q: "Which network is this on?",
    a: "Aegis Network. Ensure your wallet is configured accordingly (mock for this design).",
  },
]

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">FAQ & Help</h1>
        <div className="grid gap-3">
          {faqs.map((f, i) => (
            <Card key={i} className="border-neutral-200 bg-white text-black">
              <CardHeader>
                <CardTitle className="text-base">{f.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-700">{f.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
