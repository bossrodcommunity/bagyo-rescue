import * as React from 'react';
import { cn } from '@/lib/utils';

type WordmarkProps = React.ComponentProps<'span'> & {
  tagline?: boolean;
};

function Wordmark({ className, tagline = false, ...props }: WordmarkProps) {
  return (
    <span
      data-slot="wordmark"
      className={cn('inline-flex items-center gap-2.5 text-foreground', className)}
      {...props}
    >
      <ShieldWaveGlyph className="size-7 text-primary" aria-hidden="true" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-body-lg font-bold tracking-tight">Bagyo Rescue</span>
        {tagline ? (
          <span className="mt-0.5 text-caption text-muted-foreground">Tulong sa Bagyo</span>
        ) : null}
      </span>
    </span>
  );
}

function ShieldWaveGlyph({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Bagyo Rescue shield"
      {...props}
    >
      <path d="M16 3 5 7v8c0 7 5 11 11 13 6-2 11-6 11-13V7l-11-4z" />
      <path d="M9 17c2-1.5 4-1.5 7 0s5 1.5 7 0" />
    </svg>
  );
}

export { Wordmark, ShieldWaveGlyph };
