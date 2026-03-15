import type { Usuario } from '@/shared/types'

export interface LoginInput {
  username: string
  senha: string
}

export interface CadastroInput {
  nomeCompleto: string
  username: string
  senha: string
  confirmacaoSenha: string
}

export interface RespostaLogin {
  token: string
  refresh_token: string
}

export interface RespostaRefresh {
  token: string
  refresh_token: string
}

export interface RespostaCadastro {
  sucesso: boolean
  mensagem: string
}

export interface RespostaMe {
  id: number
  nomeCompleto: string
  username: string
  roles: string[]
  criadoEm: string
}

export type UsuarioAuth = Usuario
