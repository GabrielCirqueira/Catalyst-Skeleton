import { useEffect, useRef, useState } from 'react'

/**
 * Adia a atualização de um valor por um tempo de espera.
 * Ideal para campos de busca — evita requisição a cada caractere digitado.
 *
 * @example
 * const buscaDebounced = useDebounce(busca, 400)
 * useEffect(() => { fetch(buscaDebounced) }, [buscaDebounced])
 */
export function useDebounce<T>(valor: T, espera = 400): T {
  const [valorDebounced, setValorDebounced] = useState(valor)

  useEffect(() => {
    const timer = setTimeout(() => setValorDebounced(valor), espera)
    return () => clearTimeout(timer)
  }, [valor, espera])

  return valorDebounced
}

/**
 * Valor estável que não muda entre renders (útil para memoização de callbacks).
 */
export function useLatest<T>(valor: T) {
  const ref = useRef(valor)
  ref.current = valor
  return ref
}
