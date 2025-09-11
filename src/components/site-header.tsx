"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { usePathname } from "next/navigation" // get current path to style active link
import WalletConnection from "@/app/walletConnection"

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/borrow", label: "Borrow" },
  { href: "/repay", label: "Repay" },
  { href: "/credit", label: "Credit" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
  { href: "/help", label: "Help" },
  { href: "/legal", label: "Legal" },
]

export function SiteHeader({ className }: { className?: string }) {
  const [connected, setConnected] = useState(false)
  const pathname = usePathname() // for active state

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-neutral-200/70 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 shadow-sm",
        "dark:border-neutral-800 dark:bg-black/40 supports-[backdrop-filter]:dark:bg-black/30",
        className,
      )}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-black dark:text-white motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-80"
          >
            <div className="relative h-8 w-8 flex-shrink-0">
              <Image src="/aegis geminai logo.png" alt="Aegis Logo" fill className="object-contain" priority />
            </div>
            <span className="text-lg">Aegis</span>
            <span className="sr-only">Go to home</span>
          </Link>
        </div>

        {/* Centered Nav */}
        <nav role="navigation" aria-label="Primary" className="hidden md:flex items-center justify-center gap-4">
          {links.map((l) => {
            const isActive = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative text-sm text-neutral-800 dark:text-neutral-200 px-2 py-1",
                  "motion-safe:transition-colors motion-safe:duration-200 hover:text-black dark:hover:text-white",
                  // animated underline
                  "after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:h-0.5 after:w-0",
                  "after:bg-blue-600/80 motion-safe:after:transition-all motion-safe:after:duration-300 hover:after:w-3/5",
                  isActive && "text-blue-600 after:w-3/5",
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {connected ? (
            <>
              <div aria-live="polite" className="text-sm text-neutral-700 dark:text-neutral-300">
                0x7c…A1b3
              </div>
              <Button
                variant="outline"
                className="rounded-full card-hover border-neutral-300/70 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 text-black hover:bg-white/70 dark:border-neutral-700/70 dark:bg-black/40 dark:text-white dark:hover:bg-black/50"
                onClick={() => setConnected(false)}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <WalletConnection/>
            // <Button
            //   className="rounded-full bg-black text-white hover:bg-neutral-900 motion-safe:transition-colors motion-safe:duration-200 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            //   onClick={() => setConnected(true)}
            // >
            //   Connect Wallet
            // </Button>
          )}
        </div>
      </div>
    </header>
  )
}
