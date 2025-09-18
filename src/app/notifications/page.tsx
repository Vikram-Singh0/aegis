"use client"
import { SiteHeader } from "@/components/site-header"
import { NotificationSettings } from "@/components/notification-settings"
import { useAccountData, formatTokenAmount } from "@/hooks/useContract"

export default function NotificationsPage() {
  const { accountData, hasAccount } = useAccountData()
  
  // Mock CIBIL score data (since this is not integrated with contracts yet)
  const cibilScore = 720
  const mockNotifications = [
    {
      id: 1,
      type: "warning",
      title: "LTV Threshold Alert",
      message: "Your loan-to-value ratio has reached 75%. Consider adding collateral or repaying some debt.",
      timestamp: "2 hours ago",
      read: false
    },
    {
      id: 2,
      type: "info",
      title: "Collateral Value Update",
      message: "WETH price increased by 3.2%. Your collateral value is now $12,500.",
      timestamp: "1 day ago",
      read: true
    },
    {
      id: 3,
      type: "success",
      title: "Payment Received",
      message: "Your repayment of $500 has been processed successfully. Credit score +5 points.",
      timestamp: "3 days ago",
      read: true
    }
  ]

  if (!hasAccount) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <SiteHeader />
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="glass-card rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">Connect Your Wallet</h1>
            <p className="text-slate-400 mb-6">Please connect your wallet to manage notifications</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <SiteHeader />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />
      
      <section className="relative mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Notifications & Alerts
          </h1>
          <p className="text-xl text-slate-400">
            Manage your risk alerts and stay informed about your positions
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Recent Alerts</h2>
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div key={notification.id} className={`glass-card rounded-xl p-4 hover-lift ${
                  !notification.read ? 'border-blue-500/30 bg-blue-500/5' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'warning' ? 'bg-yellow-400' :
                      notification.type === 'success' ? 'bg-emerald-400' :
                      'bg-blue-400'
                    }`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-100">{notification.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-500 mt-2">{notification.timestamp}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Alert Settings</h2>
            <NotificationSettings />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">CIBIL Score Integration</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Current CIBIL Score</p>
              <p className="text-3xl font-bold text-emerald-400">{cibilScore}</p>
              <p className="text-xs text-slate-500">Good - Based on on-chain activity</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Score Impact</p>
              <p className="text-lg font-semibold text-slate-100">+15 points this month</p>
              <p className="text-xs text-slate-500">From timely repayments</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-slate-700/30 rounded-lg">
            <p className="text-sm text-slate-400">
              <strong>Note:</strong> CIBIL score integration is coming soon. Currently showing mock data based on your on-chain activity patterns.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
