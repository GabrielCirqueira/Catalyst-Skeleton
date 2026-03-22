import { Button } from '@/shadcn/components/ui/button'
import { VStack } from '@/shadcn/components/ui/layout'
import { Text } from '@/shadcn/components/ui/text'
import * as Sentry from '@sentry/react'
import { AlertTriangle } from 'lucide-react'
import * as React from 'react'
interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  children: React.ReactNode
}

interface ErrorBoundaryState {
  temErro: boolean
  erro: Error | null
}

/**
 * Error Boundary para isolar falhas de componentes.
 *
 * Envolva qualquer componente que faz fetch em um ErrorBoundary.
 * Sem ele, um erro em runtime derruba a página inteira.
 *
 * @example
 * <ErrorBoundary>
 *   <TabelaRecursos />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { temErro: false, erro: null }

  static getDerivedStateFromError(erro: Error): ErrorBoundaryState {
    return { temErro: true, erro }
  }

  componentDidCatch(erro: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', erro, info.componentStack)
    Sentry.captureException(erro, {
      contexts: {
        react: { componentStack: info.componentStack },
      },
    })
  }

  reiniciar = () => {
    this.setState({ temErro: false, erro: null })
  }

  render() {
    if (this.state.temErro) {
      if (this.props.fallback) return this.props.fallback

      return (
        <VStack align="items-center" justify="justify-center" className="py-12 gap-3 text-center">
          <AlertTriangle className="size-8 text-warning-500" strokeWidth={1.5} />
          <Text className="text-sm text-typography-600 dark:text-typography-400">
            Ocorreu um erro ao carregar este conteúdo.
          </Text>
          <Button variant="outline" size="sm" onClick={this.reiniciar}>
            Tentar novamente
          </Button>
        </VStack>
      )
    }

    return this.props.children
  }
}
