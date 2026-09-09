import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  type UseOverlayStateReturn,
  useMediaQuery,
} from '@heroui/react'
import type { ReactNode } from 'react'

/**
 * DialogOuDrawer — em desktop abre um Modal centralizado;
 * em mobile (< md) abre um Modal com posicionamento bottom para imitar drawer.
 *
 * Uso:
 *   const state = useOverlayState()
 *   <DialogOuDrawer state={state} titulo="Título" footer={<Button>Fechar</Button>}>
 *     conteúdo
 *   </DialogOuDrawer>
 */
export interface DialogOuDrawerProps {
  state: UseOverlayStateReturn
  titulo: string
  descricao?: string
  children: ReactNode
  footer?: ReactNode
}

export function DialogOuDrawer({
  state,
  titulo,
  descricao,
  children,
  footer,
}: DialogOuDrawerProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <Modal isOpen={state.isOpen} onOpenChange={state.setOpen}>
      <ModalBackdrop isDismissable>
        <ModalContainer
          placement={isMobile ? 'bottom' : 'center'}
          className={isMobile ? 'rounded-b-none rounded-t-2xl m-0 max-w-full' : ''}
        >
          <ModalDialog>
            <ModalHeader className="flex flex-col gap-1">
              <ModalHeading>{titulo}</ModalHeading>
              {descricao && <p className="text-sm opacity-60 font-normal">{descricao}</p>}
            </ModalHeader>
            <ModalBody>{children}</ModalBody>
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  )
}
