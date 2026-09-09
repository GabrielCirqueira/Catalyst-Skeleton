import { addToast } from '@heroui/react'
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
} from '@heroui/react'
import { api } from '@config/api'
import { useAuthStore } from '@stores'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Code2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import type { CadastroInput, LoginInput, RespostaCadastro, RespostaLogin, RespostaMe } from './types'

const loginSchema = z.object({
  username: z.string().min(1, 'Informe o usuário.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

const cadastroSchema = z
  .object({
    nomeCompleto: z.string().min(3, 'Mínimo 3 caracteres.'),
    username: z.string().min(3, 'Mínimo 3 caracteres.').regex(/^[a-zA-Z0-9._-]+$/),
    senha: z.string().min(8, 'Mínimo 8 caracteres.'),
    confirmacaoSenha: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((d) => d.senha === d.confirmacaoSenha, {
    message: 'Senhas não coincidem.',
    path: ['confirmacaoSenha'],
  })

interface ModalAuthProps {
  isOpen: boolean
  onClose: () => void
}

export function ModalAuth({ isOpen, onClose }: ModalAuthProps) {
  const { setAutenticado } = useAuthStore()

  // ─── Login ─────────────────────────────────────────────────────────────────
  const [loginForm, setLoginForm] = useState<LoginInput>({ username: '', senha: '' })
  const [loginErros, setLoginErros] = useState<Record<string, string>>({})

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data: loginData } = await api.post<RespostaLogin>('/api/v1/auth/login', input)
      const { data: meData } = await api.get<RespostaMe>('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      })
      setAutenticado(
        { id: meData.id, nomeCompleto: meData.nomeCompleto, username: meData.username, roles: meData.roles, criadoEm: meData.criadoEm },
        loginData.token,
        loginData.refresh_token
      )
    },
    onSuccess: () => {
      addToast({ title: 'Bem-vindo!', color: 'success' })
      onClose()
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        addToast({ title: 'Usuário ou senha incorretos.', color: 'danger' })
      } else {
        addToast({ title: 'Falha ao entrar. Tente novamente.', color: 'danger' })
      }
    },
  })

  function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = loginSchema.safeParse(loginForm)
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const issue of result.error.issues) errs[issue.path[0] as string] = issue.message
      setLoginErros(errs)
      return
    }
    loginMutation.mutate(result.data)
  }

  // ─── Cadastro ──────────────────────────────────────────────────────────────
  const [cadastroForm, setCadastroForm] = useState<CadastroInput>({
    nomeCompleto: '', username: '', senha: '', confirmacaoSenha: '',
  })
  const [cadastroErros, setCadastroErros] = useState<Record<string, string>>({})

  const cadastroMutation = useMutation({
    mutationFn: async (input: CadastroInput): Promise<RespostaCadastro> => {
      const { data } = await api.post<RespostaCadastro>('/api/v1/auth/registro', input)
      return data
    },
    onSuccess: () => {
      addToast({ title: 'Conta criada! Faça login.', color: 'success' })
      onClose()
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        addToast({ title: 'Usuário já existe.', color: 'danger' })
      } else {
        addToast({ title: 'Falha no cadastro. Tente novamente.', color: 'danger' })
      }
    },
  })

  function handleCadastroSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = cadastroSchema.safeParse(cadastroForm)
    if (!result.success) {
      const errs: Record<string, string> = {}
      for (const issue of result.error.issues) errs[issue.path[0] as string] = issue.message
      setCadastroErros(errs)
      return
    }
    cadastroMutation.mutate(result.data)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="size-4 text-white" strokeWidth={2.5} />
          </div>
          Catalyst Skeleton
        </ModalHeader>
        <ModalBody className="pb-6">
          <Tabs fullWidth aria-label="Autenticação">
            <Tab key="login" title="Entrar">
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3 pt-2" noValidate>
                <Input
                  label="Usuário"
                  value={loginForm.username}
                  onValueChange={(v) => { setLoginForm((p) => ({ ...p, username: v })); setLoginErros((p) => ({ ...p, username: '' })) }}
                  isInvalid={!!loginErros.username}
                  errorMessage={loginErros.username}
                  autoFocus
                />
                <Input
                  label="Senha"
                  type="password"
                  value={loginForm.senha}
                  onValueChange={(v) => { setLoginForm((p) => ({ ...p, senha: v })); setLoginErros((p) => ({ ...p, senha: '' })) }}
                  isInvalid={!!loginErros.senha}
                  errorMessage={loginErros.senha}
                />
                <Button type="submit" color="primary" isLoading={loginMutation.isPending} className="mt-1">
                  Entrar
                </Button>
              </form>
            </Tab>
            <Tab key="cadastro" title="Criar conta">
              <form onSubmit={handleCadastroSubmit} className="flex flex-col gap-3 pt-2" noValidate>
                <Input label="Nome completo" value={cadastroForm.nomeCompleto} onValueChange={(v) => { setCadastroForm((p) => ({ ...p, nomeCompleto: v })); setCadastroErros((p) => ({ ...p, nomeCompleto: '' })) }} isInvalid={!!cadastroErros.nomeCompleto} errorMessage={cadastroErros.nomeCompleto} />
                <Input label="Usuário" value={cadastroForm.username} onValueChange={(v) => { setCadastroForm((p) => ({ ...p, username: v })); setCadastroErros((p) => ({ ...p, username: '' })) }} isInvalid={!!cadastroErros.username} errorMessage={cadastroErros.username} />
                <Input label="Senha" type="password" value={cadastroForm.senha} onValueChange={(v) => { setCadastroForm((p) => ({ ...p, senha: v })); setCadastroErros((p) => ({ ...p, senha: '' })) }} isInvalid={!!cadastroErros.senha} errorMessage={cadastroErros.senha} />
                <Input label="Confirmar senha" type="password" value={cadastroForm.confirmacaoSenha} onValueChange={(v) => { setCadastroForm((p) => ({ ...p, confirmacaoSenha: v })); setCadastroErros((p) => ({ ...p, confirmacaoSenha: '' })) }} isInvalid={!!cadastroErros.confirmacaoSenha} errorMessage={cadastroErros.confirmacaoSenha} />
                <Button type="submit" color="primary" isLoading={cadastroMutation.isPending} className="mt-1">
                  Criar conta
                </Button>
              </form>
            </Tab>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
