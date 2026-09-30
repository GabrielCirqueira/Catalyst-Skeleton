import { useMediaQuery } from '@/shared/hooks/useMediaQuery'
import { Dialog, Drawer, Portal } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface DialogOuDrawerProps {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  descricao?: string
  children: ReactNode
  footer?: ReactNode
}

export function DialogOuDrawer({
  aberto,
  aoFechar,
  titulo,
  descricao,
  children,
  footer,
}: DialogOuDrawerProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  function aoMudarAbertura(detalhes: { open: boolean }) {
    if (!detalhes.open) aoFechar()
  }

  if (isMobile) {
    return (
      <Drawer.Root open={aberto} onOpenChange={aoMudarAbertura} placement="bottom">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{titulo}</Drawer.Title>
                {descricao && <Drawer.Description>{descricao}</Drawer.Description>}
              </Drawer.Header>
              <Drawer.Body>{children}</Drawer.Body>
              {footer && <Drawer.Footer>{footer}</Drawer.Footer>}
              <Drawer.CloseTrigger />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    )
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={aoMudarAbertura} placement="center">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{titulo}</Dialog.Title>
              {descricao && <Dialog.Description>{descricao}</Dialog.Description>}
            </Dialog.Header>
            <Dialog.Body>{children}</Dialog.Body>
            {footer && <Dialog.Footer>{footer}</Dialog.Footer>}
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
