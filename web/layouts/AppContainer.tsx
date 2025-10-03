import { Container } from '@chakra-ui/react'
import type React from 'react'

export default function AppContainer({ children }: { children?: React.ReactNode }) {
  return (
    <Container maxW="full" flex={1} flexDirection="column" justifyItems="center">
      {children}
    </Container>
  )
}
