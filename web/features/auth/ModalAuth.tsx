import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { Code2, Eye, EyeOff, KeyRound, User, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useMediaQuery } from '@/shared/hooks'
import { api } from '@config/api'
import { Button } from '@shadcn/button'
import { Dialog, DialogContent } from '@shadcn/dialog'
import { Drawer, DrawerContent } from '@shadcn/drawer'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shadcn/form'
import { Input } from '@shadcn/input'
import { Separator } from '@shadcn/separator'
import { Spinner } from '@shadcn/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/tabs'
import { useAuthStore } from '@stores'
import type { RespostaCadastro, RespostaLogin, RespostaMe } from './types'

const loginSchema = z.object({
  username: z.string().min(1, 'Informe o nome de usuário.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

const cadastroSchema = z
  .object({
    nomeCompleto: z.string().min(3, 'O nome deve ter ao menos 3 caracteres.').max(255),
    username: z
      .string()
      .min(3, 'O usuário deve ter ao menos 3 caracteres.')
      .max(100)
      .regex(/^[a-zA-Z0-9._-]+$/, 'Só letras, números, pontos, hífens e underscores.'),
    senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
    confirmacaoSenha: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((d) => d.senha === d.confirmacaoSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmacaoSenha'],
  })

type LoginValues = z.infer<typeof loginSchema>
type CadastroValues = z.infer<typeof cadastroSchema>

function SenhaInput({ placeholder, className, ...props }: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-typography-400" />
      <Input
        {...props}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={`h-10 pl-9 pr-10 ${className ?? ''}`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-typography-400 transition-colors hover:text-typography-950 dark:hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

interface ModalAuthProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'cadastro'
}

function FormLogin({ onSuccess }: { onSuccess: () => void }) {
  const { setAutenticado } = useAuthStore()

  const mutation = useMutation({
    mutationFn: async (values: LoginValues) => {
      const { data: loginData } = await api.post<RespostaLogin>('/api/auth/login', {
        username: values.username,
        senha: values.senha,
      })
      const { data: me } = await api.get<RespostaMe>('/api/auth/me', {
        headers: { Authorization: `Bearer ${loginData.token}` },
      })
      return { token: loginData.token, refreshToken: loginData.refresh_token, me }
    },
    onSuccess: ({ token, refreshToken, me }) => {
      setAutenticado(
        {
          id: me.id,
          nomeCompleto: me.nomeCompleto,
          username: me.username,
          roles: me.roles,
          criadoEm: me.criadoEm,
        },
        token,
        refreshToken
      )
      toast.success(`Bem-vindo, ${me.nomeCompleto.split(' ')[0]}!`)
      onSuccess()
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        toast.error('Usuário ou senha incorretos.')
      } else {
        toast.error('Falha ao fazer login. Tente novamente.')
      }
    },
  })

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', senha: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-typography-950 dark:text-white">
                Usuário
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-typography-400" />
                  <Input
                    placeholder="seu.usuario"
                    autoComplete="username"
                    className="h-10 pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-error-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-typography-950 dark:text-white">
                Senha
              </FormLabel>
              <FormControl>
                <SenhaInput placeholder="••••••••" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage className="text-xs text-error-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-2 h-10 w-full bg-brand-500 font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:ring-brand-500/50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Spinner className="size-4" /> Entrando…
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>
    </Form>
  )
}

function FormCadastro({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useMutation({
    mutationFn: async (values: CadastroValues): Promise<RespostaCadastro> => {
      const { data } = await api.post<RespostaCadastro>('/api/auth/registro', {
        nomeCompleto: values.nomeCompleto,
        username: values.username,
        senha: values.senha,
      })
      return data
    },
    onSuccess: () => {
      toast.success('Conta criada! Faça login para continuar.')
      onSuccess()
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

  const form = useForm<CadastroValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { nomeCompleto: '', username: '', senha: '', confirmacaoSenha: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="nomeCompleto"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-typography-950 dark:text-white">
                Nome completo
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <UserPlus className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-typography-400" />
                  <Input
                    placeholder="João da Silva"
                    autoComplete="name"
                    className="h-10 pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-error-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-typography-950 dark:text-white">
                Usuário
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-typography-400" />
                  <Input
                    placeholder="joao.silva"
                    autoComplete="username"
                    className="h-10 pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs text-error-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="senha"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-typography-950 dark:text-white">
                Senha
              </FormLabel>
              <FormControl>
                <SenhaInput
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs text-error-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmacaoSenha"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-typography-950 dark:text-white">
                Confirmar senha
              </FormLabel>
              <FormControl>
                <SenhaInput placeholder="Repita a senha" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage className="text-xs text-error-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-2 h-10 w-full bg-brand-500 font-semibold text-white shadow-sm hover:bg-brand-600 focus-visible:ring-brand-500/50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Spinner className="size-4" /> Criando conta…
            </>
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
    </Form>
  )
}

function ConteudoAuth({
  tab,
  setTab,
  onClose,
}: {
  tab: 'login' | 'cadastro'
  setTab: (v: 'login' | 'cadastro') => void
  onClose: () => void
}) {
  return (
    <>
      <div className="relative overflow-hidden border-b border-outline-100 bg-background-50 px-8 pb-0 pt-8 dark:border-outline-900 dark:bg-background-800">
        <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-brand-500/[0.08] blur-[64px]" />

        <div className="relative">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500/10">
              <Code2 className="size-5 text-brand-600 dark:text-brand-400" strokeWidth={2} />
            </div>
            <span className="font-poppins text-base font-bold tracking-tight text-typography-950 dark:text-white">
              Catalyst
            </span>
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            {tab === 'login' ? 'Acesso à plataforma' : 'Novo cadastro'}
          </span>
          <h2 className="mt-1 font-poppins text-2xl font-black tracking-tight text-typography-950 dark:text-white">
            {tab === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h2>
          <p className="mb-5 mt-1.5 text-sm text-typography-600 dark:text-typography-400">
            {tab === 'login'
              ? 'Insira seus dados para continuar'
              : 'Preencha os dados abaixo para começar'}
          </p>
        </div>

        <TabsList className="-mb-px h-auto w-full gap-0 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="login"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-0 text-sm font-medium text-typography-500 shadow-none transition-all hover:text-typography-950 dark:text-typography-400 dark:hover:text-white data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none dark:data-[state=active]:border-brand-400 dark:data-[state=active]:text-brand-400"
          >
            Entrar
          </TabsTrigger>
          <TabsTrigger
            value="cadastro"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent pb-3 pt-0 text-sm font-medium text-typography-500 shadow-none transition-all hover:text-typography-950 dark:text-typography-400 dark:hover:text-white data-[state=active]:border-brand-600 data-[state=active]:bg-transparent data-[state=active]:text-brand-600 data-[state=active]:shadow-none dark:data-[state=active]:border-brand-400 dark:data-[state=active]:text-brand-400"
          >
            Criar conta
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="login" className="mt-0 px-8 pb-8 pt-6">
        <FormLogin onSuccess={onClose} />
        <div className="mt-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-typography-400">ou</span>
          <Separator className="flex-1" />
        </div>
        <p className="mt-4 text-center text-sm text-typography-600 dark:text-typography-400">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={() => setTab('cadastro')}
            className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Criar conta
          </button>
        </p>
      </TabsContent>

      <TabsContent value="cadastro" className="mt-0 px-8 pb-8 pt-6">
        <FormCadastro onSuccess={() => setTab('login')} />
        <div className="mt-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-typography-400">ou</span>
          <Separator className="flex-1" />
        </div>
        <p className="mt-4 text-center text-sm text-typography-600 dark:text-typography-400">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => setTab('login')}
            className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-300"
          >
            Fazer login
          </button>
        </p>
      </TabsContent>
    </>
  )
}

export function ModalAuth({ open, onOpenChange, defaultTab = 'login' }: ModalAuthProps) {
  const [tab, setTab] = useState<'login' | 'cadastro'>(defaultTab)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const handleOpenChange = (value: boolean) => {
    if (value) setTab(defaultTab)
    onOpenChange(value)
  }

  const conteudo = (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'cadastro')} className="w-full">
      <ConteudoAuth tab={tab} setTab={setTab} onClose={() => onOpenChange(false)} />
    </Tabs>
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 overflow-hidden rounded-2xl border border-outline-100 p-0 sm:max-w-[440px] dark:border-outline-900">
          {conteudo}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="overflow-hidden rounded-t-2xl border-x-0 border-t border-outline-100 dark:border-outline-900">
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-background-200 dark:bg-background-700" />
        {conteudo}
      </DrawerContent>
    </Drawer>
  )
}
