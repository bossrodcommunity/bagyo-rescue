import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'flex w-full items-start gap-3 rounded-md border px-4 py-3 text-body-md text-foreground',
  {
    variants: {
      tone: {
        info: 'border-border [&_[data-slot=alert-rail]]:bg-primary',
        safe: 'border-border [&_[data-slot=alert-rail]]:bg-safe',
        signal: 'border-border [&_[data-slot=alert-rail]]:bg-signal',
        danger: 'border-border [&_[data-slot=alert-rail]]:bg-danger',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  }
);

type AlertProps = React.ComponentProps<'div'> & VariantProps<typeof alertVariants>;

function Alert({ className, tone, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      data-slot="alert"
      data-tone={tone ?? 'info'}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    >
      <span
        data-slot="alert-rail"
        aria-hidden="true"
        className="mt-0.5 h-5 w-1 shrink-0 rounded-full"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">{children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-title"
      className={cn('text-label-md font-semibold text-foreground', className)}
      {...props}
    />
  );
}

function AlertBody({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="alert-body"
      className={cn('text-body-md text-foreground', className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertBody };
export type { AlertProps };
