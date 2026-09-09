import { useCadastro } from '@features/auth'
import { Button, Card, CardBody, CardHeader, Input } from '@heroui/react'
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
        <h1 className="text-2xl font-bold font-sans">Criar conta</h1>
        <p className="text-sm text-default-500 text-center">
          Preencha os dados abaixo para se cadastrar
        </p>
      </CardHeader>

      <CardBody className="px-6 py-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Nome completo"
            placeholder="João da Silva"
            value={form.nomeCompleto}
            onValueChange={(v) => handleChange('nomeCompleto', v)}
            isInvalid={!!erros.nomeCompleto}
            errorMessage={erros.nomeCompleto}
            autoComplete="name"
            autoFocus
          />

          <Input
            label="Usuário"
            placeholder="joao.silva"
            value={form.username}
            onValueChange={(v) => handleChange('username', v)}
            isInvalid={!!erros.username}
            errorMessage={erros.username}
            autoComplete="username"
          />

          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={form.senha}
            onValueChange={(v) => handleChange('senha', v)}
            isInvalid={!!erros.senha}
            errorMessage={erros.senha}
            autoComplete="new-password"
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            value={form.confirmacaoSenha}
            onValueChange={(v) => handleChange('confirmacaoSenha', v)}
            isInvalid={!!erros.confirmacaoSenha}
            errorMessage={erros.confirmacaoSenha}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            color="primary"
            className="w-full font-semibold"
            isLoading={cadastro.isPending}
          >
            Criar conta
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-default-500">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </CardBody>
    </Card>
  )
}
