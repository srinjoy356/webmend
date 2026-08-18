import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-on-surface text-surface-lowest hover:bg-on-surface/80": variant === "default",
          "border-transparent bg-forest-pro text-white hover:bg-forest-pro/80": variant === "success",
          "border-transparent bg-yellow-500 text-black hover:bg-yellow-500/80": variant === "warning",
          "border-transparent bg-crimson-deep text-white hover:bg-crimson-deep/80": variant === "destructive",
          "text-on-surface border-on-surface": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
