import { useTheme } from '@/contexts'
import type { MainLayoutContext } from '@/layouts'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Accordion,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Field,
  HStack,
  Heading,
  Input,
  InputGroup,
  Progress,
  Separator,
  SimpleGrid,
  Switch,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Github,
  Globe,
  Lock,
  LogIn,
  Mail,
  Moon,
  Package,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Sun,
  Terminal,
  Zap,
} from 'lucide-react'
import { memo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const techStack = [
  {
    category: 'Backend',
    icon: Server,
    items: [
      'PHP 8.4',
      'Symfony 7.3',
      'Doctrine ORM 3',
      'Lexik JWT',
      'Gesdinet Refresh',
      'Nelmio CORS',
    ],
  },
  {
    category: 'Frontend',
    icon: Code2,
    items: ['React 19', 'TypeScript 5.9', 'Vite 7', 'Chakra UI v3', 'React Router 7'],
  },
  {
    category: 'Estado & Dados',
    icon: Activity,
    items: ['TanStack Query 5', 'Zustand 5', 'Zod 4', 'Axios'],
  },
  {
    category: 'Infraestrutura',
    icon: Terminal,
    items: ['Docker Compose', 'Nginx', 'PHP-FPM', 'MySQL 8', 'Vite dev server'],
  },
]

const steps = [
  {
    n: '01',
    title: 'Clone e configure',
    desc: 'Execute ./scripts/setup.sh, escolha os módulos opcionais e configure seu .env.',
  },
  {
    n: '02',
    title: 'Suba o ambiente',
    desc: 'docker compose up -d inicia backend, banco de dados, frontend e proxy.',
  },
  {
    n: '03',
    title: 'Comece a codar',
    desc: 'Autenticação pronta, rotas protegidas, hot reload — foque na regra de negócio.',
  },
]

const teamMembers = [
  { initials: 'GC', name: 'Gabriel C.', role: 'Arquitetura', palette: 'brand' },
  { initials: 'AD', name: 'API Dev', role: 'Backend', palette: 'green' },
  { initials: 'UD', name: 'UI Dev', role: 'Frontend', palette: 'orange' },
] as const

const alertas = [
  { palette: 'green' as const, icon: '✓', msg: 'Deploy realizado com sucesso' },
  { palette: 'orange' as const, icon: '⚠', msg: 'Rate limit em 80%' },
  { palette: 'red' as const, icon: '!', msg: 'Token expirado' },
]

const stats = [
  { label: 'Linhas de código', value: '< 2k', icon: Code2, palette: 'brand' as const },
  { label: 'Dependências core', value: '18', icon: Package, palette: 'green' as const },
  { label: 'Endpoints prontos', value: '5', icon: Globe, palette: 'orange' as const },
  { label: 'Setup em minutos', value: '< 3', icon: Zap, palette: 'red' as const },
]

export function Component() {
  const { abrirModal } = useOutletContext<MainLayoutContext>()
  return <HomeContent onAbrirModal={abrirModal} />
}

const HomeContent = memo(function HomeContent({ onAbrirModal }: { onAbrirModal: () => void }) {
  const autenticado = useAuthStore((s) => s.autenticado)
  const usuario = useAuthStore((s) => s.usuario)
  const { theme, toggleTheme } = useTheme()

  const [notif, setNotif] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [formEmail, setFormEmail] = useState('')
  const [formSenha, setFormSenha] = useState('')

  return (
    <Box>
      <Box as="section" position="relative" overflow="hidden">
        <VStack
          position="relative"
          maxW="6xl"
          mx="auto"
          px="6"
          pt="20"
          pb="12"
          align="center"
          textAlign="center"
          gap="6"
        >
          <Badge variant="subtle" colorPalette="brand">
            <Sparkles size={12} />
            v5.0 · Chakra UI v3
          </Badge>

          <VStack gap="3">
            <Heading
              as="h1"
              fontSize={{ base: '5xl', sm: '7xl' }}
              fontWeight="black"
              letterSpacing="tight"
              lineHeight="1"
            >
              Catalyst{' '}
              <Text as="span" color="catalist.brand.700">
                Skeleton
              </Text>
            </Heading>
            <Text fontSize="lg" color="catalist.grey.600" maxW="xl">
              Fundação opinativa para aplicações{' '}
              <Text as="span" color="catalist.grey.900" fontWeight="semibold">
                Symfony + React
              </Text>
              . Core enxuto, módulos opt-in, pronto para produção.
            </Text>
          </VStack>

          {autenticado ? (
            <HStack
              px="4"
              py="2"
              rounded="xl"
              bg="catalist.green.100"
              borderWidth="1px"
              borderColor="catalist.green.200"
              color="catalist.green.700"
              fontSize="sm"
              fontWeight="medium"
            >
              <CheckCircle2 size={16} />
              Bem-vindo, {usuario?.nomeCompleto ?? usuario?.username}!
            </HStack>
          ) : (
            <HStack gap="3" wrap="wrap" justify="center">
              <Button type="button" onClick={onAbrirModal} colorPalette="brand">
                <LogIn size={16} />
                Começar agora
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Github size={16} />
                  Ver no GitHub
                </a>
              </Button>
            </HStack>
          )}

          <HStack wrap="wrap" justify="center" gap="2">
            {['PHP 8.4', 'Symfony 7', 'React 19', 'TypeScript', 'Chakra UI', 'Docker'].map((t) => (
              <Badge key={t} variant="outline">
                {t}
              </Badge>
            ))}
          </HStack>
        </VStack>
      </Box>

      <Box as="section" id="showcase" maxW="6xl" mx="auto" px="6" py="16">
        <VStack align="center" gap="2" mb="10" textAlign="center">
          <Badge variant="subtle" colorPalette="brand">
            Componentes
          </Badge>
          <Heading as="h2" size="2xl">
            Tudo que você precisa, pronto
          </Heading>
          <Text color="catalist.grey.600" fontSize="sm" maxW="md">
            Chakra UI v3. Veja os componentes em ação.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          <Card.Root>
            <Card.Header pb="2">
              <HStack mb="1">
                <Center boxSize="7" rounded="lg" bg="catalist.brand.100" color="catalist.brand.700">
                  <Shield size={16} strokeWidth={1.5} />
                </Center>
                <Card.Title fontSize="sm" fontWeight="semibold">
                  Autenticação
                </Card.Title>
              </HStack>
              <Text fontSize="xs" color="catalist.grey.600">
                JWT RS256 com refresh token integrado
              </Text>
            </Card.Header>
            <Card.Body gap="3">
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <InputGroup startElement={<Mail size={14} />}>
                  <Input
                    type="email"
                    placeholder="john@exemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </InputGroup>
              </Field.Root>

              <Field.Root>
                <Field.Label>Senha</Field.Label>
                <InputGroup startElement={<Lock size={14} />}>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formSenha}
                    onChange={(e) => setFormSenha(e.target.value)}
                  />
                </InputGroup>
              </Field.Root>

              <Button colorPalette="brand" width="full" size="sm" mt="1">
                Entrar na conta
              </Button>

              <HStack gap="3">
                <Box flex="1" h="1px" bg="catalist.grey.200" />
                <Text as="span" fontSize="xs" color="catalist.grey.600">
                  ou
                </Text>
                <Box flex="1" h="1px" bg="catalist.grey.200" />
              </HStack>

              <SimpleGrid columns={2} gap="2">
                <Button type="button" variant="outline" size="sm">
                  <Globe size={14} />
                  Google
                </Button>
                <Button type="button" variant="outline" size="sm">
                  <Github size={14} />
                  GitHub
                </Button>
              </SimpleGrid>

              <HStack wrap="wrap" gap="2" pt="1">
                <Badge size="sm" variant="subtle" colorPalette="green">
                  ✓ Refresh Token
                </Badge>
                <Badge size="sm" variant="subtle" colorPalette="brand">
                  RS256
                </Badge>
                <Badge size="sm" variant="subtle">
                  Stateless
                </Badge>
              </HStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header pb="2">
              <HStack mb="1">
                <Center boxSize="7" rounded="lg" bg="catalist.brand.100" color="catalist.brand.700">
                  <Activity size={16} strokeWidth={1.5} />
                </Center>
                <Card.Title fontSize="sm" fontWeight="semibold">
                  Controles & Progresso
                </Card.Title>
              </HStack>
              <Text fontSize="xs" color="catalist.grey.600">
                Switches, barras de progresso e tema
              </Text>
            </Card.Header>
            <Card.Body gap="4">
              <VStack gap="3">
                <Switch.Root
                  checked={theme === 'dark'}
                  onCheckedChange={() => toggleTheme()}
                  colorPalette="brand"
                  width="full"
                >
                  <HStack justify="space-between" w="full">
                    <Switch.Label>
                      <HStack>
                        {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                        Modo escuro
                      </HStack>
                    </Switch.Label>
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </HStack>
                </Switch.Root>

                <Switch.Root
                  checked={notif}
                  onCheckedChange={(detalhes) => setNotif(detalhes.checked)}
                  colorPalette="brand"
                  width="full"
                >
                  <HStack justify="space-between" w="full">
                    <Switch.Label>Notificações</Switch.Label>
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </HStack>
                </Switch.Root>

                <Switch.Root
                  checked={analytics}
                  onCheckedChange={(detalhes) => setAnalytics(detalhes.checked)}
                  colorPalette="brand"
                  width="full"
                >
                  <HStack justify="space-between" w="full">
                    <Switch.Label>Analytics</Switch.Label>
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </HStack>
                </Switch.Root>
              </VStack>

              <Separator />

              <VStack gap="3">
                <Progress.Root value={78} colorPalette="brand" size="sm">
                  <HStack justify="space-between" w="full">
                    <Progress.Label>CPU</Progress.Label>
                    <Progress.ValueText />
                  </HStack>
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>

                <Progress.Root value={45} colorPalette="green" size="sm">
                  <HStack justify="space-between" w="full">
                    <Progress.Label>Memória</Progress.Label>
                    <Progress.ValueText />
                  </HStack>
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>

                <Progress.Root value={92} colorPalette="orange" size="sm">
                  <HStack justify="space-between" w="full">
                    <Progress.Label>Disco</Progress.Label>
                    <Progress.ValueText />
                  </HStack>
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header pb="2">
              <HStack mb="1">
                <Center boxSize="7" rounded="lg" bg="catalist.green.100" color="catalist.green.700">
                  <Zap size={16} strokeWidth={1.5} />
                </Center>
                <Card.Title fontSize="sm" fontWeight="semibold">
                  Botões & Feedback
                </Card.Title>
              </HStack>
              <Text fontSize="xs" color="catalist.grey.600">
                Variantes, estados e notificações
              </Text>
            </Card.Header>
            <Card.Body gap="4">
              <VStack gap="2">
                <Button colorPalette="brand" size="sm" width="full">
                  <Rocket size={14} />
                  Deploy agora
                </Button>
                <Button variant="outline" size="sm" width="full">
                  <BookOpen size={14} />
                  Ver documentação
                </Button>
                <Button colorPalette="red" variant="subtle" size="sm" width="full">
                  Revogar acesso
                </Button>
                <Button variant="ghost" size="sm" width="full" disabled>
                  Em desenvolvimento...
                </Button>
              </VStack>

              <Separator />

              <Box>
                <Text fontSize="xs" fontWeight="medium" color="catalist.grey.600" mb="3">
                  Time do projeto
                </Text>
                <HStack wrap="wrap" gap="3">
                  {teamMembers.map((m) => (
                    <HStack key={m.name} gap="2">
                      <Center
                        boxSize="8"
                        rounded="xl"
                        bg={`skeleton.${m.palette}.100`}
                        color={`skeleton.${m.palette}.700`}
                        fontSize="xs"
                        fontWeight="black"
                        fontFamily="heading"
                      >
                        {m.initials}
                      </Center>
                      <VStack gap="0" align="start">
                        <Text fontSize="xs" fontWeight="semibold" lineHeight="1">
                          {m.name}
                        </Text>
                        <Text fontSize="xs" color="catalist.grey.600">
                          {m.role}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </HStack>
              </Box>

              <Separator />

              <VStack gap="2">
                {alertas.map((a) => (
                  <HStack
                    key={a.msg}
                    px="3"
                    py="2"
                    rounded="lg"
                    borderWidth="1px"
                    bg={`skeleton.${a.palette}.100`}
                    borderColor={`skeleton.${a.palette}.200`}
                    color={`skeleton.${a.palette}.700`}
                    fontSize="xs"
                    fontWeight="medium"
                    w="full"
                  >
                    <Text as="span" flexShrink="0">
                      {a.icon}
                    </Text>
                    {a.msg}
                  </HStack>
                ))}
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <SimpleGrid mt="4" columns={{ base: 2, sm: 4 }} gap="4">
          {stats.map((s) => (
            <HStack
              key={s.label}
              gap="3"
              p="4"
              rounded="xl"
              borderWidth="1px"
              bg="catalist.grey.0"
              boxShadow="sm"
            >
              <Center
                boxSize="10"
                rounded="xl"
                flexShrink="0"
                bg={`skeleton.${s.palette}.100`}
                color={`skeleton.${s.palette}.700`}
              >
                <s.icon size={20} />
              </Center>
              <VStack gap="0" align="start">
                <Text fontSize="2xl" fontWeight="black" fontFamily="heading" lineHeight="1">
                  {s.value}
                </Text>
                <Text fontSize="xs" color="catalist.grey.600">
                  {s.label}
                </Text>
              </VStack>
            </HStack>
          ))}
        </SimpleGrid>
      </Box>

      <Separator />

      <Box as="section" id="stack" bg="catalist.grey.100" borderBottomWidth="1px">
        <Container px="6" py="16">
          <VStack align="center" gap="2" mb="10" textAlign="center">
            <Badge variant="subtle" colorPalette="brand">
              Stack
            </Badge>
            <Heading as="h2" size="2xl">
              Tecnologias incluídas
            </Heading>
          </VStack>

          <Accordion.Root collapsible maxW="2xl" mx="auto">
            {techStack.map((t) => (
              <Accordion.Item key={t.category} value={t.category}>
                <Accordion.ItemTrigger>
                  <Center
                    boxSize="8"
                    rounded="lg"
                    bg="catalist.brand.100"
                    color="catalist.brand.700"
                    flexShrink="0"
                  >
                    <t.icon size={16} />
                  </Center>
                  <Text as="span" fontWeight="semibold" fontSize="sm">
                    {t.category}
                  </Text>
                  <Text as="span" ml="auto" fontSize="xs" color="catalist.grey.600">
                    {t.items.length} tecnologias
                  </Text>
                  <Accordion.ItemIndicator />
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Accordion.ItemBody>
                    <HStack wrap="wrap" gap="2" pb="4" pl="11">
                      {t.items.map((item) => (
                        <Badge key={item} variant="subtle" size="sm">
                          {item}
                        </Badge>
                      ))}
                    </HStack>
                  </Accordion.ItemBody>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Container>
      </Box>

      <Box as="section" id="steps" maxW="6xl" mx="auto" px="6" py="16">
        <VStack align="center" gap="2" mb="10" textAlign="center">
          <Badge variant="subtle" colorPalette="brand">
            Como funciona
          </Badge>
          <Heading as="h2" size="2xl">
            3 passos para começar
          </Heading>
        </VStack>

        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="6">
          {steps.map((s, i) => (
            <VStack
              key={s.n}
              position="relative"
              gap="4"
              p="6"
              rounded="2xl"
              borderWidth="1px"
              bg="catalist.grey.0"
              boxShadow="sm"
              align="start"
            >
              {i < steps.length - 1 && (
                <Box
                  hideBelow="sm"
                  position="absolute"
                  top="8"
                  right="0"
                  transform="translateX(50%)"
                  color="catalist.grey.300"
                >
                  <ArrowRight size={16} />
                </Box>
              )}
              <Center
                boxSize="10"
                rounded="xl"
                bg="catalist.brand.100"
                borderWidth="1px"
                borderColor="catalist.brand.200"
              >
                <Text
                  as="span"
                  fontSize="sm"
                  fontWeight="black"
                  fontFamily="heading"
                  color="catalist.brand.700"
                >
                  {s.n}
                </Text>
              </Center>
              <Box>
                <Heading as="h3" size="sm" mb="2">
                  {s.title}
                </Heading>
                <Text fontSize="xs" color="catalist.grey.600" lineHeight="relaxed">
                  {s.desc}
                </Text>
              </Box>
            </VStack>
          ))}
        </SimpleGrid>
      </Box>

      <Box as="section" borderTopWidth="1px" bg="catalist.grey.0">
        <VStack maxW="6xl" mx="auto" px="6" py="20" align="center" gap="6" textAlign="center">
          <Center
            boxSize="16"
            rounded="2xl"
            bg="catalist.brand.500"
            color="catalist.grey.0"
            boxShadow="lg"
          >
            <Rocket size={32} color="currentColor" />
          </Center>

          <Box>
            <Heading as="h2" size="4xl" fontWeight="black" mb="3">
              Pronto para começar?
            </Heading>
            <Text color="catalist.grey.600" maxW="md" fontSize="sm">
              Clone, configure e tenha um projeto full-stack profissional rodando em minutos.
            </Text>
          </Box>

          <HStack
            bg="catalist.grey.100"
            borderWidth="1px"
            rounded="xl"
            px="5"
            py="3"
            fontFamily="mono"
            fontSize="sm"
            w="full"
            maxW="lg"
          >
            <Terminal size={16} />
            <Text as="span" color="catalist.grey.600" userSelect="none">
              $
            </Text>
            <Text as="span">git clone catalyst-skeleton && ./setup.sh</Text>
          </HStack>

          <HStack gap="3" wrap="wrap" justify="center">
            {!autenticado && (
              <Button type="button" onClick={onAbrirModal} colorPalette="brand">
                <LogIn size={16} />
                Experimentar agora
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github size={16} />
                Ver no GitHub
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a href="#">
                <BookOpen size={16} />
                Documentação
              </a>
            </Button>
          </HStack>

          <HStack gap="2" fontSize="xs" color="catalist.grey.600">
            <CheckCircle2 size={12} />
            MIT License · Open Source · Sem vendor lock-in
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
})
