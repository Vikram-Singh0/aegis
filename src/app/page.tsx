import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Shield, Zap, TrendingUp, Bell, Award, Lock } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-br from-blue-400/15 to-blue-500/15 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <SiteHeader />

      <section className="mx-auto max-w-7xl px-4 py-16 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                <Zap className="w-3 h-3 mr-1" />
                Powered by Somnia Network
              </Badge>
              <h1 className="a-slide-up text-pretty text-5xl font-bold leading-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Borrow stablecoins without selling your crypto.
              </h1>
              <p className="a-slide-up text-xl text-slate-400 leading-relaxed" style={{ animationDelay: "80ms" }}>
                Secure, smart contract-enforced lending on Aegis. Collateralize assets, borrow USDC, and build your
                on-chain credit score with advanced risk management.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">$2.4M+</div>
                <div className="text-sm text-slate-400">Total Supplied</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">150%</div>
                <div className="text-sm text-slate-400">Max LTV</div>
              </div>
              <div className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">4.2%</div>
                <div className="text-sm text-slate-400">Best APY</div>
              </div>
            </div>

            <div className="a-slide-up flex flex-col sm:flex-row gap-4" style={{ animationDelay: "140ms" }}>
              <Link href="/dashboard" className="flex-1">
                <Button
                  size="lg"
                  className="w-full bg-gradient-primary hover:opacity-90 text-white shadow-lg shadow-blue-500/25"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Open Dashboard
                </Button>
              </Link>
              <Link href="/borrow" className="flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:border-slate-500"
                >
                  Start Borrowing
                </Button>
              </Link>
            </div>

            <Alert className="glass-card border-amber-500/30 bg-amber-500/5">
              <Bell className="h-4 w-4 text-amber-400" />
              <AlertTitle className="text-amber-400">Smart Risk Management</AlertTitle>
              <AlertDescription className="text-amber-200/80">
                Set custom liquidation alerts and benefit from partial liquidation protection. Your collateral is safer
                with Aegis.
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-6">
            <Card className="glass-card border-blue-500/20">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-6 text-center text-slate-100">How Aegis Works</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">Connect Wallet</div>
                      <div className="text-sm text-slate-400">Link your Web3 wallet securely</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">Choose Collateral</div>
                      <div className="text-sm text-slate-400">Select crypto assets to collateralize</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">Borrow USDC</div>
                      <div className="text-sm text-slate-400">Get stablecoins instantly</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium text-slate-100">Build Credit Score</div>
                      <div className="text-sm text-slate-400">Improve terms with timely repayments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent"></div>
        <div className="mx-auto max-w-7xl px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400">
              <Award className="w-3 h-3 mr-1" />
              Advanced Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Why Aegis is Different
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Rethinking crypto lending with borrower-centric features that current dApps lack
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card border-blue-500/20 group hover:border-blue-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">Dual Threshold System</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Set your own notification threshold to get early alerts before protocol liquidation kicks in.
                </p>
                <div className="text-xs text-slate-400">
                  <span className="text-red-400">❌ Others:</span> Rigid liquidations with no warning
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 group hover:border-purple-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bell className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">Smart Notifications</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Real-time alerts when collateral value drops, preventing surprise liquidations.
                </p>
                <div className="text-xs text-slate-400">
                  <span className="text-red-400">❌ Others:</span> No early warning system
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-green-500/20 group hover:border-green-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">Credit Score System</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Build on-chain reputation for better LTV ratios and lower interest rates over time.
                </p>
                <div className="text-xs text-slate-400">
                  <span className="text-red-400">❌ Others:</span> No reputation or reward system
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-cyan-500/20 group hover:border-cyan-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">Partial Liquidation</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Only liquidate the minimum required amount, not your entire collateral position.
                </p>
                <div className="text-xs text-slate-400">
                  <span className="text-red-400">❌ Others:</span> Aggressive full liquidations
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-blue-500/20 group hover:border-blue-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">Non-intrusive Custody</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Your crypto stays in your wallet with smart contract control, not pooled away.
                </p>
                <div className="text-xs text-slate-400">
                  <span className="text-red-400">❌ Others:</span> Assets locked in protocol pools
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-purple-500/20 group hover:border-purple-500/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-100">Somnia Network</h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  High TPS blockchain ensures smooth transactions without congestion or high gas fees.
                </p>
                <div className="text-xs text-slate-400">
                  <span className="text-red-400">❌ Others:</span> High gas fees and network congestion
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent"></div>
        <div className="mx-auto max-w-4xl px-4 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Everything You Need to Know
            </h2>
            <p className="text-xl text-slate-400">Get answers to common questions about Aegis lending protocol</p>
          </div>

          <div className="space-y-4">
            {[
              
        
              
              {
                question: "What happens if my collateral value drops?",
                answer:
                  "You'll receive early warnings through our notification system when your collateral approaches your custom threshold. If the protocol liquidation threshold is reached, only the minimum required amount is liquidated, not your entire position.",
              },
              {
                question: "How does the credit score system work?",
                answer:
                  "Your on-chain credit score improves with timely repayments and responsible borrowing behavior. Higher scores unlock better LTV ratios, lower interest rates, and increased borrowing limits over time.",
              },
              {
                question: "What assets can I use as collateral?",
                answer:
                  "Aegis supports major cryptocurrencies including ETH, BTC, and other blue-chip tokens. The platform continuously evaluates and adds new collateral types based on liquidity and market stability.",
              },
              {
                question: "Are there any fees?",
                answer:
                  "Aegis charges competitive interest rates on borrowed amounts and small protocol fees for liquidations. There are no hidden fees, and all costs are transparently displayed before you confirm any transaction.",
              },
              {
                question: "Is Aegis secure and audited?",
                answer:
                  "Yes, Aegis smart contracts undergo rigorous security audits by leading blockchain security firms. The protocol is built with multiple safety mechanisms and follows industry best practices for DeFi security.",
              },
              {
                question: "How do I get started?",
                answer:
                  "Simply connect your Web3 wallet, deposit collateral, and start borrowing. The entire process takes just a few minutes, and our intuitive interface guides you through each step.",
              },
            ].map((faq, index) => (
              <Collapsible key={index} className="glass-card border-slate-700/50">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors">
                  <h3 className="font-medium text-lg text-slate-100">{faq.question}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-6 pb-6">
                  <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
