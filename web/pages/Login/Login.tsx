import { useLogin } from '@features/auth'
import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(1, 'Informe o nome de usuário.'),
  senha: z.string().min(1, 'Informe a senha.'),
})

export function Component() {
  const login = useLogin()
  const [form, setForm] = useState({ username: '', senha: '' })
  const [erros, setErros] = useState<Record<string, string>>({})

  function handleChange(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErros((prev) => ({ ...prev, [campo]: '' }))
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = schema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErros(fieldErrors)
      return
    }
    login.mutate(result.data)
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="flex flex-col items-center gap-1 pb-0 pt-6">
        <h1 className="text-2xl font-bold font-sans">Entrar</h1>
        <p className="text-sm text-default-500 text-center">
          Acesse sua conta com seu usuário e senha
        </p>
      </CardHeader>

      <CardBody className="px-6 py-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Usuário"
            placeholder="seu.usuario"
            value={form.username}
            onValueChange={(v) => handleChange('username', v)}
            isInvalid={!!erros.username}
            errorMessage={erros.username}
            autoComplete="username"
            autoFocus
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={form.senha}
            onValueChange={(v) => handleChange('senha', v)}
            isInvalid={!!erros.senha}
            errorMessage={erros.senha}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            color="primary"
            className="w-full font-semibold"
            isLoading={login.isPending}
          >
            Entrar
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-default-500">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
