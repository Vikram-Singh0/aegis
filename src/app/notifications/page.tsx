import { SiteHeader } from "@/components/site-header"
import { NotificationSettings } from "@/components/notification-settings"

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <NotificationSettings />
      </section>
    </main>
  )
}
