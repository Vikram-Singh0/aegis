import { SiteHeader } from "@/components/site-header"

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Legal & Terms
        </h1>
        <p className="text-gray-300 leading-relaxed">
          This interface provides access to decentralized smart contracts on the Aegis Network. Use at your own risk.
          Borrowers are responsible for monitoring LTV and collateral values. Partial liquidations may occur
          automatically.
        </p>
        <h2 className="text-xl font-semibold text-white">Risk Disclosure</h2>
        <p className="text-gray-300 leading-relaxed">
          Digital assets are volatile. Collateral values can change rapidly. Always set alerts and maintain conservative
          LTV.
        </p>
        <h2 className="text-xl font-semibold text-white">Privacy</h2>
        <p className="text-gray-300 leading-relaxed">
          Limited personal data is required. Wallet addresses and on-chain data may be publicly visible on-chain.
        </p>
      </section>
    </main>
  )
}
