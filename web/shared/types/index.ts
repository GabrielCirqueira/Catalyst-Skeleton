/**
 * Interfaces globais compartilhadas entre múltiplas features.
 *
 * Tipos exclusivos de uma feature ficam em web/features/{feature}/types.ts
 */

export interface Usuario {
  uuid: string
  nome: string
  email: string
  criadoEm: string
  atualizadoEm: string
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
