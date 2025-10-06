import { Container } from '@mantine/core'
import type React from 'react'
import { Outlet } from 'react-router-dom'

export default function MainLayout({ children }: { children?: React.ReactNode }) {
  return <Container size="lg">{children || <Outlet />}</Container>
}
