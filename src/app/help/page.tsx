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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          FAQ & Help
        </h1>
        <div className="grid gap-3">
          {faqs.map((f, i) => (
            <Card
              key={i}
              className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-2xl hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-base text-white">{f.q}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-300">{f.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
