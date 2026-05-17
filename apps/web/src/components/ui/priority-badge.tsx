import * as React from 'react';
import { cn } from '@/lib/utils';

type Priority = 'critical' | 'high' | 'medium' | 'low';

type PriorityBadgeProps = React.ComponentProps<'span'> & {
  priority: Priority;
};

const dotClassName: Record<Priority, string> = {
  critical: 'bg-priority-critical',
  high: 'bg-priority-high',
  medium: 'bg-priority-medium',
  low: 'bg-priority-low',
};

const priorityLabel: Record<Priority, { tl: string; en: string }> = {
  critical: { tl: 'Kritikal', en: 'Critical' },
  high: { tl: 'Mataas', en: 'High' },
  medium: { tl: 'Katamtaman', en: 'Medium' },
  low: { tl: 'Mababa', en: 'Low' },
};

function PriorityBadge({ priority, className, ...props }: PriorityBadgeProps) {
  const label = priorityLabel[priority];

  return (
    <span
      data-slot="priority-badge"
      data-priority={priority}
      className={cn('inline-flex items-center gap-1.5 text-label-md text-foreground', className)}
      title={`${label.tl} (${label.en})`}
      aria-label={`Priority ${label.en}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block size-2 rounded-full', dotClassName[priority])}
      />
      {label.en}
    </span>
  );
}

export { PriorityBadge };
export type { Priority };
