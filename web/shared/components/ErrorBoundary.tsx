import { Box, Text, VStack } from '@/shared/ui/layout'
import { Button } from '@heroui/react'
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
        <VStack className="min-h-50 items-center justify-center gap-4 p-8 text-center">
          <Box className="size-12 rounded-xl bg-danger/10 flex items-center justify-center">
            <AlertTriangle className="size-6 text-danger" />
          </Box>
          <VStack className="gap-1">
            <Text className="font-semibold">Algo deu errado</Text>
            <Text className="text-sm text-muted">
              {this.state.error?.message ?? 'Erro inesperado'}
            </Text>
          </VStack>
          <Button
            size="sm"
            variant="danger-soft"
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            Tentar novamente
          </Button>
        </VStack>
      )
    }

    return this.props.children
  }
}
