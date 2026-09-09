import { cn } from '@shared/lib/cn'
import { Code2 } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className={cn('min-h-screen flex flex-col items-center justify-center px-4 py-12')}>
      <Link to="/" className="flex items-center gap-2 mb-8 group">
        <div className="size-8 rounded-xl bg-accent flex items-center justify-center shadow group-hover:scale-105 transition-transform">
          <Code2 className="size-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-sans font-bold text-xl">Catalyst</span>
      </Link>

      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
