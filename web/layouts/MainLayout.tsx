import { cn } from '@shared/lib/cn'
import * as React from 'react'
import { Outlet } from 'react-router-dom'

export interface MainLayoutProps {
  className?: string
}

export const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ className }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen flex flex-col antialiased', className)}>
        <main className="flex-1 flex flex-col">
          <Outlet />
        </main>
      </div>
    )
  }
)

MainLayout.displayName = 'MainLayout'
