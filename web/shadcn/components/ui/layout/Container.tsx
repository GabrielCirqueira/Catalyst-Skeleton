import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const SIZE_MAP: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => {
    const sizeClass = size ? SIZE_MAP[size] : ''

    return <div ref={ref} className={cn('mx-auto px-4 w-full', sizeClass, className)} {...props} />
  }
)
Container.displayName = 'Container'

export default Container
