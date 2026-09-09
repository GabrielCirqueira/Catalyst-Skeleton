import { ModalAuth } from '@features/auth/ModalAuth'
import { useAuthStore } from '@stores/useAuthStore'
import {
  Accordion,
  AccordionBody,
  AccordionHeading,
  AccordionIndicator,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Alert,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarRoot,
  Badge,
  BadgeAnchor,
  BadgeRoot,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Chip,
  Separator,
  buttonVariants,
  useOverlayState,
} from '@heroui/react'
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Database,
  Github,
  Globe,
  KeyRound,
  LayersIcon,
  LogIn,
  Package,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react'

const stats = [
  { label: 'Linhas de código', value: '< 2k', icon: Code2, color: 'text-accent' },
  { label: 'Dependências core', value: '18', icon: Package, color: 'text-success' },
  { label: 'Endpoints prontos', value: '5', icon: Globe, color: 'text-warning' },
  { label: 'Setup em minutos', value: '< 3', icon: Zap, color: 'text-danger' },
]

const features = [
  {
    icon: KeyRound,
    title: 'JWT RS256 Completo',
    description: 'Login, cadastro, refresh token e revogação. Middleware de rota protegida no React e firewalls no Symfony.',
    chip: 'Auth',
    chipColor: 'accent' as const,
  },
  {
    icon: Server,
    title: 'API REST Estruturada',
    description: 'Padrão Resultado para respostas consistentes. Serializer configurado, CORS e rate limiter prontos.',
    chip: 'Backend',
    chipColor: 'default' as const,
  },
  {
    icon: Activity,
    title: 'Qualidade de Código',
    description: 'PHPStan nível 6, PHPCS, Biome, Husky e Commitlint. CI local que bloqueia código ruim antes do commit.',
    chip: 'DX',
    chipColor: 'success' as const,
  },
  {
    icon: LayersIcon,
    title: 'Arquitetura em Camadas',
    description: 'Entity → Repository → Service → Controller. Separação clara de responsabilidades desde o primeiro arquivo.',
    chip: 'Estrutura',
    chipColor: 'warning' as const,
  },
  {
    icon: Database,
    title: 'Doctrine ORM 3',
    description: 'Entidades com atributos PHP 8, migrations versionadas e repositórios tipados prontos para uso.',
    chip: 'ORM',
    chipColor: 'default' as const,
  },
  {
    icon: Sparkles,
    title: 'Módulos Opt-in',
    description: 'Async (Messenger + Supervisor), Observability (Sentry) e UI Extra (Motion + Recharts) ativados no setup.',
    chip: 'Modular',
    chipColor: 'accent' as const,
  },
]

