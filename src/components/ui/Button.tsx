import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'xl'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
          {
            // PRIMARY CTA — Strong visual weight
            "bg-primary text-primary-foreground shadow-cta dark:shadow-cta-dark hover:bg-[var(--primary-hover)] hover:shadow-lg hover:-translate-y-0.5":
              variant === 'default',

            // OUTLINE — Secondary action
            "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground":
              variant === 'outline',

            // SECONDARY — Tertiary neutral action
            "bg-muted text-foreground border border-border hover:bg-accent":
              variant === 'secondary',

            // GHOST — Least prominent
            "text-foreground hover:bg-accent hover:text-accent-foreground":
              variant === 'ghost',

            // DESTRUCTIVE
            "bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5":
              variant === 'destructive',

            // SIZES
            "h-10 px-5 py-2 text-sm": size === 'default',
            "h-8 px-3 text-xs": size === 'sm',
            "h-11 px-6 text-base": size === 'lg',
            "h-14 px-8 text-lg": size === 'xl',
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