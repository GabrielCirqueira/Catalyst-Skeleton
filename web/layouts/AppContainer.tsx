import { Container, type ContainerProps } from '@chakra-ui/react'

const maxWMap = {
  full: 'full',
  '7xl': '7xl',
  '6xl': '6xl',
  '5xl': '5xl',
  '4xl': '4xl',
  '3xl': '3xl',
  '2xl': '2xl',
  xl: 'xl',
  lg: 'lg',
} as const

export interface AppContainerProps extends Omit<ContainerProps, 'maxW'> {
  maxWidth?: keyof typeof maxWMap
}

export function AppContainer({ maxWidth = '6xl', children, ...rest }: AppContainerProps) {
  return (
    <Container maxW={maxWMap[maxWidth]} px="6" py="8" {...rest}>
      {children}
    </Container>
  )
}
