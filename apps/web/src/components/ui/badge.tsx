import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const dotClassName: Record<'neutral' | 'primary' | 'safe' | 'signal' | 'danger', string> = {
  neutral: 'bg-muted-foreground/70',
  primary: 'bg-primary',
  safe: 'bg-safe',
  signal: 'bg-signal',
  danger: 'bg-danger',
};

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-label-md text-foreground',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-muted/40',
        primary: 'border-border bg-surface',
        safe: 'border-border bg-surface',
        signal: 'border-border bg-surface',
        danger: 'border-border bg-surface',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  }
);

type Tone = 'neutral' | 'primary' | 'safe' | 'signal' | 'danger';

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
  };

function Badge({ className, tone, dot = true, children, ...props }: BadgeProps) {
  const resolvedTone = (tone ?? 'neutral') as Tone;

  return (
    <span
      data-slot="badge"
      data-tone={resolvedTone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn('inline-block size-1.5 rounded-full', dotClassName[resolvedTone])}
        />
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
