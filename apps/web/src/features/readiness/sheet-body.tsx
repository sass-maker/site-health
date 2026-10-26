import type { ComponentProps } from 'react';
import { cn } from '@saas-maker/ui/utils';

export function SheetBody({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="sheet-body" className={cn('min-h-0 flex-1 overflow-y-auto px-4 py-2', className)} {...props} />;
}
