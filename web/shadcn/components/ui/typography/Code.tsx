import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'code' | 'span' | 'pre'
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ as = 'code', className, ...props }, ref) => {
    const Tag = as as any
    return (
      <Tag
        ref={ref as any}
        className={cn('font-mono bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded text-sm', className)}
        {...props}
      />
    )
  }
)

Code.displayName = 'Code'

export default Code
