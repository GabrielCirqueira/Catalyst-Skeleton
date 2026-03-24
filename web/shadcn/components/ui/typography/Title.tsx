import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: '4xl' | '3xl' | '2xl' | 'xl' | 'lg' | 'md' | 'sm'
}

const SIZE_MAP: Record<NonNullable<TitleProps['size']>, string> = {
  '4xl': 'text-4xl font-bold',
  '3xl': 'text-3xl font-bold',
  '2xl': 'text-2xl font-bold',
  xl: 'text-xl font-semibold',
  lg: 'text-lg font-semibold',
  md: 'text-base font-medium',
  sm: 'text-sm font-medium',
}

export const Title = React.forwardRef<HTMLElement, TitleProps>(
  ({ as = 'h1', size = 'xl', className, ...props }, ref) => {
    const Tag = as as any
    return <Tag ref={ref as any} className={cn(SIZE_MAP[size], className)} {...props} />
  }
)

Title.displayName = 'Title'

export default Title
