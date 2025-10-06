import { Anchor, Box, Button, Group, List, Stack, Text, Title } from '@mantine/core'
import { useComputedColorScheme, useMantineTheme } from '@mantine/core'
import { Home, SmilePlus, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'

export function Component() {
  const theme = useMantineTheme()
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const brand = theme.colors.brand?.[6] || theme.colors.blue[6]
  const textColor =
    computed === 'dark' ? 'var(--mantine-color-gray-3)' : 'var(--mantine-color-gray-7)'
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Not Found'
  }, [])

  return (
    <Stack gap={40} py={80} px={20} align="stretch" style={{ textAlign: 'center' }}>
      <Box>
        <SmilePlus size={64} color={brand} style={{ marginBottom: 24 }} />
        <Title order={1} style={{ fontSize: 96, color: brand }}>
          404
        </Title>
        <Text mt={40} size="lg" c={textColor}>
          Ops... não encontramos esta página.
        </Text>
      </Box>

      <Group justify="center" wrap="wrap" gap={24}>
        <Button component={RouterLink} to="/" onClick={() => navigate('/')} size="lg" color="brand">
          <Home size={18} />
          <span style={{ marginLeft: 8 }}>Ir para Home</span>
        </Button>
      </Group>

      <Stack gap={16} align="center">
        <Title order={3} c={brand}>
          Dicas rápidas
        </Title>
        <List spacing="xs" style={{ textAlign: 'left' }}>
          {[
            'Verifique a URL digitada',
            'Use a busca acima',
            'Acesse links sugeridos',
            'Reporte se o problema persistir',
          ].map((item) => (
            <List.Item key={item} icon={<CheckCircle size={14} color={brand} />}>
              <Text c={textColor}>{item}</Text>
            </List.Item>
          ))}
        </List>
        <Group justify="center" gap={8} mt={8}>
          <Text c={textColor}>Precisa de ajuda?</Text>
          <Anchor href="/" onClick={(e) => e.preventDefault()} c={brand}>
            Contate o suporte
          </Anchor>
        </Group>
      </Stack>
    </Stack>
  )
}
