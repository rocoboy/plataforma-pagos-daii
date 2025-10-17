import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-white text-gray-900",
        secondary:
          "border-gray-300 bg-gray-100 text-gray-900",
        destructive:
          "border-red-500 bg-red-500 text-white",
        outline: "border-gray-300 text-gray-900",
        success:
          "border-green-500 bg-green-500 text-white",
        warning:
          "border-orange-500 bg-orange-500 text-white",
        pending:
          "border-orange-500 bg-orange-500 text-white",
        info:
          "border-blue-500 bg-blue-500 text-white",
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

