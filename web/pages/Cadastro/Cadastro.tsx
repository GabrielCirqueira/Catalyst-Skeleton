import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@shadcn/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shadcn/form'
import { Input } from '@shadcn/input'
import { Spinner } from '@shadcn/spinner'
import { useCadastro } from '@features/auth'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

const schema = z
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
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não coincidem.',
    path: ['confirmacaoSenha'],
  })

type FormValues = z.infer<typeof schema>

export function Component() {
  const cadastro = useCadastro()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeCompleto: '',
      username: '',
      senha: '',
      confirmacaoSenha: '',
    },
  })

  function onSubmit(values: FormValues) {
    cadastro.mutate(values)
  }

  return (
    <Card className="w-full shadow-hard-2">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-heading font-bold text-center">Criar conta</CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para se cadastrar
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomeCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" autoComplete="name" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="joao.silva" autoComplete="username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmacaoSenha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repita a senha"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold"
              disabled={cadastro.isPending}
            >
              {cadastro.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Criando conta…
                </span>
              ) : (
                'Criar conta'
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-typography-500 dark:text-typography-400">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline-offset-4 hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
