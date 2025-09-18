"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { ConnectButton, useActiveAccount, useDisconnect } from "thirdweb/react"
import WalletConnection from "@/app/walletConnection"
import { useState } from "react"
import { Menu, X } from "lucide-react"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/borrow", label: "Borrow" },
  { href: "/repay", label: "Repay" },
  { href: "/withdraw", label: "Withdraw" },
  { href: "/credit", label: "Credit" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
  { href: "/help", label: "Help" },
  { href: "/legal", label: "Legal" },
]

export function SiteHeader({ className }: { className?: string }) {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60 shadow-lg",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight text-slate-100 motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-80"
            >
              <div className="relative h-8 w-8 flex-shrink-0">
                <Image src="/aegis geminai logo.png" alt="Aegis Logo" fill className="object-contain" priority />
              </div>
              <span className="text-lg">Aegis</span>
              <span className="sr-only">Go to home</span>
            </Link>
          </div>

          {/* Centered Nav - Hidden on mobile, visible on larger screens */}
          <nav role="navigation" aria-label="Primary" className="hidden lg:flex items-center justify-center gap-6 flex-1 max-w-2xl mx-8">
            {links.slice(0, 6).map((l) => {
              const isActive = pathname === l.href
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative text-sm text-slate-300 px-3 py-2 whitespace-nowrap",
                    "motion-safe:transition-colors motion-safe:duration-200 hover:text-slate-100",
                    "after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-0.5 after:w-0",
                    "after:bg-blue-400 motion-safe:after:transition-all motion-safe:after:duration-300 hover:after:w-3/5",
                    isActive && "text-blue-400 after:w-3/5",
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side - Wallet connection and additional links */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Additional links for larger screens */}
            <div className="hidden xl:flex items-center gap-4">
              {links.slice(6).map((l) => {
                const isActive = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative text-sm text-slate-300 px-2 py-1 whitespace-nowrap",
                      "motion-safe:transition-colors motion-safe:duration-200 hover:text-slate-100",
                      "after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-0.5 after:w-0",
                      "after:bg-blue-400 motion-safe:after:transition-all motion-safe:after:duration-300 hover:after:w-3/5",
                      isActive && "text-blue-400 after:w-3/5",
                    )}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </div>
            
            {/* Wallet Connection */}
            <div className="flex-shrink-0">
              <WalletConnection/>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-slate-300 hover:text-slate-100 hover:bg-slate-800/50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-700/50 mt-3 pt-4 pb-2">
            <nav role="navigation" aria-label="Mobile navigation" className="flex flex-col space-y-2">
              {links.map((l) => {
                const isActive = pathname === l.href
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "text-sm text-slate-300 px-3 py-2 rounded-md",
                      "motion-safe:transition-colors motion-safe:duration-200 hover:text-slate-100 hover:bg-slate-800/50",
                      isActive && "text-blue-400 bg-blue-500/10",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
