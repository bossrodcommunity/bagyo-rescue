import * as React from 'react';
import { cn } from '@/lib/utils';

const baseFieldClassName = [
  'block w-full rounded-md border border-border bg-surface text-foreground',
  'px-3 text-body-md placeholder:text-muted-foreground/70',
  'outline-none',
  'focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-ring',
  'disabled:cursor-not-allowed disabled:opacity-60',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/30',
].join(' ');

function Input({ className, type = 'text', ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(baseFieldClassName, 'h-10', className)}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(baseFieldClassName, 'min-h-24 resize-y py-2.5', className)}
      {...props}
    />
  );
}

function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(baseFieldClassName, 'h-10 appearance-none bg-no-repeat pr-9', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='currentColor' stroke-width='1.6'%3e%3cpath d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
        backgroundPosition: 'right 0.625rem center',
        backgroundSize: '1.125rem',
      }}
      {...props}
    >
      {children}
    </select>
  );
}

function Checkbox({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="checkbox"
      type="checkbox"
      className={cn(
        'size-5 shrink-0 rounded-sm border border-border bg-surface',
        'accent-primary',
        'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        className
      )}
      {...props}
    />
  );
}

export { Input, Textarea, Select, Checkbox };
