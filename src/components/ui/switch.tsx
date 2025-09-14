"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none focus-visible:ring-[3px]",
        // Track colors
        "data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
        "data-[state=unchecked]:bg-neutral-200 data-[state=unchecked]:border-neutral-300",
        "dark:data-[state=unchecked]:bg-neutral-700 dark:data-[state=unchecked]:border-neutral-600",
        // Focus
        "focus-visible:border-ring focus-visible:ring-ring/50",
        // Disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full ring-0 transition-transform",
          // Thumb position
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          // Thumb colors with contrast
          "data-[state=checked]:bg-white dark:data-[state=checked]:bg-neutral-100",
          "data-[state=unchecked]:bg-white dark:data-[state=unchecked]:bg-neutral-300",
          // Subtle elevation
          "shadow-sm"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
