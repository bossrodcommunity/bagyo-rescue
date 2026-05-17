import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { IconLoader2 } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    'font-medium select-none rounded-md',
    'transition-colors duration-100',
    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        danger:
          'bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/80 focus-visible:ring-destructive',
        secondary: 'border border-border text-foreground hover:bg-muted active:bg-muted/80',
        ghost: 'bg-transparent text-foreground hover:bg-muted',
        link: 'h-auto bg-transparent px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-label-md',
        md: 'h-10 px-4 text-label-md',
        lg: 'h-11 px-5 text-body-md',
        xl: 'min-h-16 px-6 py-4 text-body-lg',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
    loadingLabel?: string;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  loadingLabel,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'primary'}
      data-size={size ?? 'md'}
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : (disabled ?? isLoading)}
      {...props}
    >
      {isLoading ? (
        <>
          <IconLoader2
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span>{loadingLabel ?? children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
