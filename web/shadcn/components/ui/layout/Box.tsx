import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: string
}

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({ as: Tag = 'div', className, ...props }, ref) => {
    const Component: any = Tag as any
    return <Component ref={ref} className={cn('', className)} {...props} />
  }
)

Box.displayName = 'Box'

export default Box
