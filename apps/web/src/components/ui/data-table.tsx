import * as React from 'react';
import { cn } from '@/lib/utils';

function TableWrap({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="table-wrap"
      className={cn('w-full overflow-x-auto rounded-md border bg-surface', className)}
      {...props}
    />
  );
}

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <table
      data-slot="table"
      className={cn('w-full min-w-3xl border-collapse text-body-md', className)}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-head"
      className={cn(
        'border-b border-border bg-surface-sunken text-label-md text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" className={cn('', className)} {...props} />;
}

function TableRow({
  className,
  selected,
  ...props
}: React.ComponentProps<'tr'> & { selected?: boolean }) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected || undefined}
      className={cn(
        'border-b border-border text-body-md text-foreground last:border-b-0',
        'data-[selected=true]:bg-primary-soft/60',
        'hover:bg-muted/40',
        className
      )}
      {...props}
    />
  );
}

function TableHeaderCell({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-header-cell"
      className={cn(
        'px-4 py-2.5 text-left align-middle text-label-md font-medium text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn('px-4 py-3 align-top text-foreground', className)}
      {...props}
    />
  );
}

export { TableWrap, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell };
