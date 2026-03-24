import { cn } from '@shadcn/lib/utils'
import * as React from 'react'

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  external?: boolean
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href = '#', external = false, children, ...props }, ref) => {
    const rel = external ? 'noopener noreferrer' : undefined
    const target = external ? '_blank' : undefined
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={cn('text-indigo-400 hover:text-indigo-300 underline', className)}
        {...props}
      >
        {children}
      </a>
    )
  }
)

Link.displayName = 'Link'

export default Link
