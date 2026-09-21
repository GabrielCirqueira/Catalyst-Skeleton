import { api } from '@/config/api'
import { Box } from '@/shared/ui/layout'
import { useAuthStore } from '@/stores'
import { toast } from '@heroui/react'
import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  Tab,
  TabList,
  TabListContainer,
  TabPanel,
  Tabs,
  TextField,
} from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Code2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import type { RespostaApi } from '@/shared/types/api'
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
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <ModalBackdrop isDismissable>
        <ModalContainer placement="center" size="sm">
          <ModalDialog>
            <ModalHeader className="flex items-center gap-2">
              <Box className="size-7 rounded-lg bg-accent flex items-center justify-center">
                <Code2 className="size-4 text-white" strokeWidth={2.5} />
              </Box>
              <ModalHeading>Catalyst Skeleton</ModalHeading>
            </ModalHeader>

            <ModalBody className="pb-6">
              <Tabs>
                <TabListContainer>
                  <TabList>
                    <Tab id="login">Entrar</Tab>
                    <Tab id="cadastro">Criar conta</Tab>
                  </TabList>
                </TabListContainer>

                <TabPanel id="login">
                  <form
                    onSubmit={handleLoginSubmit}
                    className="flex flex-col gap-3 pt-2"
                    noValidate
                  >
                    <TextField isInvalid={!!loginErros.username}>
                      <Label className="text-sm font-medium">Usuário</Label>
                      <Input
                        value={loginForm.username}
                        onChange={(e) => {
                          setLoginForm((p) => ({ ...p, username: e.target.value }))
                          setLoginErros((p) => ({ ...p, username: '' }))
                        }}
                        autoFocus
                        className="w-full"
                      />
                      <FieldError className="text-xs text-danger">{loginErros.username}</FieldError>
                    </TextField>

                    <TextField isInvalid={!!loginErros.senha}>
                      <Label className="text-sm font-medium">Senha</Label>
                      <Input
                        type="password"
                        value={loginForm.senha}
                        onChange={(e) => {
                          setLoginForm((p) => ({ ...p, senha: e.target.value }))
                          setLoginErros((p) => ({ ...p, senha: '' }))
                        }}
                        className="w-full"
                      />
                      <FieldError className="text-xs text-danger">{loginErros.senha}</FieldError>
                    </TextField>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isPending={loginMutation.isPending}
                      isDisabled={loginMutation.isPending}
                      className="mt-1"
                    >
                      Entrar
                    </Button>
                  </form>
                </TabPanel>

                <TabPanel id="cadastro">
                  <form
                    onSubmit={handleCadastroSubmit}
                    className="flex flex-col gap-3 pt-2"
                    noValidate
                  >
                    <TextField isInvalid={!!cadastroErros.nomeCompleto}>
                      <Label className="text-sm font-medium">Nome completo</Label>
                      <Input
                        value={cadastroForm.nomeCompleto}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, nomeCompleto: e.target.value }))
                          setCadastroErros((p) => ({ ...p, nomeCompleto: '' }))
                        }}
                        className="w-full"
                      />
                      <FieldError className="text-xs text-danger">
                        {cadastroErros.nomeCompleto}
                      </FieldError>
                    </TextField>

                    <TextField isInvalid={!!cadastroErros.username}>
                      <Label className="text-sm font-medium">Usuário</Label>
                      <Input
                        value={cadastroForm.username}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, username: e.target.value }))
                          setCadastroErros((p) => ({ ...p, username: '' }))
                        }}
                        className="w-full"
                      />
                      <FieldError className="text-xs text-danger">
                        {cadastroErros.username}
                      </FieldError>
                    </TextField>

                    <TextField isInvalid={!!cadastroErros.senha}>
                      <Label className="text-sm font-medium">Senha</Label>
                      <Input
                        type="password"
                        value={cadastroForm.senha}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, senha: e.target.value }))
                          setCadastroErros((p) => ({ ...p, senha: '' }))
                        }}
                        className="w-full"
                      />
                      <FieldError className="text-xs text-danger">{cadastroErros.senha}</FieldError>
                    </TextField>

                    <TextField isInvalid={!!cadastroErros.confirmacaoSenha}>
                      <Label className="text-sm font-medium">Confirmar senha</Label>
                      <Input
                        type="password"
                        value={cadastroForm.confirmacaoSenha}
                        onChange={(e) => {
                          setCadastroForm((p) => ({ ...p, confirmacaoSenha: e.target.value }))
                          setCadastroErros((p) => ({ ...p, confirmacaoSenha: '' }))
                        }}
                        className="w-full"
                      />
                      <FieldError className="text-xs text-danger">
                        {cadastroErros.confirmacaoSenha}
                      </FieldError>
                    </TextField>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isPending={cadastroMutation.isPending}
                      isDisabled={cadastroMutation.isPending}
                      className="mt-1"
                    >
                      Criar conta
                    </Button>
                  </form>
                </TabPanel>
              </Tabs>
            </ModalBody>
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </Modal>
  )
}