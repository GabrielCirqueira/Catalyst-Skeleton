import { useEffect, useState } from 'react'

/**
 * Detecta se a viewport corresponde à media query fornecida.
 *
 * Usado para alternar entre Dialog (desktop) e Drawer (mobile).
 *
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)')
 * return isDesktop ? <Dialog>...</Dialog> : <Drawer>...</Drawer>
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}
