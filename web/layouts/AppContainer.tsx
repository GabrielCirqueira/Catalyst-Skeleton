import { Box, Container } from '@mantine/core'
import type React from 'react'

export default function AppContainer({ children }: { children?: React.ReactNode }) {
  return (
    <Container fluid>
      <Box display="flex" flex={1} style={{ flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </Box>
    </Container>
  )
}
