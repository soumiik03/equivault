import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm border focus:outline-none focus:ring-1 focus:ring-zinc-400",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700",
        pass:
          "bg-emerald-950/80 text-emerald-400 border-emerald-700/60",
        fail:
          "bg-pink-950/80 text-pink-400 border-pink-700/60",
        warning:
          "bg-amber-950/80 text-amber-400 border-amber-700/60",
        unverified:
          "bg-zinc-900 text-zinc-400 border-zinc-700/60",
        outline:
          "text-zinc-300 border-zinc-800 hover:bg-zinc-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
