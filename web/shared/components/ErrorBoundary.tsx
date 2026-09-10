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
        <div className="min-h-50 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="size-12 rounded-xl bg-danger/10 flex items-center justify-center">
            <AlertTriangle className="size-6 text-danger" />
          </div>
          <div>
            <p className="font-semibold">Algo deu errado</p>
            <p className="text-sm text-muted mt-1">
              {this.state.error?.message ?? 'Erro inesperado'}
            </p>
          </div>
          <Button
            size="sm"
            variant="danger-soft"
            onPress={() => this.setState({ hasError: false, error: undefined })}
          >
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
