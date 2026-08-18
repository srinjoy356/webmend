import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-surface disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-crimson-deep text-white hover:scale-105 active:scale-95 border-2 border-crimson-deep shadow-sm": variant === "default",
            "border-2 border-on-surface bg-surface-lowest text-on-surface hover:bg-surface-low hover:scale-105 active:scale-95": variant === "outline",
            "hover:bg-surface-low text-on-surface": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-full px-3": size === "sm",
            "h-11 rounded-full px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
