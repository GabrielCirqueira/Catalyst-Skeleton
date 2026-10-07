import { ModalAuth } from '@/features/auth/ModalAuth'
import { Box, Flex } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export interface MainLayoutContext {
  abrirModal: () => void
}

export function MainLayout() {
  const [modalAberto, setModalAberto] = useState(false)
  const abrirModal = useCallback(() => setModalAberto(true), [])
  const ctx = useMemo<MainLayoutContext>(() => ({ abrirModal }), [abrirModal])

  return (
    <Flex minH="100vh" direction="column" gap="0" bg="catalist.grey.50" color="catalist.grey.900">
      <Header onAbrirModal={abrirModal} />
      <Box as="main" flex="1" display="flex" flexDirection="column">
        <Outlet context={ctx} />
      </Box>
      <Footer />
      {modalAberto && <ModalAuth isOpen={true} onClose={() => setModalAberto(false)} />}
    </Flex>
  )
}
