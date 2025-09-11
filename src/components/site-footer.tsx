import Link from "next/link"
export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200/60 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 dark:border-neutral-800/60 dark:bg-black/40 supports-[backdrop-filter]:dark:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">© 2024 Aegis. All rights reserved.</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Made  by <Link className="underline decoration-neutral-300/40 hover:decoration-blue-500/60 transition" href={"https://github.com/Vikram-Singh0"}>Vikram</Link> </p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/legal" className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors">
              Terms
            </a>
            <a href="/help" className="text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
