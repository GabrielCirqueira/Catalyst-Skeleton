import { Box } from '@shadcn/layout'
import { cn } from '@shadcn/lib/utils'
import { Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <Box
      className={cn(
        'min-h-screen flex flex-col items-center justify-center',
        'bg-background px-4 py-12'
      )}
    >
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <Code2 className="size-7 text-brand-600 dark:text-brand-400 transition-transform group-hover:scale-110" />
        <span className="font-heading font-bold text-xl text-typography-900 dark:text-typography-50">
          Catalyst
        </span>
      </Link>

      <Box className="w-full max-w-sm">
        <Outlet />
      </Box>
    </Box>
  )
}
