import { Container } from '@chakra-ui/react'
import type React from 'react'

export default function AppContainer({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <Container
      maxW="full"
      flex={1}
      flexDirection="column"
      px={{ base: 4, md: 20 }}
      justifyItems="center"
    >
      {children}
    </Container>
  )
}
