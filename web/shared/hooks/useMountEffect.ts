import { useEffect, useRef } from 'react'

/**
 * Hook para executar um efeito apenas uma vez quando o componente é montado.
 * Abstração recomendada em vez do uso direto de useEffect([], ...).
 * 
 * @param effect A função de efeito a ser executada.
 */
export function useMountEffect(effect: () => void | (() => void)) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Este hook é intencionalmente para montagem
  useEffect(effect, [])
}

/**
 * Hook que executa um efeito sempre que as dependências mudarem,
 * MAS pula a primeira execução (montagem).
 */
export function useUpdateEffect(effect: () => void | (() => void), deps: unknown[]) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    return effect()
    // biome-ignore lint/correctness/useExhaustiveDependencies: O comportamento de skip é desejado
  }, deps)
}
