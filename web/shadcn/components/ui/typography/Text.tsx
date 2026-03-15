import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'p' | 'span' | 'div'
  size?: 'base' | 'sm' | 'xs' | 'lg'
}

const TEXT_MAP: Record<NonNullable<TextProps['size']>, string> = {
  base: 'text-base',
  sm: 'text-sm',
  xs: 'text-xs',
  lg: 'text-lg',
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as = 'p', size = 'base', className, ...props }, ref) => {
    const Tag = as as any
    return <Tag ref={ref as any} className={cn(TEXT_MAP[size], className)} {...props} />
  }
)

Text.displayName = 'Text'

export default Text
