import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'vertical' | 'horizontal'
  gap?: string
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = 'vertical', gap = 'gap-2', ...props }, ref) => {
    const dirClass = direction === 'vertical' ? 'flex-col' : 'flex-row'
    return <div ref={ref} className={cn('flex', dirClass, gap, className)} {...props} />
  }
)
Stack.displayName = 'Stack'

export default Stack
