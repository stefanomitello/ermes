import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 dark:border-emerald-500/20',
        warning:
          'border-amber-500/30 bg-amber-500/10 text-amber-400 dark:border-amber-500/20',
        critical:
          'border-rose-500/30 bg-rose-500/15 text-rose-400 dark:border-rose-500/20 font-bold animate-pulse',
        info:
          'border-sky-500/30 bg-sky-500/10 text-sky-400 dark:border-sky-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
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

export function HttpMethodBadge({ method }: { method: string }) {
  const m = method.toUpperCase();
  switch (m) {
    case 'GET':
      return (
        <Badge
          variant="outline"
          className="border-sky-500/30 bg-sky-500/10 text-sky-400 font-mono font-bold px-2 py-0.5"
        >
          GET
        </Badge>
      );
    case 'POST':
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5"
        >
          POST
        </Badge>
      );
    case 'PUT':
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-mono font-bold px-2 py-0.5"
        >
          PUT
        </Badge>
      );
    case 'DELETE':
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-400 font-mono font-bold px-2 py-0.5"
        >
          DELETE
        </Badge>
      );
    case 'PATCH':
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono font-bold px-2 py-0.5"
        >
          PATCH
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-mono px-2 py-0.5">
          {m}
        </Badge>
      );
  }
}

export function ThreatScoreBadge({ score }: { score?: number | null }) {
  const s = score ?? 0;
  if (s >= 75) {
    return (
      <Badge variant="critical" className="gap-1 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        {s} Critical
      </Badge>
    );
  }
  if (s >= 50) {
    return (
      <Badge variant="warning" className="gap-1 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {s} High
      </Badge>
    );
  }
  if (s >= 25) {
    return (
      <Badge variant="info" className="gap-1 font-mono">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        {s} Medium
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="gap-1 font-mono">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {s} Low
    </Badge>
  );
}

export { Badge, badgeVariants };
