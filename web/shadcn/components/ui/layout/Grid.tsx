import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number | string
  gap?: string
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 2, gap = 'gap-4', ...props }, ref) => {
    const colsClass = typeof cols === 'number' ? `grid-cols-${cols}` : `${cols}`
    return <div ref={ref} className={cn('grid', colsClass, gap, className)} {...props} />
  }
)

Grid.displayName = 'Grid'

export default Grid
