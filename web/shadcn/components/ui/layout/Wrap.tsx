import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface WrapProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string
  align?: string
}

export const Wrap = React.forwardRef<HTMLDivElement, WrapProps>(
  ({ className, gap = 'gap-2', align = 'items-start', ...props }, ref) => {
    return <div ref={ref} className={cn('flex flex-wrap', gap, align, className)} {...props} />
  }
)

Wrap.displayName = 'Wrap'

export default Wrap
