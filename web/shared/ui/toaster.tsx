import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react'

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
})

export const toast = {
  success: (title: string) => toaster.create({ title, type: 'success', closable: true }),
  danger: (title: string) => toaster.create({ title, type: 'error', closable: true }),
}

export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {(toastItem) => (
          <Toast.Root width={{ md: 'sm' }}>
            {toastItem.type === 'loading' ? (
              <Spinner size="sm" color="catalist.blue.500" />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap="1" flex="1" maxWidth="100%">
              {toastItem.title && <Toast.Title>{toastItem.title}</Toast.Title>}
              {toastItem.description && (
                <Toast.Description>{toastItem.description}</Toast.Description>
              )}
            </Stack>
            {toastItem.action && (
              <Toast.ActionTrigger>{toastItem.action.label}</Toast.ActionTrigger>
            )}
            {toastItem.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  )
}
