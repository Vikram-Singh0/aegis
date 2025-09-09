import Link from "next/link"
export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-neutral-600">© 2024 Aegis. All rights reserved.</p>
            <p className="text-xs text-neutral-500 mt-1">Made with ❤️ by <Link href={"https://github.com/Vikram-Singh0"}>Vikram</Link> </p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/legal" className="text-neutral-600 hover:text-black transition-colors">
              Terms
            </a>
            <a href="/help" className="text-neutral-600 hover:text-black transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
