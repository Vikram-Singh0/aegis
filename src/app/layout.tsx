import type React from "react"
import type { Metadata } from "next"
import { Open_Sans, Work_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { SiteFooter } from "@/components/site-footer"
import "./globals.css"

export const metadata: Metadata = {
  title: "Aegis",
  description: "DeFi lending on Aegis Network",
  generator: "v0.app",
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
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
