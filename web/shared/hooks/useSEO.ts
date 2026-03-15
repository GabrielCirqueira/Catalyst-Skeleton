import { useEffect } from 'react'

interface UseSEOProps {
  /** Título da página — aparece na aba do browser */
  title: string
  /** Descrição da página — 150–160 caracteres */
  description: string
  /** Palavras-chave separadas por vírgula — 5–10 termos */
  keywords: string
  /** true para páginas que não devem ser indexadas (rotas autenticadas) */
  noindex?: boolean
  /** Dado estruturado Schema.org (JSON-LD) */
  jsonLd?: Record<string, unknown>
}

/**
 * Configura as metatags de SEO da página.
 *
 * DEVE ser a primeira chamada dentro de Component(), antes de qualquer return.
 *
 * @example
 * export function Component() {
 *   useSEO({
 *     title: 'Dashboard — Catalyst',
 *     description: 'Visão geral das métricas e indicadores principais do sistema.',
 *     keywords: 'dashboard, métricas, indicadores',
 *     noindex: true,
 *   })
 *   return <AppContainer>...</AppContainer>
 * }
 */
export function useSEO({ title, description, keywords, noindex = false, jsonLd }: UseSEOProps) {
  useEffect(() => {
    document.title = title

    setMeta('description', description)
    setMeta('keywords', keywords)

    if (noindex) {
      setMeta('robots', 'noindex, nofollow')
    } else {
      setMeta('robots', 'index, follow')
    }

    setMetaProperty('og:title', title)
    setMetaProperty('og:description', description)

    if (jsonLd) {
      const existing = document.getElementById('json-ld-schema')
      if (existing) {
        existing.textContent = JSON.stringify(jsonLd)
      } else {
        const script = document.createElement('script')
        script.id = 'json-ld-schema'
        script.type = 'application/ld+json'
        script.textContent = JSON.stringify(jsonLd)
        document.head.appendChild(script)
      }
    }

    return () => {
      const script = document.getElementById('json-ld-schema')
      if (script) script.remove()
    }
  }, [title, description, keywords, noindex, jsonLd])
}

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setMetaProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}