const techStack = [
  {
    category: 'Backend',
    icon: Server,
    items: ['PHP 8.4', 'Symfony 7.3', 'Doctrine ORM 3', 'Lexik JWT', 'Gesdinet Refresh', 'Nelmio CORS'],
  },
  {
    category: 'Frontend',
    icon: Code2,
    items: ['React 19', 'TypeScript 5.9', 'Vite 7', 'Tailwind CSS 4', 'HeroUI v3', 'React Router 7'],
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
  { n: '01', title: 'Clone e configure', desc: 'Execute ./scripts/setup.sh, escolha os módulos e configure .env automaticamente.' },
  { n: '02', title: 'Suba o ambiente', desc: 'docker compose up -d inicia backend, frontend, banco e proxy em segundos.' },
  { n: '03', title: 'Comece a codar', desc: 'Autenticação pronta, rotas protegidas, hot reload — foque na sua regra de negócio.' },
]

const contributors = [
  { name: 'Gabriel C.', role: 'Arquitetura', color: 'accent' as const },
  { name: 'API Dev', role: 'Backend', color: 'success' as const },
  { name: 'UI Dev', role: 'Frontend', color: 'warning' as const },
]

export function Component() {
  const autenticado = useAuthStore((s) => s.autenticado)
  const usuario = useAuthStore((s) => s.usuario)
  const modalAuth = useOverlayState()

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-soft)_0%,transparent_60%)] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">

          <Chip color="accent" variant="soft" size="sm" className="motion-preset-fade">
            <Sparkles className="size-3 mr-1" />
            v5.0 · Tailwind 4 + HeroUI v3
          </Chip>

          <div className="size-20 rounded-3xl bg-accent flex items-center justify-center shadow-xl motion-preset-fade motion-delay-100">
            <Code2 className="size-10 text-accent-foreground" strokeWidth={2} />
          </div>

          <div className="flex flex-col gap-2 motion-preset-slide-up motion-delay-200">
            <h1 className="text-5xl sm:text-6xl font-black font-sans tracking-tight">
              Catalyst <span className="text-accent">Skeleton</span>
            </h1>
            <p className="text-xl text-muted max-w-xl">
              Fundação opinativa para aplicações full-stack <strong className="text-foreground">Symfony + React</strong>.
              Core enxuto, módulos opt-in, pronto para produção.
            </p>
          </div>

          {autenticado ? (
            <Alert status="success" className="max-w-sm motion-preset-fade motion-delay-300">
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Autenticado</AlertTitle>
                <AlertDescription>Bem-vindo, {usuario?.nomeCompleto ?? usuario?.username}!</AlertDescription>
              </AlertContent>
            </Alert>
          ) : (
            <div className="flex gap-3 flex-wrap justify-center motion-preset-fade motion-delay-300">
              <button type="button" onClick={modalAuth.open} className={buttonVariants({ variant: 'primary' })}>
                <LogIn className="size-4" />
                Fazer login
              </button>
              <button type="button" onClick={modalAuth.open} className={buttonVariants({ variant: 'outline' })}>
                Criar conta
                <ArrowRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <s.icon className={`size-6 ${s.color}`} />
              <p className="text-3xl font-black font-sans">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center gap-2 mb-12 text-center">
          <Chip color="accent" variant="soft" size="sm">Funcionalidades</Chip>
          <h2 className="text-3xl font-bold font-sans">O que vem no core</h2>
          <p className="text-muted max-w-md">Tudo que você precisa para começar. Nada que você não vai usar.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    <f.icon className="size-5 text-accent" strokeWidth={2} />
                  </div>
                  <Chip color={f.chipColor} variant="soft" size="sm">{f.chip}</Chip>
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{f.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center gap-2 mb-12 text-center">
            <Chip color="success" variant="soft" size="sm">Como funciona</Chip>
            <h2 className="text-3xl font-bold font-sans">3 passos para começar</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black font-sans text-accent/20">{s.n}</span>
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex flex-1 items-center">
                      <div className="h-px bg-border flex-1" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold font-sans">{s.title}</h3>
                <p className="text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Tech Stack Accordion ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center gap-2 mb-12 text-center">
          <Chip color="warning" variant="soft" size="sm">Stack</Chip>
          <h2 className="text-3xl font-bold font-sans">Tecnologias incluídas</h2>
        </div>

        <Accordion variant="surface" className="max-w-2xl mx-auto">
          {techStack.map((t) => (
            <AccordionItem key={t.category} id={t.category}>
              <AccordionHeading>
                <AccordionTrigger className="flex items-center gap-3 w-full text-left">
                  <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <t.icon className="size-4 text-accent" />
                  </div>
                  <span className="font-semibold">{t.category}</span>
                  <span className="ml-auto text-xs text-muted">{t.items.length} tecnologias</span>
                  <AccordionIndicator className="shrink-0" />
                </AccordionTrigger>
              </AccordionHeading>
              <AccordionPanel>
                <AccordionBody className="flex flex-wrap gap-2 pb-4 pl-11">
                  {t.items.map((item) => (
                    <Chip key={item} variant="soft" color="default" size="sm">{item}</Chip>
                  ))}
                </AccordionBody>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Separator />

      {/* ── Alerts showcase ───────────────────────────────────── */}
      <section className="bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center gap-2 mb-12 text-center">
            <Chip color="danger" variant="soft" size="sm">Componentes</Chip>
            <h2 className="text-3xl font-bold font-sans">Feedback visual pronto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Alert status="success">
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Deploy realizado</AlertTitle>
                <AlertDescription>Versão 2.4.1 em produção com sucesso.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert status="warning">
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Rate limit próximo</AlertTitle>
                <AlertDescription>80% das requisições utilizadas nesta hora.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert status="danger">
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Falha na autenticação</AlertTitle>
                <AlertDescription>Token expirado. Faça login novamente.</AlertDescription>
              </AlertContent>
            </Alert>
            <Alert status="accent">
              <AlertIndicator />
              <AlertContent>
                <AlertTitle>Nova versão disponível</AlertTitle>
                <AlertDescription>Skeleton v5.1 com melhorias de performance.</AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Contributors / Avatars ────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex flex-col items-center gap-2 mb-12 text-center">
          <Chip color="default" variant="soft" size="sm">Time</Chip>
          <h2 className="text-3xl font-bold font-sans">Construído com carinho</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {contributors.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-2">
              <BadgeRoot>
                <BadgeAnchor>
                  <AvatarRoot size="lg" color={c.color}>
                    <AvatarFallback color={c.color}>{c.name.slice(0, 2)}</AvatarFallback>
                  </AvatarRoot>
                </BadgeAnchor>
              </BadgeRoot>
              <div className="text-center">
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-muted">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ─────────────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center gap-6 text-center">
          <div className="size-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg">
            <Rocket className="size-7 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-sans mb-2">Pronto para começar?</h2>
            <p className="text-muted max-w-md">Clone, configure e tenha um projeto full-stack profissional rodando em minutos.</p>
          </div>

          <Card className="w-full max-w-md">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 bg-surface-secondary rounded-xl px-4 py-3 font-mono text-sm">
                <Terminal className="size-4 text-muted shrink-0" />
                <span className="text-muted">$</span>
                <span className="text-foreground">git clone catalyst-skeleton && ./setup.sh</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 flex-wrap justify-center">
            {!autenticado && (
              <button type="button" onClick={modalAuth.open} className={buttonVariants({ variant: 'primary' })}>
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
            <a
              href="#"
              className={buttonVariants({ variant: 'ghost' })}
            >
              <BookOpen className="size-4" />
              Documentação
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted">
            <CheckCircle2 className="size-3 text-success" />
            MIT License · Open Source · Sem vendor lock-in
          </div>
        </div>
      </section>

      {/* Modal de autenticação */}
      <ModalAuth isOpen={modalAuth.isOpen} onClose={modalAuth.close} />
    </div>
  )
}
