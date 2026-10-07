import { useLogin } from '@/features/auth'
import { Button, Card, Field, Heading, Input, Link, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
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
    <Card.Root w="full" maxW="sm" boxShadow="md">
      <Card.Header alignItems="center" gap="1" pb="0" pt="6">
        <Heading as="h1" size="xl">
          Entrar
        </Heading>
        <Text fontSize="sm" textAlign="center" color="catalist.grey.600">
          Acesse sua conta com seu usuário e senha
        </Text>
      </Card.Header>

      <Card.Body px="6" py="6">
        <Stack as="form" gap="4" onSubmit={onSubmit}>
          <Field.Root invalid={!!erros.username}>
            <Field.Label>Usuário</Field.Label>
            <Input
              placeholder="seu.usuario"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              autoComplete="username"
              autoFocus
            />
            <Field.ErrorText>{erros.username}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!erros.senha}>
            <Field.Label>Senha</Field.Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={(e) => handleChange('senha', e.target.value)}
              autoComplete="current-password"
            />
            <Field.ErrorText>{erros.senha}</Field.ErrorText>
          </Field.Root>

          <Button
            type="submit"
            colorPalette="brand"
            width="full"
            fontWeight="semibold"
            loading={login.isPending}
            disabled={login.isPending}
          >
            Entrar
          </Button>
        </Stack>

        <Text mt="5" textAlign="center" fontSize="sm" color="catalist.grey.600">
          Não tem uma conta?{' '}
          <Link asChild color="catalist.brand.700" fontWeight="medium">
            <RouterLink to="/cadastro">Criar conta</RouterLink>
          </Link>
        </Text>
      </Card.Body>
    </Card.Root>
  )
}
