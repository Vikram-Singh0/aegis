export function SiteFooter() {
  return (
    <footer className="glass-card border-t border-gray-500/20 bg-transparent backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-foreground">© 2024 Aegis. All rights reserved.</p>
            <p className="text-xs text-muted-foreground mt-1">Made with ❤️ by me</p>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="/legal" className="text-muted-foreground hover:text-blue-400 transition-colors">
              Terms
            </a>
            <a href="/help" className="text-muted-foreground hover:text-blue-400 transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
