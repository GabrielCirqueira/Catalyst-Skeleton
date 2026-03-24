import { Box } from '@shadcn/layout'
import { cn } from '@shadcn/lib/utils'
import { Caption } from '@shadcn/typography'
import * as React from 'react'

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {}

export const Footer = React.forwardRef<HTMLElement, FooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Box as="footer" ref={ref as any} className={cn('mt-8 text-center', className)} {...props}>
        <Caption className="text-slate-400">
          {children ?? 'Built with tailwind & local shadcn components'}
        </Caption>
      </Box>
    )
  }
)

Footer.displayName = 'Footer'

export default Footer
