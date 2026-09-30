import { Button, Center, Text, VStack } from '@chakra-ui/react'
import { AlertTriangle } from 'lucide-react'
import * as React from 'react'

interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <VStack minH="50" align="center" justify="center" gap="4" p="8" textAlign="center">
          <Center boxSize="12" rounded="xl" bg="red.subtle" color="red.fg">
            <AlertTriangle size={24} />
          </Center>
          <VStack gap="1">
            <Text fontWeight="semibold">Algo deu errado</Text>
            <Text fontSize="sm" color="fg.muted">
              {this.state.error?.message ?? 'Erro inesperado'}
            </Text>
          </VStack>
          <Button
            size="sm"
            colorPalette="red"
            variant="subtle"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Tentar novamente
          </Button>
        </VStack>
      )
    }

    return this.props.children
  }
}
