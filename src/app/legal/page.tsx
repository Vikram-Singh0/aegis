import { SiteHeader } from "@/components/site-header"

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Legal & Terms</h1>
        <p className="text-neutral-700">
          This interface provides access to decentralized smart contracts on the Aegis Network. Use at your own risk.
          Borrowers are responsible for monitoring LTV and collateral values. Partial liquidations may occur
          automatically.
        </p>
        <h2 className="text-lg font-semibold">Risk Disclosure</h2>
        <p className="text-neutral-700">
          Digital assets are volatile. Collateral values can change rapidly. Always set alerts and maintain conservative
          LTV.
        </p>
        <h2 className="text-lg font-semibold">Privacy</h2>
        <p className="text-neutral-700">
          Limited personal data is required. Wallet addresses and on-chain data may be publicly visible on-chain.
        </p>
      </section>
    </main>
  )
}
