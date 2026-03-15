import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface CenterProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean
}

export const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, vertical = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center', vertical ? 'min-h-full' : '', className)}
        {...props}
      />
    )
  }
)

Center.displayName = 'Center'

export default Center
