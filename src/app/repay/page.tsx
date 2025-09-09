import { SiteHeader } from "@/components/site-header"
import { LoanList } from "@/components/loan-list"
import { RepayForm } from "@/components/repay-form"

export default function RepayPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Repay & Manage</h1>
        <LoanList showActions={false} />
        <RepayForm />
      </section>
    </main>
  )
}
