import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-purple-600/20 text-purple-300 hover:bg-purple-600/30",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
        destructive:
          "border-transparent bg-red-900/30 text-red-400 hover:bg-red-900/40",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
