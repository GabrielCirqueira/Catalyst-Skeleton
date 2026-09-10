import { useCadastro } from '@/features/auth'
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

const emptyForm: FormValues = {
  nomeCompleto: '',
  username: '',
  senha: '',
  confirmacaoSenha: '',
}

export function Component() {
  const cadastro = useCadastro()
  const [form, setForm] = useState(emptyForm)
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
    cadastro.mutate(result.data)
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="flex flex-col items-center gap-1 pb-0 pt-6">
        <Text as="h1" className="text-2xl font-bold font-sans">Criar conta</Text>
        <Text className="text-sm text-center text-muted">Preencha os dados abaixo para se cadastrar</Text>
      </CardHeader>

      <CardContent className="px-6 py-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <TextField isInvalid={!!erros.nomeCompleto}>
            <Label className="text-sm font-medium">Nome completo</Label>
            <Input
              placeholder="João da Silva"
              value={form.nomeCompleto}
              onChange={(e) => handleChange('nomeCompleto', e.target.value)}
              autoComplete="name"
              autoFocus
              className="w-full"
            />
            <FieldError className="text-xs text-danger">{erros.nomeCompleto}</FieldError>
          </TextField>

          <TextField isInvalid={!!erros.username}>
            <Label className="text-sm font-medium">Usuário</Label>
            <Input
              placeholder="joao.silva"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              autoComplete="username"
              className="w-full"
            />
            <FieldError className="text-xs text-danger">{erros.username}</FieldError>
          </TextField>

          <TextField isInvalid={!!erros.senha}>
            <Label className="text-sm font-medium">Senha</Label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              autoComplete="new-password"
              className="w-full"
            />
            <FieldError className="text-xs text-danger">{erros.senha}</FieldError>
          </TextField>

          <TextField isInvalid={!!erros.confirmacaoSenha}>
            <Label className="text-sm font-medium">Confirmar senha</Label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={form.confirmacaoSenha}
              onChange={(e) => handleChange('confirmacaoSenha', e.target.value)}
              autoComplete="new-password"
              className="w-full"
            />
            <FieldError className="text-xs text-danger">{erros.confirmacaoSenha}</FieldError>
          </TextField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="font-semibold"
            isPending={cadastro.isPending}
            isDisabled={cadastro.isPending}
          >
            Criar conta
          </Button>
        </form>

        <Text className="mt-5 text-center text-sm text-muted">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Fazer login
          </Link>
        </Text>
      </CardContent>
    </Card>
  )
}
