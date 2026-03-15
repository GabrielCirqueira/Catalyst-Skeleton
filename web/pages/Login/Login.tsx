import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@shadcn/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shadcn/form'
import { Input } from '@shadcn/input'
import { Spinner } from '@shadcn/spinner'
import { useLogin } from '@features/auth'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(1, 'Informe o nome de usuário.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

type FormValues = z.infer<typeof schema>

export function Component() {
  const login = useLogin()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', senha: '' },
  })

  function onSubmit(values: FormValues) {
    login.mutate(values)
  }

  return (
    <Card className="w-full shadow-hard-2">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-heading font-bold text-center">Entrar</CardTitle>
        <CardDescription className="text-center">
          Acesse sua conta com seu usuário e senha
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário</FormLabel>
                  <FormControl>
                    <Input placeholder="seu.usuario" autoComplete="username" autoFocus {...field} />
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
                      placeholder="••••••••"
                      autoComplete="current-password"
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
              disabled={login.isPending}
            >
              {login.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Entrando…
                </span>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-typography-500 dark:text-typography-400">
          Não tem uma conta?{' '}
          <Link
            to="/cadastro"
            className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
