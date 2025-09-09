import { cn } from "@/lib/utils"

export function StatusBadge({
  status,
  className,
}: {
  status: "ok" | "warning" | "risk"
  className?: string
}) {
  const label = status === "ok" ? "OK" : status === "warning" ? "Warning" : "At Risk"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs",
        status === "ok" && "border-neutral-300 text-neutral-800 bg-white",
        status === "warning" && "border-neutral-300 text-black bg-white",
        status === "risk" && "border-black text-white bg-black",
        className,
      )}
      aria-label={`Status: ${label}`}
    >
      <span aria-hidden>•</span>
      {label}
    </span>
  )
}
