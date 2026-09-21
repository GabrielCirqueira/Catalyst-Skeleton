import { api } from '@/config/api'
import { useAuthStore } from '@/stores'
import { toast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import type { RespostaApi } from '@/shared/types/api'
import type {
  CadastroInput,
  LoginInput,
  RespostaCadastro,
  RespostaLogin,
  RespostaMe,
} from './types'

export function useLogin() {
  const { setAutenticado } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: LoginInput): Promise<void> => {
      const { data: loginData } = await api.post<RespostaLogin>('/api/v1/auth/login', {
        username: input.username,
        senha: input.senha,
      })

      const { data: meResposta } = await api.get<RespostaApi<RespostaMe>>('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      })
      const meData = meResposta.data

      setAutenticado(
        {
          id: meData.id,
          nomeCompleto: meData.nomeCompleto,
          username: meData.username,
          roles: meData.roles,
          criadoEm: meData.criadoEm,
        },
        loginData.token,
        loginData.refresh_token
      )
    },
    onSuccess: () => {
      toast.success('Bem-vindo de volta!')
      navigate('/app')
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.danger('Usuário ou senha incorretos.')
      } else {
        toast.danger('Falha ao fazer login. Tente novamente.')
      }
    },
  })
}

export function useCadastro() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: CadastroInput): Promise<RespostaCadastro> => {
      const { data } = await api.post<RespostaCadastro>('/api/v1/auth/registro', {
        nomeCompleto: input.nomeCompleto,
        username: input.username,
        senha: input.senha,
      })
      return data
    },
    onSuccess: () => {
      toast.success('Cadastro realizado! Faça login para continuar.')
      navigate('/login')
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.danger('Este nome de usuário já está em uso.')
      } else if (axios.isAxiosError(err) && err.response?.status === 422) {
        toast.danger('Corrija os campos e tente novamente.')
      } else {
        toast.danger('Falha no cadastro. Tente novamente.')
      }
    },
  })
}
