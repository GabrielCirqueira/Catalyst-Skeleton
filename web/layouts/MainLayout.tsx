import { Container } from '@chakra-ui/react'
import type React from 'react'
import { Outlet } from 'react-router-dom'

export default function MainLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <Container maxW="container.lg" >
      {children || <Outlet />}
    </Container>
  )
}
