import { api } from '@/config/api'
import type { RespostaApi } from '@/shared/types/api'
import { toast } from '@/shared/ui/toaster'
import { useAuthStore } from '@/stores'
import { Button, Center, Dialog, Field, Input, Portal, Stack, Tabs } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Code2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import type {
  CadastroInput,
  LoginInput,
  RespostaCadastro,
  RespostaLogin,
  RespostaMe,
} from './types'

const loginSchema = z.object({
  username: z.string().min(1, 'Informe o usuário.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

const cadastroSchema = z
  .object({
    nomeCompleto: z.string().min(3, 'Mínimo 3 caracteres.'),
    username: z
      .string()
      .min(3, 'Mínimo 3 caracteres.')
      .regex(/^[a-zA-Z0-9._-]+$/),
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

  const [loginForm, setLoginForm] = useState<LoginInput>({ username: '', senha: '' })
  const [loginErros, setLoginErros] = useState<Record<string, string>>({})

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data: loginData } = await api.post<RespostaLogin>('/api/v1/auth/login', input)
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
      toast.success('Bem-vindo!')
      onClose()
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.danger('Usuário ou senha incorretos.')
      } else {
        toast.danger('Falha ao entrar. Tente novamente.')
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

  const [cadastroForm, setCadastroForm] = useState<CadastroInput>({
    nomeCompleto: '',
    username: '',
    senha: '',
    confirmacaoSenha: '',
  })
  const [cadastroErros, setCadastroErros] = useState<Record<string, string>>({})

  const cadastroMutation = useMutation({
    mutationFn: async (input: CadastroInput): Promise<RespostaCadastro> => {
      const { data } = await api.post<RespostaCadastro>('/api/v1/auth/registro', input)
      return data
    },
    onSuccess: () => {
      toast.success('Conta criada! Faça login.')
      onClose()
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.danger('Usuário já existe.')
      } else {
        toast.danger('Falha no cadastro. Tente novamente.')
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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(detalhes) => {
        if (!detalhes.open) onClose()
      }}
      placement="center"
      size="sm"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Center boxSize="7" rounded="lg" bg="brand.solid">
                <Code2 size={16} color="white" strokeWidth={2.5} />
              </Center>
              <Dialog.Title>Catalyst Skeleton</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pb="6">
              <Tabs.Root defaultValue="login">
                <Tabs.List>
                  <Tabs.Trigger value="login">Entrar</Tabs.Trigger>
                  <Tabs.Trigger value="cadastro">Criar conta</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="login">
                  <Stack as="form" gap="3" pt="2" onSubmit={handleLoginSubmit}>
                    <Field.Root invalid={!!loginErros.username}>
                      <Field.Label>Usuário</Field.Label>
                      <Input
                        value={loginForm.username}
                        onChange={(e) => {
                          setLoginForm((p) => ({ ...p, username: e.target.value }))
                          setLoginErros((p) => ({ ...p, username: '' }))
                        }}
                        autoFocus
                      />
                      <Field.ErrorText>{loginErros.username}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!loginErros.senha}>
                      <Field.Label>Senha</Field.Label>
                      <Input
                        type="password"
                        value={loginForm.senha}
                        onChange={(e) => {
                          setLoginForm((p) => ({ ...p, senha: e.target.value }))
                          setLoginErros((p) => ({ ...p, senha: '' }))
                        }}
                      />
                      <Field.ErrorText>{loginErros.senha}</Field.ErrorText>
                    </Field.Root>

                    <Button
                      type="submit"
                      colorPalette="brand"
                      width="full"
                      loading={loginMutation.isPending}
                      disabled={loginMutation.isPending}
                      mt="1"
                    >
                      Entrar
                    </Button>
                  </Stack>
                </Tabs.Content>

                <Tabs.Content value="cadastro">
                  <Stack as="form" gap="3" pt="2" onSubmit={handleCadastroSubmit}>
                    <Field.Root invalid={!!cadastroErros.nomeCompleto}>
                      <Field.Label>Nome completo</Field.Label>
                      <Input
                        value={cadastroForm.nomeCompleto}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, nomeCompleto: e.target.value }))
                          setCadastroErros((p) => ({ ...p, nomeCompleto: '' }))
                        }}
                      />
                      <Field.ErrorText>{cadastroErros.nomeCompleto}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!cadastroErros.username}>
                      <Field.Label>Usuário</Field.Label>
                      <Input
                        value={cadastroForm.username}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, username: e.target.value }))
                          setCadastroErros((p) => ({ ...p, username: '' }))
                        }}
                      />
                      <Field.ErrorText>{cadastroErros.username}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!cadastroErros.senha}>
                      <Field.Label>Senha</Field.Label>
                      <Input
                        type="password"
                        value={cadastroForm.senha}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, senha: e.target.value }))
                          setCadastroErros((p) => ({ ...p, senha: '' }))
                        }}
                      />
                      <Field.ErrorText>{cadastroErros.senha}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!cadastroErros.confirmacaoSenha}>
                      <Field.Label>Confirmar senha</Field.Label>
                      <Input
                        type="password"
                        value={cadastroForm.confirmacaoSenha}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, confirmacaoSenha: e.target.value }))
                          setCadastroErros((p) => ({ ...p, confirmacaoSenha: '' }))
                        }}
                      />
                      <Field.ErrorText>{cadastroErros.confirmacaoSenha}</Field.ErrorText>
                    </Field.Root>

                    <Button
                      type="submit"
                      colorPalette="brand"
                      width="full"
                      loading={cadastroMutation.isPending}
                      disabled={cadastroMutation.isPending}
                      mt="1"
                    >
                      Criar conta
                    </Button>
                  </Stack>
                </Tabs.Content>
              </Tabs.Root>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
