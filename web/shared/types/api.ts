/**
 * Envelope padrão de resposta da API.
 * Todos os endpoints retornam esta estrutura.
 */
export interface RespostaApi<T> {
  sucesso: boolean
  mensagem: string
  dados: T
}

/**
 * Envelope de resposta paginada.
 * Endpoints de listagem com paginação retornam esta estrutura.
 */
export interface RespostaPaginada<T> extends RespostaApi<T[]> {
  total: number
  pagina: number
  porPagina: number
}
