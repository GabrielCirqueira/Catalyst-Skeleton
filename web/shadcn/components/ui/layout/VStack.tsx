import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string
  align?: string
  justify?: string
}

export const VStack = React.forwardRef<HTMLDivElement, VStackProps>(
  ({ className, gap = 'gap-2', align = 'items-start', justify = '', ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col', gap, align, justify, className)} {...props} />
    )
  }
)
VStack.displayName = 'VStack'

export default VStack
