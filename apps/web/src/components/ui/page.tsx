import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const pageVariants = cva('mx-auto w-full px-5 py-10 sm:px-6 md:py-14', {
  variants: {
    width: {
      narrow: 'max-w-2xl',
      default: 'max-w-5xl',
      wide: 'max-w-7xl',
    },
  },
  defaultVariants: {
    width: 'default',
  },
});

type PageProps = React.ComponentProps<'main'> & VariantProps<typeof pageVariants>;

function Page({ className, width, ...props }: PageProps) {
  return <main data-slot="page" className={cn(pageVariants({ width }), className)} {...props} />;
}

function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header data-slot="page-header" className={cn('flex flex-col gap-2', className)} {...props} />
  );
}

function PageTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-title"
      className={cn('text-heading-lg font-semibold text-foreground', className)}
      {...props}
    />
  );
}

function PageDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-description"
      className={cn('text-body-md text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Page, PageHeader, PageTitle, PageDescription };
