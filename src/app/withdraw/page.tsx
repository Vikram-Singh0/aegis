import { SiteHeader } from "@/components/site-header"
import { WithdrawForm } from "@/components/withdraw-form"
import { Card, CardContent } from "@/components/ui/card"

export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />
      
      <SiteHeader />
      
      <section className="mx-auto max-w-6xl px-4 py-8 relative z-10 space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Withdraw Collateral
          </h1>
          <p className="text-xl text-slate-400">
            Withdraw your collateral while maintaining a safe health factor
          </p>
        </div>
        
        <WithdrawForm />
        
        <Card className="glass-card border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 text-sm text-amber-200/80">
            <strong>Important:</strong> Withdrawing collateral will reduce your borrowing capacity and may affect your health factor. 
            Ensure you maintain a safe LTV ratio to avoid liquidation risk.
          </CardContent>
        </Card>
      </section>
    </main>
  )
}


