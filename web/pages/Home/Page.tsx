import {
  Anchor,
  Box,
  Button,
  Code,
  ActionIcon,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
  Card,
  Container,
  List,
  ThemeIcon,
  Badge,
  Grid,
  Divider,
  Modal,
  Affix,
  Transition,
  rem,
} from '@mantine/core'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  ServerCog,
  Zap,
  Database,
  GitBranch,
  Shield,
  Rocket,
  Check,
  ArrowRight,
  BookOpen,
  Eye,
  Cpu,
  Palette,
  Smartphone,
  Globe,
  ChevronDown,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useDisclosure, useWindowScroll } from '@mantine/hooks'

const MotionBox = motion(Box as any)
const MotionCard = motion(Card as any)
// Note: Only Box/Card are animated; Title/Text kept simple

type Feature = {
  icon: ComponentType<{ size?: number }>
  title: string
  description: string
  tech: string[]
  color: string
}

export function Component() {
  const theme = useMantineTheme()
  const { setColorScheme } = useMantineColorScheme()
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const brand = theme.colors.brand?.[6] || theme.colors.blue[6]
  const cardBg = computed === 'dark' ? 'var(--mantine-color-dark-7)' : 'var(--mantine-color-white)'
  const secondaryText =
    computed === 'dark' ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-gray-6)'
  const [scroll] = useWindowScroll()

  const [showTips, setShowTips] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [opened, { open, close }] = useDisclosure(false)
  const [videoModalOpened, { open: openVideoModal, close: closeVideoModal }] = useDisclosure(false)

  useEffect(() => {
    document.title = 'Catalyst Skeleton - Modern Full-Stack Boilerplate'
    const t = setTimeout(() => {
      try {
        const seen = localStorage.getItem('catalyst_welcome_seen')
        if (!seen) {
          setShowTips(true)
          localStorage.setItem('catalyst_welcome_seen', '1')
        }
      } catch {}
    }, 2000)

    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)

    return () => {
      clearTimeout(t)
      clearInterval(interval)
    }
  }, [])

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Frontend Moderno',
      description:
        'React 19 com TypeScript, Vite 7 para HMR ultrarrápido, Mantine v8 para UI consistente e roteamento assíncrono.',
      tech: ['React 19', 'TypeScript', 'Vite 7', 'Mantine v8'],
      color: 'blue',
    },
    {
      icon: ServerCog,
      title: 'Backend Robusto',
      description:
        'Symfony 7.3 com Doctrine ORM, autenticação JWT, sistema de comandos e arquitetura limpa para APIs escaláveis.',
      tech: ['Symfony 7.3', 'Doctrine ORM', 'PHP 8.4', 'MySQL 8.3'],
      color: 'green',
    },
    {
      icon: Database,
      title: 'Infraestrutura',
      description:
        'Docker completo com MySQL, cron jobs, supervisord e ambiente de desenvolvimento consistente entre equipes.',
      tech: ['Docker', 'MySQL 8.3', 'Supervisord', 'Cron Jobs'],
      color: 'orange',
    },
    {
      icon: GitBranch,
      title: 'Developer Experience',
      description:
        'Scripts CLI automatizados, hooks Git, linting integrado e ferramentas de qualidade de código desde o início.',
      tech: ['ESLint', 'PHPStan', 'PHPCS', 'Git Hooks'],
      color: 'violet',
    },
  ] as const satisfies readonly Feature[]

  const active: Feature = (features[activeFeature] ?? features[0])!
  const ActiveFeatureIcon = active.icon

  const quickStartSteps = [
    {
      step: 1,
      title: 'Clone o repositório',
      command: 'git clone https://github.com/GabrielCirqueira/Catalyst-Skeleton',
      description: 'Comece clonando o projeto para sua máquina local',
    },
    {
      step: 2,
      title: 'Suba a stack Docker',
      command: 'make up-d',
      description: 'Inicie todos os serviços em background',
    },
    {
      step: 3,
      title: 'Instale dependências',
      command: 'make install',
      description: 'Instala automaticamente dependências do backend e frontend',
    },
    {
      step: 4,
      title: 'Desenvolvimento ativo',
      command: 'npm run dev',
      description: 'Inicie o servidor de desenvolvimento com Hot Module Replacement',
    },
  ]

  const techStack = [
    {
      category: 'Frontend',
      items: ['React 19', 'TypeScript', 'Vite 7', 'Mantine UI', 'Framer Motion'],
    },
    {
      category: 'Backend',
      items: ['Symfony 7.3', 'PHP 8.4', 'Doctrine ORM', 'JWT Auth', 'API Platform'],
    },
    { category: 'Database', items: ['MySQL 8.3', 'Migrations', 'Fixtures', 'Doctrine Extensions'] },
    {
      category: 'DevOps',
      items: ['Docker', 'Docker Compose', 'Supervisord', 'Cron Jobs', 'Nginx'],
    },
    { category: 'QA', items: ['PHPStan', 'PHPCS', 'ESLint', 'Prettier', 'Git Hooks'] },
  ]

  return (
    <Box>
      <Box
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container size="lg" pt={120} pb={80}>
          <Group justify="space-between" mb={60}>
            <Group>
              <Box
                p={12}
                bg={brand}
                c="white"
                style={{
                  borderRadius: 'var(--mantine-radius-lg)',
                  fontWeight: 700,
                  fontSize: rem(20),
                }}
              >
                CS
              </Box>
              <Text fw={700} size="xl" c={computed === 'dark' ? 'white' : 'dark'}>
                Catalyst Skeleton
              </Text>
            </Group>

            <Group>
              <Button
                variant="light"
                onClick={() => setColorScheme(computed === 'dark' ? 'light' : 'dark')}
                leftSection={<Palette size={16} />}
              >
                {computed === 'dark' ? 'Light' : 'Dark'}
              </Button>
            </Group>
          </Group>

          <Grid gutter={80} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Badge size="lg" variant="filled" color="brand" mb="md">
                  v2.0.0 Disponível
                </Badge>

                <Title
                  order={1}
                  c={computed === 'dark' ? 'white' : 'dark'}
                  style={{
                    fontSize: rem(48),
                    lineHeight: 1.2,
                    marginBottom: rem(20),
                  }}
                >
                  Desenvolvimento Full-Stack{' '}
                  <Text component="span" c={brand} inherit>
                    Acelerado
                  </Text>
                </Title>

                <Text size="xl" c={secondaryText} mb={40} style={{ lineHeight: 1.6 }}>
                  Um boilerplate opinado que une Symfony 7, React 19 e as melhores práticas de
                  desenvolvimento para lançar produtos robustos em tempo recorde.
                </Text>

                <Group>
                  <Button
                    size="lg"
                    color="brand"
                    rightSection={<Rocket size={18} />}
                    onClick={open}
                  >
                    Começar Agora
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    rightSection={<BookOpen size={18} />}
                    component="a"
                    href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
                    target="_blank"
                  >
                    Documentação
                  </Button>
                </Group>

                <Group mt={40} gap={30}>
                  {[
                    { icon: Check, text: 'Configuração Zero' },
                    { icon: Check, text: 'Docker Pronto' },
                    { icon: Check, text: 'TypeScript' },
                  ].map(({ icon: Icon, text }) => (
                    <Group key={text} gap={8}>
                      <ThemeIcon size={20} color="green" variant="light">
                        <Icon size={14} />
                      </ThemeIcon>
                      <Text size="sm" c={secondaryText}>
                        {text}
                      </Text>
                    </Group>
                  ))}
                </Group>
              </MotionBox>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <MotionBox
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{
                  background: cardBg,
                  borderRadius: 'var(--mantine-radius-xl)',
                  padding: rem(40),
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  border: `1px solid ${computed === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
                }}
              >
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={activeFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Group mb="md">
                      <ThemeIcon
                        size={50}
                        color={active.color}
                        variant="light"
                        style={{ borderRadius: 'var(--mantine-radius-md)' }}
                      >
                        <ActiveFeatureIcon size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3}>{active.title}</Title>
                        <Text c={secondaryText} size="sm">
                          {active.description}
                        </Text>
                      </Box>
                    </Group>

                    <Group gap="sm">
                      {active.tech.map((tech) => (
                        <Badge key={tech} variant="light" color={active.color}>
                          {tech}
                        </Badge>
                      ))}
                    </Group>
                  </MotionBox>
                </AnimatePresence>

                <Group justify="center" mt="xl" gap={8}>
                  {features.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      style={{
                        width: rem(12),
                        height: rem(12),
                        borderRadius: '50%',
                        backgroundColor: index === activeFeature ? brand : secondaryText,
                        cursor: 'pointer',
                        opacity: index === activeFeature ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </Group>
              </MotionBox>
            </Grid.Col>
          </Grid>

          <Box style={{ textAlign: 'center', marginTop: rem(80) }}>
            <MotionBox animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ChevronDown
                size={24}
                color={secondaryText}
                style={{ cursor: 'pointer' }}
                onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
              />
            </MotionBox>
          </Box>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Title order={2} ta="center" mb={12} c={computed === 'dark' ? 'white' : 'dark'}>
            Arquitetura Completa
          </Title>
          <Text ta="center" c={secondaryText} mb={60} maw={600} mx="auto">
            Desenvolvido com as melhores tecnologias e práticas modernas para garantir performance,
            escalabilidade e manutenibilidade.
          </Text>
        </MotionBox>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing={30}>
          {[
            {
              icon: Cpu,
              title: 'Alta Performance',
              description:
                'Vite com HMR para desenvolvimento rápido e builds otimizados para produção',
            },
            {
              icon: Shield,
              title: 'Seguro por Padrão',
              description:
                'Autenticação JWT, validações robustas e práticas de segurança implementadas',
            },
            {
              icon: Smartphone,
              title: 'Totalmente Responsivo',
              description: 'Design adaptativo que funciona perfeitamente em todos os dispositivos',
            },
            {
              icon: Globe,
              title: 'Pronto para Produção',
              description: 'Docker, variáveis de ambiente e configurações otimizadas para deploy',
            },
          ].map(({ icon: Icon, title, description }, index) => (
            <MotionCard
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              shadow="md"
              padding="lg"
              style={{
                border: `1px solid ${computed === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
              }}
            >
              <ThemeIcon size={60} radius="md" variant="light" color="brand" mb="md">
                <Icon size={30} />
              </ThemeIcon>
              <Text fw={700} size="lg" mb="xs">
                {title}
              </Text>
              <Text c={secondaryText} size="sm">
                {description}
              </Text>
            </MotionCard>
          ))}
        </SimpleGrid>
      </Container>

      <Box
        style={{
          background:
            computed === 'dark' ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-0)',
        }}
        py={80}
      >
        <Container size="lg">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Title order={2} ta="center" mb={12} c={computed === 'dark' ? 'white' : 'dark'}>
              Comece em 5 Minutos
            </Title>
            <Text ta="center" c={secondaryText} mb={60} maw={600} mx="auto">
              Siga estes passos simples para ter seu ambiente de desenvolvimento rodando
            </Text>
          </MotionBox>

          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={50}>
            <Stack>
              {quickStartSteps.map((step, index) => (
                <MotionBox
                  key={step.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    padding="lg"
                    mb="md"
                    style={{
                      border: `1px solid ${computed === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
                      background: cardBg,
                    }}
                  >
                    <Group align="flex-start">
                      <ThemeIcon size={40} radius="md" color="brand" variant="light">
                        <Text fw={700}>{step.step}</Text>
                      </ThemeIcon>
                      <Box style={{ flex: 1 }}>
                        <Text fw={600} mb={5}>
                          {step.title}
                        </Text>
                        <Text c={secondaryText} size="sm" mb={10}>
                          {step.description}
                        </Text>
                        <Code block style={{ width: '100%' }}>
                          {step.command}
                        </Code>
                      </Box>
                    </Group>
                  </Card>
                </MotionBox>
              ))}
            </Stack>

            <MotionBox
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card
                padding="xl"
                style={{
                  background:
                    computed === 'dark'
                      ? 'linear-gradient(135deg, var(--mantine-color-dark-7) 0%, var(--mantine-color-dark-6) 100%)'
                      : 'linear-gradient(135deg, var(--mantine-color-blue-1) 0%, var(--mantine-color-cyan-0) 100%)',
                  border: `1px solid ${computed === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-blue-2)'}`,
                }}
              >
                <Title order={3} mb="md" c={computed === 'dark' ? 'white' : 'dark'}>
                  Próximos Passos
                </Title>
                <List
                  spacing="sm"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="brand" size={20} radius="xl">
                      <Check size={12} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    <Text c={secondaryText}>Explore a estrutura do projeto</Text>
                  </List.Item>
                  <List.Item>
                    <Text c={secondaryText}>Configure suas variáveis de ambiente</Text>
                  </List.Item>
                  <List.Item>
                    <Text c={secondaryText}>Crie sua primeira entidade Doctrine</Text>
                  </List.Item>
                  <List.Item>
                    <Text c={secondaryText}>Desenvolva componentes React</Text>
                  </List.Item>
                  <List.Item>
                    <Text c={secondaryText}>Implemente suas APIs</Text>
                  </List.Item>
                </List>

                <Button
                  fullWidth
                  mt="xl"
                  color="brand"
                  rightSection={<ArrowRight size={16} />}
                  component="a"
                  href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
                  target="_blank"
                >
                  Explorar Documentação Completa
                </Button>
              </Card>
            </MotionBox>
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" py={80}>
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Title order={2} ta="center" mb={12} c={computed === 'dark' ? 'white' : 'dark'}>
            Stack Tecnológica
          </Title>
          <Text ta="center" c={secondaryText} mb={60} maw={600} mx="auto">
            Tecnologias modernas e bem integradas para desenvolvimento full-stack
          </Text>
        </MotionBox>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing={30}>
          {techStack.map((category, index) => (
            <MotionCard
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              shadow="sm"
              padding="lg"
            >
              <Title order={4} mb="md" c={brand}>
                {category.category}
              </Title>
              <Stack gap="xs">
                {category.items.map((item) => (
                  <Group key={item} gap="sm">
                    <ThemeIcon size={20} color="brand" variant="light">
                      <Check size={12} />
                    </ThemeIcon>
                    <Text size="sm" c={secondaryText}>
                      {item}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </MotionCard>
          ))}
        </SimpleGrid>
      </Container>

      <Box py={50}>
        <Container size="sm">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <Title order={2} c="white" mb="md" style={{ fontSize: rem(36) }}>
              Pronto para Acelerar seu Desenvolvimento?
            </Title>
            <Text c="white" size="lg" mb={40} opacity={0.9}>
              Comece seu próximo projeto com uma base sólida e economize centenas de horas de
              configuração.
            </Text>

            <Group justify="center">
              <Button
                size="lg"
                variant="white"
                rightSection={<Rocket size={18} />}
                component="a"
                href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
                target="_blank"
              >
                Começar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                color="gray"
                rightSection={<Eye size={18} />}
                onClick={openVideoModal}
              >
                Ver Demonstração
              </Button>
            </Group>
          </MotionBox>
        </Container>
      </Box>

      <Box
        style={{
          background:
            computed === 'dark' ? 'var(--mantine-color-dark-9)' : 'var(--mantine-color-gray-0)',
          borderTop: `1px solid ${computed === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
        }}
        py={50}
      >
        <Container size="full" w="full">
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group mb="md">
                <Box
                  p={12}
                  bg={brand}
                  c="white"
                  style={{
                    borderRadius: 'var(--mantine-radius-lg)',
                    fontWeight: 700,
                  }}
                >
                  CS
                </Box>
                <Text fw={700} size="lg">
                  Catalyst Skeleton
                </Text>
              </Group>
              <Text c={secondaryText} mb="md">
                Um boilerplate full-stack opinado para desenvolvimento rápido e de alta qualidade.
              </Text>
              <Group>
                <Anchor
                  href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
                  target="_blank"
                  c={secondaryText}
                >
                  GitHub
                </Anchor>
                <Anchor href="#" c={secondaryText}>
                  Documentação
                </Anchor>
                <Anchor href="#" c={secondaryText}>
                  Exemplos
                </Anchor>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={600} mb="md">
                Tecnologias
              </Text>
              <Group gap={30}>
                <Stack gap={5}>
                  <Text size="sm" c={secondaryText}>
                    React 19
                  </Text>
                  <Text size="sm" c={secondaryText}>
                    Symfony 7.3
                  </Text>
                  <Text size="sm" c={secondaryText}>
                    TypeScript
                  </Text>
                </Stack>
                <Stack gap={5}>
                  <Text size="sm" c={secondaryText}>
                    Docker
                  </Text>
                  <Text size="sm" c={secondaryText}>
                    MySQL 8.3
                  </Text>
                  <Text size="sm" c={secondaryText}>
                    Mantine UI
                  </Text>
                </Stack>
              </Group>
            </Grid.Col>
          </Grid>

          <Divider my="xl" />

          <Group justify="space-between">
            <Text size="sm" c={secondaryText}>
              © 2024 Catalyst Skeleton. Desenvolvido com ❤️ para a comunidade.
            </Text>
            <Text size="sm" c={secondaryText}>
              v2.0.0
            </Text>
          </Group>
        </Container>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        title={
          <Group>
            <Rocket size={24} color={brand} />
            <Text fw={700}>Comece Rápido</Text>
          </Group>
        }
        size="lg"
      >
        <Stack>
          <Text c={secondaryText}>
            Siga estes passos para configurar seu ambiente de desenvolvimento:
          </Text>

          <List type="ordered" spacing="sm">
            <List.Item>
              <Text fw={600}>Pré-requisitos</Text>
              <Text size="sm" c={secondaryText} ml={20}>
                Docker e Docker Compose instalados
              </Text>
            </List.Item>
            <List.Item>
              <Text fw={600}>Clone o repositório</Text>
              <Code block mt={5}>
                git clone https://github.com/GabrielCirqueira/Catalyst-Skeleton
              </Code>
            </List.Item>
            <List.Item>
              <Text fw={600}>Execute a stack</Text>
              <Code block mt={5}>
                make up-d
              </Code>
            </List.Item>
            <List.Item>
              <Text fw={600}>Acesse a aplicação</Text>
              <Text size="sm" c={secondaryText} ml={20}>
                Abra http://localhost:3000 no seu navegador
              </Text>
            </List.Item>
          </List>

          <Button
            fullWidth
            color="brand"
            mt="md"
            rightSection={<ArrowRight size={16} />}
            component="a"
            href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
            target="_blank"
          >
            Ver Repositório Completo
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={videoModalOpened}
        onClose={closeVideoModal}
        title="Demonstração do Catalyst Skeleton"
        size="xl"
      >
        <Box
          style={{
            background:
              computed === 'dark' ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-1)',
            borderRadius: 'var(--mantine-radius-md)',
            padding: rem(60),
            textAlign: 'center',
          }}
        >
          <Rocket size={48} color={brand} style={{ margin: '0 auto 20px' }} />
          <Title order={3} mb="sm">
            Demonstração Interativa
          </Title>
          <Text c={secondaryText} mb="lg">
            Explore as funcionalidades do Catalyst Skeleton através do nosso demo online
          </Text>
          <Button
            color="brand"
            rightSection={<Eye size={16} />}
            component="a"
            href="#"
            target="_blank"
          >
            Acessar Demo Online
          </Button>
        </Box>
      </Modal>

      <Affix position={{ bottom: 20, right: 20 }}>
        <Transition transition="slide-up" mounted={scroll.y > 400}>
          {(transitionStyles) => (
            <Button
              style={transitionStyles}
              color="brand"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              leftSection={<ArrowRight size={16} style={{ transform: 'rotate(-90deg)' }} />}
            >
              Topo
            </Button>
          )}
        </Transition>
      </Affix>

      <AnimatePresence>
        {showTips && (
          <MotionBox
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 1000,
              maxWidth: 400,
            }}
          >
            <Card
              shadow="lg"
              padding="lg"
              radius="md"
              style={{
                background: cardBg,
                border: `1px solid ${computed === 'dark' ? 'var(--mantine-color-dark-5)' : 'var(--mantine-color-gray-2)'}`,
              }}
            >
              <Group justify="space-between" mb="sm">
                <Group gap="xs">
                  <ThemeIcon size={30} color="brand" variant="light">
                    <Zap size={16} />
                  </ThemeIcon>
                  <Text fw={700}>Dica Rápida</Text>
                </Group>
                <ActionIcon variant="subtle" color="gray" onClick={() => setShowTips(false)}>
                  <X size={16} />
                </ActionIcon>
              </Group>

              <Text size="sm" c={secondaryText} mb="md">
                Use <Code>make up-d</Code> para subir o ambiente completo. Para desenvolvimento
                frontend, execute <Code>npm run dev</Code> para Hot Module Replacement. Qualidade de
                código? Use <Code>composer qa</Code> e <Code>make lint-all</Code>.
              </Text>

              <Group justify="space-between">
                <Button size="xs" variant="light" color="brand" onClick={open}>
                  Ver Guia
                </Button>
                <Button size="xs" variant="subtle" onClick={() => setShowTips(false)}>
                  Fechar
                </Button>
              </Group>
            </Card>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  )
}

export default Component
