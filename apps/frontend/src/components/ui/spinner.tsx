import { cn } from '@/lib/utils.js';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<SVGElement> {
  size?: number | string;
}

export function Spinner({ className, size = 18, ...props }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-primary shrink-0', className)}
      {...props}
    />
  );
}
