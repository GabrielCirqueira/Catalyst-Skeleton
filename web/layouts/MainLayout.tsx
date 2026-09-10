import { Flex } from '@/shared/ui/layout'
import { cn } from '@/shared/lib/cn'
import { Outlet } from 'react-router-dom'

interface MainLayoutProps {
  className?: string
}

export function MainLayout({ className }: MainLayoutProps) {
  return (
    <Flex className={cn('min-h-screen flex-col gap-0 antialiased', className)}>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </Flex>
  )
}
