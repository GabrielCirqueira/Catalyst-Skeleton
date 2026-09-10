import { useTheme } from '@/contexts'
import type { MainLayoutContext } from '@/layouts'
import { Box, Container, Grid, HStack, Text, VStack } from '@/shared/ui/layout'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  Accordion,
  AccordionBody,
  AccordionHeading,
  AccordionIndicator,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Chip,
  Input,
  Label,
  ProgressBar,
  ProgressBarFill,
  ProgressBarOutput,
  ProgressBarTrack,
  Separator,
  SwitchContent,
  SwitchControl,
  SwitchRoot,
  SwitchThumb,
  TextField,
  buttonVariants,
} from '@heroui/react'
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
    items: [
      'React 19',
      'TypeScript 5.9',
      'Vite 7',
      'Tailwind CSS 4',
      'HeroUI v3',
      'React Router 7',
    ],
  },
  {
    category: 'Estado & Dados',
    icon: Activity,
    items: ['TanStack Query 5', 'Zustand 5', 'Zod 4', 'Axios', 'React Aria'],
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
    icon: Code2,
    title: 'Clone e configure',
    desc: 'Execute ./scripts/setup.sh, escolha os módulos opcionais e configure seu .env.',
  },
  {
    n: '02',
    icon: Terminal,
    title: 'Suba o ambiente',
    desc: 'docker compose up -d inicia backend, banco de dados, frontend e proxy.',
  },
  {
    n: '03',
    icon: Rocket,
    title: 'Comece a codar',
    desc: 'Autenticação pronta, rotas protegidas, hot reload — foque na regra de negócio.',
  },
]

