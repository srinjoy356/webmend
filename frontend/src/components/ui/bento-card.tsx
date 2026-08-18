import React from "react";
import { cn } from "@/lib/utils";

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "accent";
  interactive?: boolean;
}

export function BentoCard({
  className,
  variant = "default",
  interactive = false,
  children,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out",
        {
          "bento-card": variant === "default",
          "bento-card-primary": variant === "primary",
          "bento-card-accent": variant === "accent",
          "hover:scale-[1.02] cursor-pointer active:scale-[0.98]": interactive,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
