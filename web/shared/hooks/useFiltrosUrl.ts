import { useSearchParams } from 'react-router-dom'

/**
 * Gerencia filtros e paginação via URL (useSearchParams).
 *
 * Filtros na URL tornam links compartilháveis, fazem o botão voltar funcionar
 * e sobrevivem a um refresh de página.
 *
 * @example
 * const { pagina, busca, status, atualizarFiltros } = useFiltrosUrl()
 * atualizarFiltros({ busca: 'texto', pagina: 1 })
 */
export function useFiltrosUrl() {
  const [params, setParams] = useSearchParams()

  const pagina = Number(params.get('pagina') ?? 1)
  const busca = params.get('busca') ?? ''
  const status = params.get('status') ?? ''

  function atualizarFiltros(novos: Record<string, string | number | undefined>) {
    setParams((prev) => {
      const next = new URLSearchParams(prev)

      Object.entries(novos).forEach(([k, v]) => {
        if (v !== undefined && v !== '') {
          next.set(k, String(v))
        } else {
          next.delete(k)
        }
      })

      if (!('pagina' in novos)) {
        next.set('pagina', '1')
      }

      return next
    })
  }

  function limparFiltros() {
    setParams({})
  }

  return { pagina, busca, status, atualizarFiltros, limparFiltros }
}