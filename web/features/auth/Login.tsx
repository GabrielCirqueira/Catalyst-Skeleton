import { useLogin } from '@/features/auth'
import { Text } from '@/shared/ui/layout'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  FieldError,
  Input,
  Label,
  TextField,
} from '@heroui/react'
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
        <Text as="h1" className="text-2xl font-bold font-sans">Entrar</Text>
        <Text className="text-sm text-center text-muted">Acesse sua conta com seu usuário e senha</Text>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <TextField isInvalid={!!erros.username}>
            <Label className="text-sm font-medium">Usuário</Label>
            <Input
              placeholder="seu.usuario"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              autoComplete="username"
              autoFocus
              className="w-full"
            />
            <FieldError className="text-xs text-danger">{erros.username}</FieldError>
          </TextField>

          <TextField isInvalid={!!erros.senha}>
            <Label className="text-sm font-medium">Senha</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              autoComplete="current-password"
              className="w-full"
            />
            <FieldError className="text-xs text-danger">{erros.senha}</FieldError>
          </TextField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="font-semibold"
            isPending={login.isPending}
            isDisabled={login.isPending}
          >
            Entrar
          </Button>
        </form>

        <Text className="mt-5 text-center text-sm text-muted">
          Não tem uma conta?{' '}
          <Link to="/cadastro" className="font-medium text-accent hover:underline">
            Criar conta
          </Link>
        </Text>
      </CardContent>
    </Card>
  )
}
