import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="a-slide-up text-pretty text-4xl font-semibold leading-tight">
              Borrow stablecoins without selling your crypto.
            </h1>
            <p className="a-slide-up mt-4 text-neutral-700" style={{ animationDelay: "80ms" }}>
              Secure, smart contract-enforced lending on Aegis. Collateralize assets, borrow USDC, and build your
              on-chain credit score.
            </p>
            <Alert className="mt-6">
              <AlertTitle className="font-bold">Important Risk Notice</AlertTitle>
              <AlertDescription className="mt-2">
                Please be aware of the risks associated with borrowing stablecoins. Ensure you understand the terms and
                conditions before proceeding.
              </AlertDescription>
            </Alert>
            <div className="a-slide-up mt-6 flex gap-3" style={{ animationDelay: "140ms" }}>
              <Link href="/dashboard">
                <Button className="bg-black text-white hover:bg-neutral-900">Open Dashboard</Button>
              </Link>
              <Link href="/borrow">
                <Button variant="outline" className="border-neutral-300 bg-white text-black">
                  Start Borrowing
                </Button>
              </Link>
            </div>
            <Alert className="mt-6 border-neutral-300 bg-white">
              <AlertTitle className="font-semibold">Important</AlertTitle>
              <AlertDescription className="text-sm">
                Borrowing against volatile collateral can lead to partial liquidation if LTV exceeds the threshold.
                Review terms and fees before confirming any transaction.
              </AlertDescription>
            </Alert>
            <ul className="a-slide-up mt-8 grid gap-2 text-sm text-neutral-700" style={{ animationDelay: "180ms" }}>
              <li>• Fast wallet connection & onboarding</li>
              <li>• Real-time collateral valuation (USD)</li>
              <li>• Partial liquidation protection and alerts</li>
              <li>• Dynamic credit score boosts with timely repayments</li>
            </ul>
          </div>
          <div>
            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-6">
                <div className="grid gap-3">
                  <div className="card-hover rounded-md border border-neutral-300 p-4 focus-ring" tabIndex={0}>
                    <div className="text-sm text-neutral-600">Step 1</div>
                    <div className="mt-1 font-medium">Connect Wallet</div>
                  </div>
                  <div
                    className="card-hover rounded-md border border-neutral-300 p-4 focus-ring"
                    tabIndex={0}
                    style={{ transitionDelay: "20ms" }}
                  >
                    <div className="text-sm text-neutral-600">Step 2</div>
                    <div className="mt-1 font-medium">Choose Collateral & Amount</div>
                  </div>
                  <div
                    className="card-hover rounded-md border border-neutral-300 p-4 focus-ring"
                    tabIndex={0}
                    style={{ transitionDelay: "40ms" }}
                  >
                    <div className="text-sm text-neutral-600">Step 3</div>
                    <div className="mt-1 font-medium">Review Terms & Borrow USDC</div>
                  </div>
                  <div
                    className="card-hover rounded-md border border-neutral-300 p-4 focus-ring"
                    tabIndex={0}
                    style={{ transitionDelay: "60ms" }}
                  >
                    <div className="text-sm text-neutral-600">Step 4</div>
                    <div className="mt-1 font-medium">Manage, Repay, Build Credit</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <p className="mt-3 text-center text-xs text-neutral-600">
              High-contrast, readable in low light and grayscale.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="a-slide-up text-3xl font-semibold text-black">Why Aegis is Different</h2>
            <p className="a-slide-up mt-4 text-neutral-700 max-w-2xl mx-auto" style={{ animationDelay: "80ms" }}>
              Rethinking crypto lending with borrower-centric features that current dApps lack
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-lg">Dual Threshold System</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  Set your own notification threshold to get early alerts before protocol liquidation kicks in.
                </p>
                <div className="text-xs text-neutral-600">
                  <span className="text-red-600">❌ Others:</span> Rigid liquidations with no warning
                </div>
              </CardContent>
            </Card>

            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "140ms" }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-lg">Smart Notifications</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  Real-time alerts when collateral value drops, preventing surprise liquidations.
                </p>
                <div className="text-xs text-neutral-600">
                  <span className="text-red-600">❌ Others:</span> No early warning system
                </div>
              </CardContent>
            </Card>

            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "180ms" }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-lg">Credit Score System</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  Build on-chain reputation for better LTV ratios and lower interest rates over time.
                </p>
                <div className="text-xs text-neutral-600">
                  <span className="text-red-600">❌ Others:</span> No reputation or reward system
                </div>
              </CardContent>
            </Card>

            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "220ms" }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-lg">Partial Liquidation</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  Only liquidate the minimum required amount, not your entire collateral position.
                </p>
                <div className="text-xs text-neutral-600">
                  <span className="text-red-600">❌ Others:</span> Aggressive full liquidations
                </div>
              </CardContent>
            </Card>

            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "260ms" }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-lg">Non-intrusive Custody</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  Your crypto stays in your wallet with smart contract control, not pooled away.
                </p>
                <div className="text-xs text-neutral-600">
                  <span className="text-red-600">❌ Others:</span> Assets locked in protocol pools
                </div>
              </CardContent>
            </Card>

            <Card className="a-slide-up border-neutral-200 bg-white" style={{ animationDelay: "300ms" }}>
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-6 h-6 bg-blue-600 rounded"></div>
                  </div>
                  <h3 className="font-semibold text-lg">Somnia Network</h3>
                </div>
                <p className="text-sm text-neutral-700 mb-4">
                  High TPS blockchain ensures smooth transactions without congestion or high gas fees.
                </p>
                <div className="text-xs text-neutral-600">
                  <span className="text-red-600">❌ Others:</span> High gas fees and network congestion
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
