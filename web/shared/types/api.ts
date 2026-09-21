export interface RespostaApi<T> {
  success: boolean
  data: T
}

export interface RespostaErro {
  success: false
  error: string
  details?: Record<string, string>
}

export interface RespostaPaginada<T> {
  success: boolean
  data: T[]
  total: number
  pagina: number
  porPagina: number
}
