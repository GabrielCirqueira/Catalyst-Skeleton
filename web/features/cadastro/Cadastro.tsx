import { useCadastro } from '@/features/auth'
import { Button, Card, Field, Heading, Input, Link, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
    <Card.Root w="full" maxW="sm" boxShadow="md">
      <Card.Header alignItems="center" gap="1" pb="0" pt="6">
        <Heading as="h1" size="xl">
          Criar conta
        </Heading>
        <Text fontSize="sm" textAlign="center" color="fg.muted">
          Preencha os dados abaixo para se cadastrar
        </Text>
      </Card.Header>

      <Card.Body px="6" py="6">
        <Stack as="form" gap="4" onSubmit={onSubmit}>
          <Field.Root invalid={!!erros.nomeCompleto}>
            <Field.Label>Nome completo</Field.Label>
            <Input
              placeholder="João da Silva"
              value={form.nomeCompleto}
              onChange={(e) => handleChange('nomeCompleto', e.target.value)}
              autoComplete="name"
              autoFocus
            />
            <Field.ErrorText>{erros.nomeCompleto}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!erros.username}>
            <Field.Label>Usuário</Field.Label>
            <Input
              placeholder="joao.silva"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              autoComplete="username"
            />
            <Field.ErrorText>{erros.username}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!erros.senha}>
            <Field.Label>Senha</Field.Label>
            <Input
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              autoComplete="new-password"
            />
            <Field.ErrorText>{erros.senha}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!erros.confirmacaoSenha}>
            <Field.Label>Confirmar senha</Field.Label>
            <Input
              type="password"
              placeholder="Repita a senha"
              value={form.confirmacaoSenha}
              onChange={(e) => handleChange('confirmacaoSenha', e.target.value)}
              autoComplete="new-password"
            />
            <Field.ErrorText>{erros.confirmacaoSenha}</Field.ErrorText>
          </Field.Root>

          <Button
            type="submit"
            colorPalette="brand"
            width="full"
            fontWeight="semibold"
            loading={cadastro.isPending}
            disabled={cadastro.isPending}
          >
            Criar conta
          </Button>
        </Stack>

        <Text mt="5" textAlign="center" fontSize="sm" color="fg.muted">
          Já tem uma conta?{' '}
          <Link asChild color="brand.fg" fontWeight="medium">
            <RouterLink to="/login">Fazer login</RouterLink>
          </Link>
        </Text>
      </Card.Body>
    </Card.Root>
  )
}
