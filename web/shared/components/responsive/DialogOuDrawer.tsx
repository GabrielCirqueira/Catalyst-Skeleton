import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shadcn/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/shadcn/components/ui/drawer'
import { useMediaQuery } from '@/shared/hooks'
import type * as React from 'react'

interface DialogOuDrawerProps {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao?: string
  children: React.ReactNode
  /**
   * Largura máxima do Dialog no desktop.
   * @default "sm:max-w-lg"
   */
  maxWidth?: string
}

/**
 * Modal responsivo: Dialog no desktop, Drawer (bottom sheet) no mobile.
 *
 * Uso obrigatório em qualquer modal do sistema — nunca usar Dialog isolado,
 * pois em mobile ele ocupa a tela toda de forma inadequada.
 *
 * @example
 * <DialogOuDrawer
 *   aberto={modalAberto}
 *   aoFechar={() => setModalAberto(false)}
 *   titulo="Criar recurso"
 * >
 *   <FormularioCriarRecurso />
 * </DialogOuDrawer>
 */
export function DialogOuDrawer({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  maxWidth = 'sm:max-w-lg',
}: DialogOuDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
        <DialogContent className={maxWidth}>
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            {descricao && <DialogDescription>{descricao}</DialogDescription>}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{titulo}</DrawerTitle>
          {descricao && <DrawerDescription>{descricao}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4 pb-6">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
