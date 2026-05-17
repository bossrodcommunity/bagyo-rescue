import * as React from 'react';
import { Slot } from 'radix-ui';
import { IconShieldExclamation } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type SosButtonProps = React.ComponentProps<'button'> & {
  asChild?: boolean;
};

function SosButton({ className, asChild = false, type, children, ...props }: SosButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="sos-button"
      type={asChild ? undefined : (type ?? 'button')}
      aria-label="Humingi ng tulong, request rescue"
      className={cn(
        'group relative flex h-16 w-full items-center justify-center gap-4 rounded-md',
        'bg-danger text-white',
        'transition-colors duration-100 hover:bg-danger/95 active:bg-danger/90',
        'outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'select-none',
        className
      )}
      {...props}
    >
      <IconShieldExclamation aria-hidden="true" className="size-7 shrink-0" />
      <span className="flex flex-col items-start leading-none">
        <span className="font-display text-display-2xl font-bold tracking-tight">
          Humingi ng Tulong
        </span>
        <span className="mt-1 text-label-md font-medium text-white/80">Request Rescue</span>
      </span>
      {children}
    </Comp>
  );
}

export { SosButton };
