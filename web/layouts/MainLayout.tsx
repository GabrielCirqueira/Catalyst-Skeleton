import { ModalAuth } from '@/features/auth/ModalAuth'
import { cn } from '@/shared/lib/cn'
import { Flex } from '@/shared/ui/layout'
import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export interface MainLayoutProps {
  className?: string
}

export interface MainLayoutContext {
  abrirModal: () => void
}

export function MainLayout({ className }: MainLayoutProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const abrirModal = useCallback(() => setModalAberto(true), [])
  const ctx = useMemo<MainLayoutContext>(() => ({ abrirModal }), [abrirModal])

  return (
    <Flex
      className={cn(
        'min-h-screen flex-col gap-0 bg-background text-foreground antialiased',
        className
      )}
    >
      <Header onAbrirModal={abrirModal} />
      <main className="flex-1 flex flex-col">
        <Outlet context={ctx} />
      </main>
      <Footer />
      {modalAberto && <ModalAuth isOpen={true} onClose={() => setModalAberto(false)} />}
    </Flex>
  )
}
