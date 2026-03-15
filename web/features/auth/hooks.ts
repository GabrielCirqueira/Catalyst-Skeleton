import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'
import { api } from '@config/api'
import { useAuthStore } from '@stores'
import type {
  LoginInput,
  CadastroInput,
  RespostaLogin,
  RespostaCadastro,
  RespostaMe,
} from './types'

export function useLogin() {
  const { setAutenticado } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: LoginInput): Promise<void> => {
      const { data: loginData } = await api.post<RespostaLogin>('/api/auth/login', {
        username: input.username,
        senha: input.senha,
      })

      const { data: meData } = await api.get<RespostaMe>('/api/auth/me', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      })

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
      navigate('/dashboard')
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error('Usuário ou senha incorretos.')
      } else {
        toast.error('Falha ao fazer login. Tente novamente.')
      }
    },
  })
}

export function useCadastro() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: CadastroInput): Promise<RespostaCadastro> => {
      const { data } = await api.post<RespostaCadastro>('/api/auth/registro', {
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
        toast.error('Este nome de usuário já está em uso.')
      } else if (axios.isAxiosError(err) && err.response?.status === 422) {
        toast.error('Corrija os campos destacados e tente novamente.')
      } else {
        toast.error('Falha no cadastro. Tente novamente.')
      }
    },
  })
}
