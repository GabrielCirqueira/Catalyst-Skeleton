import { api } from '@config/api'
import { useAuthStore } from '@stores'
import { addToast } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
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

      const { data: meData } = await api.get<RespostaMe>('/api/v1/auth/me', {
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
      addToast({ title: 'Bem-vindo de volta!', color: 'success' })
      navigate('/app')
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        addToast({ title: 'Usuário ou senha incorretos.', color: 'danger' })
      } else {
        addToast({ title: 'Falha ao fazer login. Tente novamente.', color: 'danger' })
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
      addToast({ title: 'Cadastro realizado! Faça login para continuar.', color: 'success' })
      navigate('/login')
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        addToast({ title: 'Este nome de usuário já está em uso.', color: 'danger' })
      } else if (axios.isAxiosError(err) && err.response?.status === 422) {
        addToast({ title: 'Corrija os campos e tente novamente.', color: 'danger' })
      } else {
        addToast({ title: 'Falha no cadastro. Tente novamente.', color: 'danger' })
      }
    },
  })
}
