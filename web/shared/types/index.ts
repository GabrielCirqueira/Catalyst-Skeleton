/**
 * Interfaces globais compartilhadas entre múltiplas features.
 *
 * Tipos exclusivos de uma feature ficam em web/features/{feature}/types.ts
 */

export interface Usuario {
  id: number
  nomeCompleto: string
  username: string
  roles: string[]
  criadoEm: string
}

export interface Paginacao {
  pagina: number
  porPagina: number
  total: number
  totalPaginas: number
}

export interface FiltrosBase {
  pagina?: number
  porPagina?: number
  busca?: string
}
