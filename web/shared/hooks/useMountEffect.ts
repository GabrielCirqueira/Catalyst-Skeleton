import { useEffect, useRef } from 'react'

/**
 * Hook para executar um efeito apenas uma vez quando o componente é montado.
 * Abstração recomendada em vez do uso direto de useEffect([], ...).
 *
 * @param effect A função de efeito a ser executada.
 */
export function useMountEffect(effect: () => undefined | (() => void)) {
  useEffect(effect, []) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook que executa um efeito sempre que as dependências mudarem,
 * MAS pula a primeira execução (montagem).
 */
export function useUpdateEffect(effect: () => undefined | (() => void), deps: unknown[]) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    return effect()
  }, deps)
}