const teamMembers = [
  {
    initials: 'GC',
    name: 'Gabriel C.',
    role: 'Arquitetura',
    bg: 'bg-brand-500/20',
    text: 'text-brand-500',
  },
  { initials: 'AD', name: 'API Dev', role: 'Backend', bg: 'bg-success/20', text: 'text-success' },
  { initials: 'UD', name: 'UI Dev', role: 'Frontend', bg: 'bg-warning/20', text: 'text-warning' },
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
      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <Box className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-5%,color-mix(in_oklch,var(--color-brand-500)_20%,transparent),transparent)] pointer-events-none" />
        <Box className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_70%,var(--color-background))] pointer-events-none" />

        <VStack className="relative max-w-6xl mx-auto px-6 pt-20 pb-12 items-center text-center gap-6">
          <Chip
            variant="soft"
            size="sm"
            className="border border-brand-500/30 bg-brand-500/10 text-brand-600 motion-preset-fade"
          >
            <Sparkles className="size-3 mr-1" />
            v5.0 · Tailwind 4 + HeroUI v3
          </Chip>

          <VStack className="gap-3 motion-preset-slide-up motion-delay-100">
            <Text
              as="h1"
              className="text-5xl sm:text-7xl font-black font-sans tracking-tight leading-none"
            >
              Catalyst{' '}
              <Text as="span" className="text-brand-500">
                Skeleton
              </Text>
            </Text>
            <Text className="text-lg text-muted max-w-xl mx-auto">
              Fundação opinativa para aplicações{' '}
              <strong className="text-foreground font-semibold">Symfony + React</strong>. Core
              enxuto, módulos opt-in, pronto para produção.
            </Text>
          </VStack>

          {autenticado ? (
            <HStack className="px-4 py-2 rounded-xl bg-success/10 border border-success/20 text-success text-sm font-medium">
              <CheckCircle2 className="size-4" />
              Bem-vindo, {usuario?.nomeCompleto ?? usuario?.username}!
            </HStack>
          ) : (
            <HStack className="gap-3 flex-wrap justify-center motion-preset-fade motion-delay-200">
              <button
                type="button"
                onClick={onAbrirModal}
                className={buttonVariants({ variant: 'primary' })}
              >
                <LogIn className="size-4" />
                Começar agora
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: 'outline' })}
              >
                <Github className="size-4" />
                Ver no GitHub
              </a>
            </HStack>
          )}

          <HStack className="flex-wrap justify-center gap-2 motion-preset-fade motion-delay-300">
            {['PHP 8.4', 'Symfony 7', 'React 19', 'TypeScript', 'Tailwind 4', 'Docker'].map((t) => (
              <Text
                as="span"
                key={t}
                className="px-3 py-1 rounded-full text-xs font-medium bg-surface-secondary border border-border text-muted"
              >
                {t}
              </Text>
            ))}
          </HStack>
        </VStack>
      </section>

      {/* ════════════════════════════════════════════
          COMPONENT SHOWCASE
      ════════════════════════════════════════════ */}
      <section id="showcase" className="max-w-6xl mx-auto px-6 py-16">
        <VStack className="items-center gap-2 mb-10 text-center">
          <Chip
            variant="soft"
            size="sm"
            className="bg-brand-500/10 text-brand-600 border border-brand-500/20"
          >
            Componentes
          </Chip>
          <Text as="h2" className="text-3xl font-bold font-sans">
            Tudo que você precisa, pronto
          </Text>
          <Text className="text-muted text-sm max-w-md">
            HeroUI v3 + Tailwind 4 integrados. Veja os componentes em ação.
          </Text>
        </VStack>

        <Grid className="grid-cols-1 md:grid-cols-3">
          <Card className="border border-border shadow-sm bg-surface">
            <CardHeader className="pb-2">
              <HStack className="mb-1">
                <Box className="size-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Shield className="size-4 text-brand-500" strokeWidth={1.5} />
                </Box>
                <CardTitle className="text-sm font-semibold">Autenticação</CardTitle>
              </HStack>
              <Text className="text-xs text-muted">JWT RS256 com refresh token integrado</Text>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <TextField>
                <Label className="text-xs font-medium">Email</Label>
                <Box className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="john@exemplo.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="pl-8 w-full text-sm"
                  />
                </Box>
              </TextField>

              <TextField>
                <Label className="text-xs font-medium">Senha</Label>
                <Box className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formSenha}
                    onChange={(e) => setFormSenha(e.target.value)}
                    className="pl-8 w-full text-sm"
                  />
                </Box>
              </TextField>

              <Button variant="primary" fullWidth size="sm" className="mt-1">
                Entrar na conta
              </Button>

              <HStack className="gap-3">
                <Box className="flex-1 h-px bg-border" />
                <Text as="span" className="text-xs text-muted">
                  ou
                </Text>
                <Box className="flex-1 h-px bg-border" />
              </HStack>

              <Grid className="grid-cols-2 gap-2">
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <Globe className="size-3.5" />
                  Google
                </button>
                <button
                  type="button"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <Github className="size-3.5" />
                  GitHub
                </button>
              </Grid>

              <HStack className="flex-wrap gap-2 pt-1">
                <Chip size="sm" variant="soft" color="success">
                  ✓ Refresh Token
                </Chip>
                <Chip size="sm" variant="soft" color="accent">
                  RS256
                </Chip>
                <Chip size="sm" variant="soft" color="default">
                  Stateless
                </Chip>
              </HStack>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm bg-surface">
            <CardHeader className="pb-2">
              <HStack className="mb-1">
                <Box className="size-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Activity className="size-4 text-accent" strokeWidth={1.5} />
                </Box>
                <CardTitle className="text-sm font-semibold">Controles & Progresso</CardTitle>
              </HStack>
              <Text className="text-xs text-muted">Switches, barras de progresso e tema</Text>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <VStack className="gap-3">
                <SwitchRoot
                  isSelected={theme === 'dark'}
                  onChange={toggleTheme}
                  className="flex-row items-center justify-between w-full"
                >
                  <SwitchContent className="flex items-center gap-2 text-sm font-medium">
                    {theme === 'dark' ? (
                      <Moon className="size-3.5 text-muted" />
                    ) : (
                      <Sun className="size-3.5 text-muted" />
                    )}
                    Modo escuro
                  </SwitchContent>
                  <SwitchControl>
                    <SwitchThumb />
                  </SwitchControl>
                </SwitchRoot>

                <SwitchRoot
                  isSelected={notif}
                  onChange={setNotif}
                  className="flex-row items-center justify-between w-full"
                >
                  <SwitchContent className="text-sm font-medium">Notificações</SwitchContent>
                  <SwitchControl>
                    <SwitchThumb />
                  </SwitchControl>
                </SwitchRoot>

                <SwitchRoot
                  isSelected={analytics}
                  onChange={setAnalytics}
                  className="flex-row items-center justify-between w-full"
                >
                  <SwitchContent className="text-sm font-medium">Analytics</SwitchContent>
                  <SwitchControl>
                    <SwitchThumb />
                  </SwitchControl>
                </SwitchRoot>
              </VStack>

              <Separator />

              <VStack className="gap-3">
                <ProgressBar value={78} color="accent">
                  <Label className="text-xs font-medium">CPU</Label>
                  <ProgressBarOutput className="text-xs text-muted" />
                  <ProgressBarTrack>
                    <ProgressBarFill />
                  </ProgressBarTrack>
                </ProgressBar>

                <ProgressBar value={45} color="success">
                  <Label className="text-xs font-medium">Memória</Label>
                  <ProgressBarOutput className="text-xs text-muted" />
                  <ProgressBarTrack>
                    <ProgressBarFill />
                  </ProgressBarTrack>
                </ProgressBar>

                <ProgressBar value={92} color="warning">
                  <Label className="text-xs font-medium">Disco</Label>
                  <ProgressBarOutput className="text-xs text-muted" />
                  <ProgressBarTrack>
                    <ProgressBarFill />
                  </ProgressBarTrack>
                </ProgressBar>
              </VStack>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm bg-surface">
            <CardHeader className="pb-2">
              <HStack className="mb-1">
                <Box className="size-7 rounded-lg bg-success/10 flex items-center justify-center">
                  <Zap className="size-4 text-success" strokeWidth={1.5} />
                </Box>
                <CardTitle className="text-sm font-semibold">Botões & Feedback</CardTitle>
              </HStack>
              <Text className="text-xs text-muted">Variantes, estados e notificações</Text>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <VStack className="gap-2">
                <Button variant="primary" size="sm" fullWidth>
                  <Rocket className="size-3.5" />
                  Deploy agora
                </Button>
                <Button variant="outline" size="sm" fullWidth>
                  <BookOpen className="size-3.5" />
                  Ver documentação
                </Button>
                <Button variant="danger-soft" size="sm" fullWidth>
                  Revogar acesso
                </Button>
                <Button variant="ghost" size="sm" fullWidth isDisabled>
                  Em desenvolvimento...
                </Button>
              </VStack>

              <Separator />

              <Box>
                <Text className="text-xs font-medium text-muted mb-3">Time do projeto</Text>
                <HStack className="flex-wrap gap-3">
                  {teamMembers.map((m) => (
                    <HStack key={m.name} className="gap-2">
                      <Box
                        className={`size-8 rounded-xl flex items-center justify-center text-xs font-black font-sans ${m.bg} ${m.text}`}
                      >
                        {m.initials}
                      </Box>
                      <VStack className="gap-0">
                        <Text className="text-xs font-semibold leading-none">{m.name}</Text>
                        <Text className="text-xs text-muted">{m.role}</Text>
                      </VStack>
                    </HStack>
                  ))}
                </HStack>
              </Box>

              <Separator />

              <VStack className="gap-2">
                {[
                  {
                    color: 'bg-success/10 border-success/25 text-success',
                    icon: '✓',
                    msg: 'Deploy realizado com sucesso',
                  },
                  {
                    color: 'bg-warning/10 border-warning/25 text-warning',
                    icon: '⚠',
                    msg: 'Rate limit em 80%',
                  },
                  {
                    color: 'bg-danger/10 border-danger/25 text-danger',
                    icon: '!',
                    msg: 'Token expirado',
                  },
                ].map((a) => (
                  <HStack
                    key={a.msg}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium ${a.color}`}
                  >
                    <Text as="span" className="shrink-0">
                      {a.icon}
                    </Text>
                    {a.msg}
                  </HStack>
                ))}
              </VStack>
            </CardContent>
          </Card>
        </Grid>

        <Grid className="mt-4 grid-cols-2 sm:grid-cols-4">
          {[
            {
              label: 'Linhas de código',
              value: '< 2k',
              icon: Code2,
              color: 'text-brand-500',
              bg: 'bg-brand-500/10',
            },
            {
              label: 'Dependências core',
              value: '18',
              icon: Package,
              color: 'text-success',
              bg: 'bg-success/10',
            },
            {
              label: 'Endpoints prontos',
              value: '5',
              icon: Globe,
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
            {
              label: 'Setup em minutos',
              value: '< 3',
              icon: Zap,
              color: 'text-danger',
              bg: 'bg-danger/10',
            },
          ].map((s) => (
            <HStack
              key={s.label}
              className="gap-3 p-4 rounded-xl border border-border bg-surface shadow-sm"
            >
              <Box
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}
              >
                <s.icon className={`size-5 ${s.color}`} />
              </Box>
              <VStack className="gap-0">
                <Text className="text-2xl font-black font-sans leading-none">{s.value}</Text>
                <Text className="text-xs text-muted">{s.label}</Text>
              </VStack>
            </HStack>
          ))}
        </Grid>
      </section>

      <Separator />

      {/* ════════════════════════════════════════════
          STACK
      ════════════════════════════════════════════ */}
      <section id="stack" className="bg-surface-secondary border-b border-border">
        <Container className="px-6 py-16">
          <VStack className="items-center gap-2 mb-10 text-center">
            <Chip
              variant="soft"
              size="sm"
              className="bg-brand-500/10 text-brand-600 border border-brand-500/20"
            >
              Stack
            </Chip>
            <Text as="h2" className="text-3xl font-bold font-sans">
              Tecnologias incluídas
            </Text>
          </VStack>

          <Accordion variant="surface" className="max-w-2xl mx-auto">
            {techStack.map((t) => (
              <AccordionItem key={t.category} id={t.category}>
                <AccordionHeading>
                  <AccordionTrigger className="flex items-center gap-3 w-full text-left">
                    <Box className="size-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                      <t.icon className="size-4 text-brand-500" />
                    </Box>
                    <Text as="span" className="font-semibold text-sm">
                      {t.category}
                    </Text>
                    <Text as="span" className="ml-auto text-xs text-muted">
                      {t.items.length} tecnologias
                    </Text>
                    <AccordionIndicator className="shrink-0" />
                  </AccordionTrigger>
                </AccordionHeading>
                <AccordionPanel>
                  <AccordionBody className="flex flex-wrap gap-2 pb-4 pl-11">
                    {t.items.map((item) => (
                      <Chip key={item} variant="soft" color="default" size="sm">
                        {item}
                      </Chip>
                    ))}
                  </AccordionBody>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </section>

      {/* ════════════════════════════════════════════
          COMO FUNCIONA
      ════════════════════════════════════════════ */}
      <section id="steps" className="max-w-6xl mx-auto px-6 py-16">
        <VStack className="items-center gap-2 mb-10 text-center">
          <Chip
            variant="soft"
            size="sm"
            className="bg-brand-500/10 text-brand-600 border border-brand-500/20"
          >
            Como funciona
          </Chip>
          <Text as="h2" className="text-3xl font-bold font-sans">
            3 passos para começar
          </Text>
        </VStack>

        <Grid className="grid-cols-1 sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <VStack
              key={s.n}
              className="relative gap-4 p-6 rounded-2xl border border-border bg-surface shadow-sm"
            >
              {i < steps.length - 1 && (
                <Box className="hidden sm:block absolute top-8 right-0 translate-x-1/2 text-border">
                  <ArrowRight className="size-4" />
                </Box>
              )}
              <Box className="size-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Text as="span" className="text-sm font-black font-sans text-brand-500">
                  {s.n}
                </Text>
              </Box>
              <Box>
                <Text as="h3" className="font-bold font-sans text-sm mb-2">
                  {s.title}
                </Text>
                <Text className="text-xs text-muted leading-relaxed">{s.desc}</Text>
              </Box>
            </VStack>
          ))}
        </Grid>
      </section>

      {/* ════════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════ */}
      <section className="border-t border-border bg-surface">
        <VStack className="max-w-6xl mx-auto px-6 py-20 items-center gap-6 text-center">
          <Box className="size-16 rounded-2xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Rocket className="size-8 text-white" />
          </Box>

          <Box>
            <Text as="h2" className="text-4xl font-black font-sans mb-3">
              Pronto para começar?
            </Text>
            <Text className="text-muted max-w-md text-sm">
              Clone, configure e tenha um projeto full-stack profissional rodando em minutos.
            </Text>
          </Box>

          <HStack className="bg-surface-secondary border border-border rounded-xl px-5 py-3 font-mono text-sm w-full max-w-lg">
            <Terminal className="size-4 text-muted shrink-0" />
            <Text as="span" className="text-muted select-none">
              $
            </Text>
            <Text as="span" className="text-foreground">
              git clone catalyst-skeleton && ./setup.sh
            </Text>
          </HStack>

          <HStack className="gap-3 flex-wrap justify-center">
            {!autenticado && (
              <button
                type="button"
                onClick={onAbrirModal}
                className={buttonVariants({ variant: 'primary' })}
              >
                <LogIn className="size-4" />
                Experimentar agora
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'outline' })}
            >
              <Github className="size-4" />
              Ver no GitHub
            </a>
            <a href="#" className={buttonVariants({ variant: 'ghost' })}>
              <BookOpen className="size-4" />
              Documentação
            </a>
          </HStack>

          <HStack className="gap-2 text-xs text-muted">
            <CheckCircle2 className="size-3 text-success" />
            MIT License · Open Source · Sem vendor lock-in
          </HStack>
        </VStack>
      </section>
    </Box>
  )
})
