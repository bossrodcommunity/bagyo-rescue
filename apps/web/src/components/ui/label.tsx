import * as React from 'react';
import { cn } from '@/lib/utils';

type LabelProps = React.ComponentProps<'label'> & {
  hint?: React.ReactNode;
};

function Label({ className, children, hint, ...props }: LabelProps) {
  const childItems = React.Children.toArray(children);
  const labelContent = childItems.filter(child => typeof child === 'string');
  const fieldContent = childItems.filter(child => typeof child !== 'string');

  return (
    <label
      data-slot="label"
      className={cn('flex flex-col gap-1.5 text-label-md text-foreground', className)}
      {...props}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-medium">{labelContent}</span>
        {hint ? <span className="text-caption text-muted-foreground">{hint}</span> : null}
      </span>
      {fieldContent}
    </label>
  );
}

function BilingualLabel({
  className,
  primary,
  secondary,
  ...props
}: React.ComponentProps<'span'> & { primary: React.ReactNode; secondary?: React.ReactNode }) {
  return (
    <span data-slot="bilingual-label" className={cn('flex flex-col gap-0.5', className)} {...props}>
      <span className="text-body-md text-foreground">{primary}</span>
      {secondary ? <span className="text-caption text-muted-foreground">{secondary}</span> : null}
    </span>
  );
}

export { Label, BilingualLabel };
