"use client"
import { SiteHeader } from "@/components/site-header"
import { LoanList } from "@/components/loan-list"
import { RepayForm } from "@/components/repay-form"

export default function RepayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Repay & Manage
        </h1>
        <LoanList showActions={false} />
        <RepayForm />
      </section>
    </main>
  )
}
