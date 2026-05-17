import * as React from 'react';
import { cn } from '@/lib/utils';

type Status = 'new' | 'triaged' | 'responding' | 'resolved';

type StatusBadgeProps = React.ComponentProps<'span'> & {
  status: Status;
};

const dotClassName: Record<Status, string> = {
  new: 'bg-status-new',
  triaged: 'bg-status-triaged',
  responding: 'bg-status-responding',
  resolved: 'bg-status-resolved',
};

const statusLabel: Record<Status, { tl: string; en: string }> = {
  new: { tl: 'Bago', en: 'New' },
  triaged: { tl: 'Sinuri', en: 'Triaged' },
  responding: { tl: 'Tumutugon', en: 'Responding' },
  resolved: { tl: 'Tapos', en: 'Resolved' },
};

function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const label = statusLabel[status];

  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1.5 text-label-md text-muted-foreground',
        className
      )}
      title={`${label.tl} (${label.en})`}
      aria-label={`Status ${label.en}`}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('inline-block size-2 rounded-full', dotClassName[status])}
      />
      {label.en}
    </span>
  );
}

export { StatusBadge };
export type { Status };
