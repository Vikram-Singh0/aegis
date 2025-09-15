import type React from "react"
import type { Metadata } from "next"
import { Open_Sans, Work_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SiteFooter } from "@/components/site-footer"
import {ThirdwebProvider} from "thirdweb/react"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Aegis",
  description: "DeFi lending on Aegis Network",
  generator: "v0.app",
  icons: {
    icon: "/aegis geminai logo.png",
    // shortcut: "/aegis geminai logo.png",
    // apple: "/aegis geminai logo.png",
  },
}

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${openSans.variable} ${workSans.variable} antialiased`}>
      <body className="font-sans">
        <ThirdwebProvider>
          <div className="min-h-screen flex flex-col relative overflow-x-hidden">
            {/* Ambient gradient background for DeFi feel */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(59,130,246,0.18),transparent),radial-gradient(900px_500px_at_80%_10%,rgba(168,85,247,0.14),transparent)] dark:bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(59,130,246,0.1),transparent),radial-gradient(900px_500px_at_80%_10%,rgba(168,85,247,0.08),transparent)]" />

            {/* Soft vignette and top glow */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 -z-10 bg-gradient-to-b from-blue-500/10 to-transparent blur-2xl" />

            <div className="flex-1 a-fade">
              <Suspense fallback={null}>{children}</Suspense>
            </div>
            <SiteFooter />
          </div>
          <Toaster position="top-right" richColors />
          <Analytics />
        </ThirdwebProvider>
      </body>
    </html>
  )
}
