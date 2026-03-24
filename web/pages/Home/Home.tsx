import { useTheme } from '@/contexts'
import { AppContainer } from '@/layouts'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card } from '@/shadcn/components/ui/card'
import { Dialog, DialogContent } from '@/shadcn/components/ui/dialog'
import { Icon } from '@/shadcn/components/ui/icon'
import { Box, Container, Footer, Grid, HStack, VStack } from '@/shadcn/components/ui/layout'
import { Link } from '@/shadcn/components/ui/link'
import { Separator } from '@/shadcn/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shadcn/components/ui/table'
import { Text, Title } from '@/shadcn/components/ui/typography'
import { useAuthStore } from '@/stores/useAuthStore'
import { ModalAuth } from '@features/auth'
import {
  ArrowRight,
  Calendar,
  Code2,
  FileCode2,
  FolderTree,
  Github,
  Globe2,
  Layers,
  LayoutTemplate,
  MessageSquare,
  Moon,
  Palette,
  PlayCircle,
  Rocket,
  Shield,
  ShieldCheck,
  Sun,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

const Navigation = ({ theme, toggleTheme, onOpenAuth, autenticado, usuario, onLogout }: any) => {
  const [isScrolled, setIsScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    window.onscroll = () => setIsScrolled(window.scrollY > 20)
  }

  return (
    <Box
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-white/70 dark:bg-background-950/70 backdrop-blur-xl border-outline-100/50 dark:border-outline-900/50 py-3'
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <Container size="xl">
        <HStack className="justify-between items-center w-full">
          <Box className="flex-1 flex justify-start">
            <HStack
              className="gap-3.5 items-center group cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <Box className="size-11 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:rotate-6 transition-transform">
                <Icon icon={Code2} className="size-5.5 text-white" strokeWidth={2.5} />
              </Box>
              <VStack className="gap-0.5">
                <Title
                  size="lg"
                  className="font-poppins font-black text-typography-950 dark:text-white leading-none tracking-tighter"
                >
                  Catalyst <span className="text-brand-500">Skeleton</span>
                </Title>
                <Text className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-600 dark:text-brand-400 leading-none mt-1">
                  Engineering Suite
                </Text>
              </VStack>
            </HStack>
          </Box>

          <Box className="flex-none">
            <HStack className="gap-8 items-center hidden lg:flex">
              {['Recursos', 'Arquitetura', 'Stack', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-bold text-typography-500 hover:text-brand-600 dark:text-typography-400 dark:hover:text-white transition-all relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 transition-all group-hover:w-full" />
                </a>
              ))}
            </HStack>
          </Box>

          <Box className="flex-1 flex justify-end">
            <HStack className="gap-4 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-xl size-10 text-typography-500 hover:bg-background-100 dark:hover:bg-background-900 border border-transparent hover:border-outline-100 dark:hover:border-outline-900 transition-all"
              >
                <Icon icon={theme === 'light' ? Moon : Sun} className="size-4.5" />
              </Button>

              <Separator
                orientation="vertical"
                className="h-5 bg-outline-100 dark:bg-outline-900 hidden md:block"
              />

              {autenticado ? (
                <HStack className="gap-4 items-center">
                  <Text className="text-sm font-bold text-typography-950 dark:text-white hidden sm:block">
                    {usuario?.username}
                  </Text>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl h-10 px-6 font-bold border-outline-100 dark:border-outline-900 hover:bg-background-50 dark:hover:bg-background-900"
                    onClick={onLogout}
                  >
                    Sair
                  </Button>
                </HStack>
              ) : (
                <HStack className="gap-3">
                  <Button
                    variant="ghost"
                    className="hidden md:flex font-bold text-typography-600 hover:text-typography-950 dark:text-typography-400 dark:hover:text-white"
                    onClick={() => onOpenAuth('login')}
                  >
                    Entrar
                  </Button>
                  <Button
                    size="default"
                    className="rounded-xl h-10 px-6 font-bold bg-brand-500 text-white hover:bg-brand-600 shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-0.5"
                    onClick={() => onOpenAuth('cadastro')}
                  >
                    Get Started
                  </Button>
                </HStack>
              )}
            </HStack>
          </Box>
        </HStack>
      </Container>
    </Box>
  )
}

const Hero = ({ onDemo, onOpenAuth, autenticado }: any) => {
  return (
    <Container size="xl" className="pt-40 pb-20 md:pt-56 md:pb-32 relative">
      <div className="absolute top-1/4 -left-20 size-[600px] bg-brand-500/[0.05] rounded-full blur-[120px] pointer-events-none" />

      <Grid className="grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <VStack className="lg:col-span-7 gap-8 relative z-10">
          <HStack className="gap-3 items-center">
            <Badge
              variant="secondary"
              className="bg-brand-500/10 text-brand-700 dark:text-brand-400 border-brand-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <span className="size-1.5 rounded-full bg-brand-500 mr-2 animate-pulse" />
              v4.0.0 Stable
            </Badge>
            <Text className="text-xs font-bold text-typography-400 dark:text-typography-600 uppercase tracking-widest">
              PHP 8.4 + React 19
            </Text>
          </HStack>

          <Title
            size="4xl"
            className="font-poppins font-extrabold leading-[1.1] text-typography-950 dark:text-white text-4xl md:text-6xl lg:text-7xl tracking-tight"
          >
            O ponto de partida <br />
            para sistemas <br />
            de <span className="text-brand-500">alto desempenho</span>.
          </Title>
          <Text className="text-lg leading-relaxed text-typography-600 dark:text-typography-400 font-medium max-w-xl">
            O Catalyst Skeleton fornece a infraestrutura profissional necessária para aplicações
            SaaS modernas. Escalabilidade Horizontal, Clean Architecture e Performance em um só
            lugar.
          </Text>

          <HStack className="gap-4 flex-wrap pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            {autenticado ? (
              <Button
                size="lg"
                className="h-14 px-10 bg-brand-500 text-white hover:bg-brand-600 font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-1"
              >
                Painel de Controle
                <Icon icon={ArrowRight} className="size-4 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-14 px-10 bg-brand-500 text-white hover:bg-brand-600 font-bold shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-1"
                onClick={() => onOpenAuth('cadastro')}
              >
                Iniciar Projeto Agora
                <Icon icon={ArrowRight} className="size-4 ml-2" />
              </Button>
            )}
            <Button
              size="lg"
              variant="secondary"
              className="h-14 px-10 bg-background-100 dark:bg-background-800 text-typography-950 dark:text-white hover:bg-background-200 dark:hover:bg-background-700 font-bold transition-all"
              onClick={onDemo}
            >
              <Icon icon={PlayCircle} className="size-5 mr-2 text-brand-500" />
              Ver Demonstração
            </Button>
          </HStack>
        </VStack>

        <Box className="lg:col-span-5 relative animate-in fade-in slide-in-from-right duration-1000 delay-300">
          <Card className="bg-white dark:bg-background-900 border border-outline-100 dark:border-outline-900 shadow-2xl rounded-2xl overflow-hidden p-2">
            <Box className="bg-background-50 dark:bg-background-950 rounded-xl overflow-hidden border border-outline-100 dark:border-outline-900">
              <HStack className="px-5 py-3 border-b border-outline-100 dark:border-outline-900 bg-white dark:bg-background-900 items-center justify-between">
                <HStack className="gap-1.5">
                  <div className="size-2.5 rounded-full bg-error-500/40" />
                  <div className="size-2.5 rounded-full bg-warning-500/40" />
                  <div className="size-2.5 rounded-full bg-success-500/40" />
                </HStack>
                <Text className="text-[10px] font-mono font-bold text-typography-400 uppercase tracking-widest">
                  terminal
                </Text>
              </HStack>
              <VStack className="gap-3 p-6 font-mono text-xs leading-relaxed">
                <HStack className="gap-3">
                  <Text className="text-brand-500">❯</Text>
                  <Text className="text-typography-950 dark:text-typography-300">
                    git clone catalyst-skeleton
                  </Text>
                </HStack>
                <HStack className="gap-3">
                  <Text className="text-brand-500">❯</Text>
                  <Text className="text-typography-950 dark:text-typography-300">
                    bash setup.sh
                  </Text>
                </HStack>
                <div className="h-px bg-outline-100 dark:bg-outline-900 my-1" />
                <Text className="text-success-500/80">✓ Modules synchronized</Text>
                <Text className="text-success-500/80">✓ RS256 Keypair generated</Text>
                <Text className="text-success-500/80">✓ Database provisioned</Text>
                <Text className="text-brand-500 font-bold mt-2">Ready to ship.</Text>
              </VStack>
            </Box>
          </Card>

          <Box className="absolute -bottom-6 -left-6 bg-white dark:bg-background-800 border border-outline-100 dark:border-outline-900 p-5 rounded-xl shadow-xl animate-bounce-slow">
            <VStack className="gap-1">
              <Text className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest">
                Status
              </Text>
              <HStack className="gap-2 items-center">
                <div className="size-2 rounded-full bg-success-500" />
                <Title size="lg" className="font-poppins font-black">
                  PROD READY
                </Title>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Grid>
    </Container>
  )
}

const DNASection = () => {
  return (
    <Box
      id="stack"
      className="bg-background-50 dark:bg-background-950 py-32 border-y border-outline-100 dark:border-outline-900"
    >
      <Container size="xl">
        <VStack className="gap-20">
          <VStack className="gap-6 text-center max-w-2xl mx-auto ">
            <Text className="text-xs w-full text-center font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              The Skeleton DNA
            </Text>
            <Title
              size="4xl"
              className="font-poppins font-black text-center w-full text-typography-950 dark:text-white tracking-tight"
            >
              Catalyst Skeleton Elite
            </Title>
            <Text className="text-lg text-typography-600 dark:text-typography-400 font-medium">
              Escolhemos ferramentas que priorizam a manutenção a longo prazo e a produtividade
              extrema.
            </Text>
          </VStack>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
            <Card className="md:col-span-8 bg-white dark:bg-background-900 border-outline-100 dark:border-outline-900 group overflow-hidden">
              <div className="absolute inset-0 bg-brand-500/[0.02] pointer-events-none" />
              <VStack className="p-10 gap-8 h-full">
                <HStack className="justify-between items-center">
                  <Badge
                    variant="secondary"
                    className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  >
                    Backend Core
                  </Badge>
                  <Icon icon={Code2} className="size-6 text-brand-500" />
                </HStack>
                <VStack className="gap-2">
                  <Title size="3xl" className="font-poppins font-black">
                    PHP 8.4 + Symfony 7.3
                  </Title>
                  <Text className="text-typography-600 dark:text-typography-400 max-w-md">
                    O motor por trás da escalabilidade. Atributos nativos, Messenger para filas
                    assíncronas e tipagem rigorosa.
                  </Text>
                </VStack>
              </VStack>
            </Card>

            <Card className="md:col-span-4 bg-white dark:bg-background-900 border-outline-100 dark:border-outline-900 overflow-hidden group">
              <VStack className="p-10 gap-8 h-full justify-between">
                <Badge variant="secondary" className="w-fit bg-blue-500/10 text-blue-600">
                  Frontend
                </Badge>
                <VStack className="gap-2">
                  <Title size="2xl" className="font-poppins font-black">
                    React 19
                  </Title>
                  <Text className="text-sm text-typography-500">
                    Renderização ultrarrápida com concurrent mode.
                  </Text>
                </VStack>
                <HStack className="gap-3">
                  <Badge className="bg-background-50 dark:bg-background-800 text-typography-500 font-bold border-none">
                    Vite 7
                  </Badge>
                  <Badge className="bg-background-50 dark:bg-background-800 text-typography-500 font-bold border-none">
                    Zustand 5
                  </Badge>
                </HStack>
              </VStack>
            </Card>

            {[
              {
                label: 'Styles',
                title: 'Tailwind 4.0',
                desc: 'CSS Zero-runtime com performance máxima.',
                col: 'md:col-span-4',
              },
              {
                label: 'Database',
                title: 'MySQL 8.3',
                desc: 'Sólido e confiável para dados estruturados.',
                col: 'md:col-span-4',
              },
              {
                label: 'Data Fetching',
                title: 'TanStack Query',
                desc: 'Cache e sincronização global de estado.',
                col: 'md:col-span-4',
              },
            ].map((item, i) => (
              <Card
                key={i}
                className={`${item.col} bg-white dark:bg-background-900 border-outline-100 dark:border-outline-900 p-10 hover:shadow-xl transition-all group`}
              >
                <VStack className="gap-6">
                  <Text className="text-xs font-bold text-typography-400 uppercase tracking-widest">
                    {item.label}
                  </Text>
                  <Title
                    size="xl"
                    className="font-poppins font-black group-hover:text-brand-500 transition-colors"
                  >
                    {item.title}
                  </Title>
                  <Text className="text-sm text-typography-500 leading-relaxed">{item.desc}</Text>
                </VStack>
              </Card>
            ))}
          </div>
        </VStack>
      </Container>
    </Box>
  )
}

const FeatureSection = () => {
  return (
    <Box id="recursos" className="bg-white dark:bg-background-950 py-32">
      <Container size="xl">
        <VStack className="gap-20">
          <VStack className="gap-6 text-center max-w-3xl mx-auto">
            <Text className="mx-auto text-xs font-bold uppercase tracking-[0.2em] text-typography-400">
              Funcionalidades Core
            </Text>
            <Title
              size="4xl"
              className="font-poppins font-black text-typography-950 dark:text-white tracking-tight"
            >
              Arquitetura voltada a alto impacto
            </Title>
            <Text className="text-xl text-typography-600 dark:text-typography-400 font-medium leading-relaxed">
              Elimine o custo de manutenção com uma estrutura que proíbe o código ruim por design.
            </Text>
          </VStack>

          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: 'Clean Architecture (DDD)',
                desc: 'Entidades com UUID v7 nativo e Services atômicos. Separação total entre web e domínio.',
              },
              {
                icon: Shield,
                title: 'Security RS256',
                desc: 'Autenticação assimétrica rigorosa. Tokens JWT assinados com chaves RSA de alto nível.',
              },
              {
                icon: Rocket,
                title: 'Concurrent React',
                desc: 'Performance extrema com React 19 e Zustand lidando com o estado da interface.',
              },
              {
                icon: LayoutTemplate,
                title: 'Shadcn UI Native',
                desc: 'Biblioteca de componentes injetada diretamente no seu diretório para customização total.',
              },
              {
                icon: Zap,
                title: 'Vite 7 Performance',
                desc: 'Hot Module Replacement instantâneo e build otimizado para os navegadores modernos.',
              },
              {
                icon: Globe2,
                title: 'Ready for Scale',
                desc: 'Docker Multi-stage preparado para produção com Nginx e certbot automatizados.',
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="group bg-white dark:bg-background-900 border-outline-100 dark:border-outline-900 p-8 rounded-xl transition-all duration-300 hover:border-brand-500/30 hover:-translate-y-1"
              >
                <VStack className="gap-6">
                  <Box className="size-11 rounded-lg bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                    <Icon
                      icon={item.icon}
                      className="size-5 text-brand-500 group-hover:text-white"
                      strokeWidth={2}
                    />
                  </Box>
                  <VStack className="gap-2">
                    <Title
                      size="xl"
                      className="font-poppins font-bold text-typography-950 dark:text-white"
                    >
                      {item.title}
                    </Title>
                    <Text className="text-sm text-typography-600 dark:text-typography-400 leading-relaxed">
                      {item.desc}
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </Container>
    </Box>
  )
}

const ArchitectureSection = () => {
  return (
    <Container size="xl" id="architecture" className="py-32">
      <Grid className="grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <VStack className="gap-8 order-2 lg:order-1">
          <Badge
            variant="outline"
            className="w-fit rounded-lg border-typography-500/20 bg-typography-500/10 text-typography-700 dark:text-typography-300 font-bold uppercase tracking-widest text-xs"
          >
            O Core da Operação
          </Badge>
          <Title
            size="4xl"
            className="font-heading font-black leading-tight text-typography-950 dark:text-white"
          >
            Construído para não virar um sistema legado.
          </Title>
          <Text className="text-xl text-typography-600 dark:text-typography-400 leading-relaxed font-medium">
            Monólitos modulares são a arquitetura perfeita. Nós quebramos as regras pesadas de DDD
            em algo prático. Um Service controla a lógica da transação. Um DTO transporta o que
            entrou da Web. E a Entidade simplesmente garante os invariantes.
          </Text>

          <VStack className="gap-6 mt-6">
            <Card className="bg-white dark:bg-background-900 border border-outline-100 dark:border-outline-800 p-6 rounded-xl hover:border-brand-500/50 transition-colors">
              <HStack className="gap-4 items-start">
                <Icon icon={FolderTree} className="size-8 text-brand-500 shrink-0" />
                <VStack className="gap-2">
                  <Title
                    size="xl"
                    className="font-heading font-bold text-typography-950 dark:text-white"
                  >
                    Organização por Features
                  </Title>
                  <Text className="text-typography-600 dark:text-typography-400">
                    Pastas agrupam todo o contexto. O módulo Auth tem seus próprios hooks, API e
                    views em '/features/auth'.
                  </Text>
                </VStack>
              </HStack>
            </Card>
            <Card className="bg-white dark:bg-background-900 border border-outline-100 dark:border-outline-800 p-6 rounded-xl hover:border-brand-500/50 transition-colors">
              <HStack className="gap-4 items-start">
                <Icon icon={Zap} className="size-8 text-brand-500 shrink-0" />
                <VStack className="gap-2">
                  <Title
                    size="xl"
                    className="font-heading font-bold text-typography-950 dark:text-white"
                  >
                    Respostas Tipadas
                  </Title>
                  <Text className="text-typography-600 dark:text-typography-400">
                    Nenhum array dinâmico trafega na rede. O PHP usa Seriaizers e o TypeScript
                    garante o Data Fetching via Axios injetado.
                  </Text>
                </VStack>
              </HStack>
            </Card>
          </VStack>
        </VStack>

        <Box className="order-1 lg:order-2 bg-background-50 dark:bg-background-900 rounded-3xl p-8 border border-outline-100 dark:border-outline-800 shadow-sm relative">
          <Card className="bg-typography-950 text-white rounded-2xl overflow-hidden shadow-2xl relative z-10">
            <HStack className="px-6 py-4 bg-black/50 border-b border-typography-800 items-center gap-4">
              <Icon icon={FileCode2} className="size-5 text-typography-500" />
              <Text className="text-sm font-mono font-bold text-typography-400">
                src/Service/UsuarioService.php
              </Text>
            </HStack>
            <Box className="p-8">
              <pre className="font-mono text-sm leading-loose">
                <span className="text-brand-400">public function</span>{' '}
                <span className="text-blue-400">executar</span>(
                <span className="text-yellow-400">CriarUsuarioDTO</span> $dto):{' '}
                <span className="text-yellow-400">Resultado</span>
                <br />
                {'{'}
                <br />
                {'    '}if ($this-&gt;repositorio-&gt;emailExiste($dto-&gt;email)) {'{'}
                <br />
                {'        '}return Resultado::falha(
                <span className="text-green-400">'email_duplicado'</span>);
                <br />
                {'    '}
                {'}'}
                <br />
                <br />
                {'    '}$usuario = new Usuario($dto-&gt;email, $dto-&gt;senha);
                <br />
                {'    '}$this-&gt;repositorio-&gt;salvar($usuario);
                <br />
                <br />
                {'    '}return Resultado::sucesso($usuario);
                <br />
                {'}'}
              </pre>
            </Box>
          </Card>

          <Box className="absolute top-1/4 -left-6 bg-white dark:bg-background-950 border border-outline-100 dark:border-outline-800 p-4 rounded-xl shadow-lg z-20">
            <HStack className="gap-3 items-center">
              <Box className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Icon icon={Shield} className="size-5 text-blue-600 dark:text-blue-400" />
              </Box>
              <Text className="font-bold text-typography-950 dark:text-white">
                Validation Error=422
              </Text>
            </HStack>
          </Box>
        </Box>
      </Grid>
    </Container>
  )
}

const UIComponentsSection = () => {
  return (
    <Box id="tech-stack" className="bg-typography-950 py-32 text-white overflow-hidden">
      <Container size="xl">
        <Grid className="grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <Box className="relative w-full h-[500px] flex items-center justify-center">
            <div className="absolute size-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full max-w-[340px] h-[400px]">
              <Card className="absolute bottom-0 right-0 w-[280px] bg-typography-900 border border-typography-800 text-white p-7 rounded-3xl shadow-2xl z-0 transform translate-y-6 translate-x-6">
                <VStack className="gap-5">
                  <HStack className="gap-3 items-center">
                    <Box className="size-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                      <Icon icon={Moon} className="size-5 text-white" />
                    </Box>
                    <Title size="lg" className="font-heading font-black">
                      Dark Mode
                    </Title>
                  </HStack>
                  <div className="h-1.5 w-full bg-typography-800 rounded-full" />
                  <div className="h-1.5 w-2/3 bg-typography-800 rounded-full" />
                </VStack>
              </Card>

              <Card className="absolute top-0 left-0 w-full bg-white text-typography-950 p-8 sm:p-10 rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] z-10 border-outline-100">
                <VStack className="gap-8">
                  <VStack className="gap-2">
                    <Title size="xl" className="font-heading font-black tracking-tight">
                      Design System
                    </Title>
                    <Text className="text-sm text-typography-500 font-medium">
                      Contratos visuais de alta fidelidade.
                    </Text>
                  </VStack>

                  <Box className="w-full h-12 bg-background-50 border border-outline-100/50 rounded-xl px-4 flex items-center justify-between">
                    <Text className="text-xs font-mono text-brand-600 font-bold uppercase tracking-wider">
                      email_input.tsx
                    </Text>
                    <Icon icon={ShieldCheck} className="size-5 text-success-500" />
                  </Box>

                  <HStack className="gap-3 w-full">
                    <Button className="flex-1 rounded-xl h-12 bg-brand-600 hover:bg-brand-700 text-sm font-bold shadow-md shadow-brand-500/10">
                      Confirmar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-12 border-2 border-outline-100 bg-white text-typography-800 text-sm font-bold hover:bg-background-50"
                    >
                      Cancelar
                    </Button>
                  </HStack>
                </VStack>
              </Card>
            </div>
          </Box>

          <VStack className="gap-8">
            <Badge
              variant="outline"
              className="w-fit rounded-lg border-brand-500/30 bg-brand-500/5 text-brand-400 font-bold uppercase tracking-widest text-xs py-1.5 px-3"
            >
              UI & UX Architecture
            </Badge>
            <Title size="4xl" className="font-heading font-black leading-tight text-white mb-2">
              A espinha dorsal das interfaces escaláveis.
            </Title>
            <Text className="text-xl text-typography-400 leading-relaxed font-medium">
              Nós integramos o poder do Radix UI com a flexibilidade do Tailwind CSS. Cada
              componente é uma peça de engenharia desenhada para ser acessível, rápida e 100%
              customizável dentro do seu diretório `shadcn`.
            </Text>

            <Grid className="grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
              <VStack className="gap-4">
                <div className="size-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Icon icon={Palette} className="size-6 text-brand-400" />
                </div>
                <Title size="xl" className="font-heading font-bold text-white">
                  Design Tokens
                </Title>
                <Text className="text-typography-500 leading-relaxed">
                  Sistema de cores e sombras exportado do `DESIGN.md` para garantir consistência
                  total em todo o app.
                </Text>
              </VStack>
              <VStack className="gap-4">
                <div className="size-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <Icon icon={Globe2} className="size-6 text-brand-400" />
                </div>
                <Title size="xl" className="font-heading font-bold text-white">
                  Acessibilidade
                </Title>
                <Text className="text-typography-500 leading-relaxed">
                  Componentes que seguem os padrões WAI-ARIA, garantindo inclusão e navegação
                  perfeita via teclado em qualquer dispositivo.
                </Text>
              </VStack>
            </Grid>
          </VStack>
        </Grid>
      </Container>
    </Box>
  )
}

const FAQSection = () => {
  const faqs = [
    {
      q: 'Onde hospedar?',
      a: 'Qualquer VPS Linux. O Catalyst Skeleton vem com Docker pronto para produção, incluindo Nginx reverso e SSL automático.',
    },
    {
      q: 'Stack CSS',
      a: 'Usamos Tailwind CSS 4.0 nativo. Performance máxima, bundle size mínimo e tokens de design semânticos.',
    },
    {
      q: 'Escalabilidade',
      a: 'A arquitetura modular permite que você isole serviços pesados em Workers assíncronos configurados nativamente.',
    },
    {
      q: 'Suporte a Mobile',
      a: 'Interface 100% responsiva seguindo UX mobile-first e componentes adaptativos like Drawers.',
    },
  ]

  return (
    <Container size="xl" id="faq" className="py-32">
      <VStack className="gap-16 items-center">
        <VStack className="gap-4 text-center max-w-2xl">
          <Text className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
            Suporte
          </Text>
          <Title
            size="4xl"
            className="font-poppins font-black text-typography-950 dark:text-white tracking-tight"
          >
            Perguntas Frequentes
          </Title>
        </VStack>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 max-w-5xl w-full">
          {faqs.map((f, i) => (
            <VStack
              key={i}
              className="gap-4 p-8 bg-background-50 dark:bg-background-900 rounded-xl border border-outline-100 dark:border-outline-900"
            >
              <Title
                size="xl"
                className="font-poppins font-bold text-typography-950 dark:text-white"
              >
                {f.q}
              </Title>
              <Text className="text-base text-typography-600 dark:text-typography-400 leading-relaxed">
                {f.a}
              </Text>
            </VStack>
          ))}
        </div>
      </VStack>
    </Container>
  )
}

const TimelineSection = () => {
  const versions = [
    {
      v: 'V4',
      date: '23 Mar 2026',
      desc: 'Troca de Linters pelo Biome, CORS, Auth JWT, Nova Arquitetura de Features, Testes Unitários e Script setup.sh.',
    },
    {
      v: 'V3',
      date: '06 Out 2025',
      desc: 'Introdução de Linters, diretório cli/, Makefile com atalhos. Estreia de subversões em 3 branches: Mantine, Tailwind e Chakra.',
    },
    {
      v: 'V2',
      date: '01 Jun 2025',
      desc: 'Integração oficial do Chakra UI, suporte a tema escuro e melhorias gerais no DX (Developer Experience).',
    },
    {
      v: 'V1',
      date: '30 Jan 2025',
      desc: 'Lançamento inicial do Skeleton puro. Integração funcional entre React e Symfony focada em simplicidade.',
    },
  ]

  return (
    <Box className="bg-background-50 dark:bg-background-900/20 py-32 border-y border-outline-100 dark:border-outline-900">
      <Container size="xl">
        <VStack className="gap-16 items-center">
          <VStack className="gap-6 text-center max-w-2xl mx-auto">
            <HStack className="gap-3 w-full text-center justify-center items-center">
              <Icon icon={Calendar} className="size-5 text-brand-500" />
              <Text className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                Roadmap Evolutivo
              </Text>
            </HStack>
            <Title
              size="4xl"
              className="font-poppins text-center w-full font-black text-typography-950 dark:text-white tracking-tight"
            >
              Histórico do Catalyst
            </Title>
            <Text className="text-lg text-typography-600 dark:text-typography-400 font-medium">
              Acompanhe a trajetória de refinamento constante que transformou o Skeleton na base de
              elite que é hoje.
            </Text>
          </VStack>

          <Card className="w-full max-w-5xl mx-auto bg-white dark:bg-background-950 border border-outline-200 dark:border-outline-800 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-none">
            <Table className="w-full">
              <TableHeader className="bg-background-100/50 dark:bg-background-900/50 border-b border-outline-200 dark:border-outline-800">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="py-8 px-12 font-poppins font-black text-typography-950 dark:text-white uppercase tracking-widest text-[10px]">
                    Versão
                  </TableHead>
                  <TableHead className="py-8 px-12 font-poppins font-black text-typography-950 dark:text-white uppercase tracking-widest text-[10px]">
                    Lançamento
                  </TableHead>
                  <TableHead className="py-8 px-12 font-poppins font-black text-typography-950 dark:text-white uppercase tracking-widest text-[10px]">
                    Destaques e Refatorações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v, i) => (
                  <TableRow
                    key={i}
                    className="group border-outline-100 dark:border-outline-900 transition-all hover:bg-brand-500/[0.03]"
                  >
                    <TableCell className="py-10 px-12">
                      <HStack className="gap-4 items-center">
                        <Box
                          className={`size-2.5 rounded-full ${
                            i === 0
                              ? 'bg-success-500 animate-pulse ring-4 ring-success-500/20'
                              : 'bg-typography-200 dark:bg-typography-800'
                          }`}
                        />
                        <Text className="font-poppins font-black text-typography-950 dark:text-white text-2xl">
                          {v.v}
                        </Text>
                      </HStack>
                    </TableCell>
                    <TableCell className="py-10 px-12">
                      <Text className="font-bold text-typography-900 dark:text-typography-100 text-base">
                        {v.date}
                      </Text>
                    </TableCell>
                    <TableCell className="py-10 px-12">
                      <Text className="text-typography-600 dark:text-typography-400 leading-relaxed font-medium max-w-lg text-base">
                        {v.desc}
                      </Text>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </VStack>
      </Container>
    </Box>
  )
}

const FinalCTA = ({ onAuth, autenticado }: any) => (
  <Container size="xl" className="py-24">
    <Box className="w-full bg-brand-600 rounded-3xl p-16 md:p-24 text-center">
      <VStack className="gap-8 items-center max-w-4xl mx-auto">
        <Title size="4xl" className="font-heading font-black text-white leading-tight md:text-5xl">
          Chegou a hora de acelerar sua produtividade ao máximo.
        </Title>
        <Text className="text-2xl text-white/90 font-medium max-w-3xl">
          Tome as rédeas de um repositório configurado pelos maiores padrões mundiais e eleve sua
          aplicação corporativa em frações do tempo comum.
        </Text>
        <HStack className="gap-6 flex-wrap justify-center mt-6">
          {autenticado ? (
            <Button
              size="lg"
              className="h-16 px-12 rounded-xl font-bold text-lg bg-white text-typography-950 hover:bg-background-50 shadow-hard-2 hover:shadow-hard-4 hover:-translate-y-1 transition-all"
            >
              Acessar meu Painel de Controle
            </Button>
          ) : (
            <Button
              size="lg"
              className="h-16 px-12 rounded-xl font-bold text-lg bg-white text-typography-950 hover:bg-background-50 shadow-hard-2 hover:shadow-hard-4 hover:-translate-y-1 transition-all"
              onClick={() => onAuth('cadastro')}
            >
              Rodar meu projeto localmente
            </Button>
          )}
          <Button
            size="lg"
            className="h-16 px-12 rounded-xl font-bold text-lg text-white border-2 border-white/20 bg-white/5 hover:bg-white/10 hover:border-white transition-all"
          >
            Ler Toda Documentação
          </Button>
        </HStack>
      </VStack>
    </Box>
  </Container>
)

const MegaFooter = () => (
  <Footer className="bg-white dark:bg-background-950 border-t border-outline-100 dark:border-outline-900 py-24">
    <Container size="xl">
      <Grid className="grid-cols-1 md:grid-cols-12 gap-16 mb-20">
        <VStack className="md:col-span-6 gap-6">
          <HStack className="gap-3 items-center">
            <Box className="size-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Icon icon={Code2} className="size-5 text-white" strokeWidth={2.5} />
            </Box>
            <Title
              size="2xl"
              className="font-poppins font-black text-typography-950 dark:text-white tracking-tighter"
            >
              Catalyst Skeleton
            </Title>
          </HStack>
          <Text className="text-lg text-typography-600 dark:text-typography-400 leading-relaxed font-medium max-w-md">
            Fundação de elite para sistemas modernos. Construído com rigor de engenharia, seguindo
            Clean Architecture e DDD.
          </Text>
          <HStack className="gap-4 mt-4">
            <a
              href="#"
              className="p-2.5 rounded-lg bg-background-50 dark:bg-background-900 text-typography-500 hover:text-brand-500 transition-colors"
            >
              <Icon icon={Github} className="size-5" />
            </a>
            <a
              href="#"
              className="p-2.5 rounded-lg bg-background-50 dark:bg-background-900 text-typography-500 hover:text-brand-500 transition-colors"
            >
              <Icon icon={MessageSquare} className="size-5" />
            </a>
          </HStack>
        </VStack>
        <Box className="md:col-span-6">
          <Grid className="grid-cols-2 sm:grid-cols-3 gap-12">
            <VStack className="gap-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-400">
                Produto
              </Text>
              <VStack className="gap-3">
                <Link
                  href="#recursos"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Recursos
                </Link>
                <Link
                  href="#architecture"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Arquitetura
                </Link>
                <Link
                  href="#stack"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Stack
                </Link>
              </VStack>
            </VStack>
            <VStack className="gap-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-400">
                Recursos
              </Text>
              <VStack className="gap-3">
                <Link
                  href="#"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Segurança
                </Link>
                <Link
                  href="#"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  DevOps
                </Link>
                <Link
                  href="#"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Documentação
                </Link>
              </VStack>
            </VStack>
            <VStack className="gap-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-typography-400">
                Empresa
              </Text>
              <VStack className="gap-3">
                <Link
                  href="#"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Sobre
                </Link>
                <Link
                  href="#"
                  className="text-sm font-bold text-typography-600 hover:text-brand-500"
                >
                  Licença
                </Link>
              </VStack>
            </VStack>
          </Grid>
        </Box>
      </Grid>
      <Box className="border-t border-outline-100 dark:border-outline-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <Text className="text-typography-400 text-xs font-medium">
          © 2026 Catalyst Skeleton • Operado nativamente com excelência técnica.
        </Text>
        <Badge
          variant="secondary"
          className="bg-background-50 dark:bg-background-900 text-typography-500"
        >
          v4.0.0 Stable
        </Badge>
      </Box>
    </Container>
  </Footer>
)

export function Component() {
  const { theme, toggleTheme } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'cadastro'>('login')

  const { autenticado, usuario, limpar } = useAuthStore()

  function abrirAuth(tab: 'login' | 'cadastro') {
    setAuthTab(tab)
    setShowAuthModal(true)
  }

  function handleDemo() {
    setShowModal(true)
  }

  return (
    <AppContainer
      paddingX="0"
      className="min-h-screen transition-colors duration-500 w-full bg-white dark:bg-background-950"
    >
      <Navigation
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenAuth={abrirAuth}
        autenticado={autenticado}
        usuario={usuario}
        onLogout={limpar}
      />

      <main>
        <Hero onDemo={handleDemo} onOpenAuth={abrirAuth} autenticado={autenticado} />

        <DNASection />

        <FeatureSection />

        <ArchitectureSection />
        <UIComponentsSection />
        <TimelineSection />
        <FAQSection />
        <FinalCTA onAuth={abrirAuth} autenticado={autenticado} />
      </main>

      <MegaFooter />

      <ModalAuth open={showAuthModal} onOpenChange={setShowAuthModal} defaultTab={authTab} />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-xl rounded-2xl p-0 border border-outline-100 dark:border-outline-900 shadow-hard-5 overflow-hidden bg-white dark:bg-background-950">
          <Box className="p-12">
            <VStack className="gap-8 text-center items-center">
              <Box className="w-24 h-24 mx-auto rounded-full bg-brand-500/10 flex items-center justify-center">
                <Icon icon={Rocket} className="size-12 text-brand-600 dark:text-brand-500" />
              </Box>
              <VStack className="gap-4">
                <Title
                  size="3xl"
                  className="font-heading font-black text-typography-950 dark:text-white"
                >
                  Explore a Estrutura
                </Title>
                <Text
                  size="lg"
                  className="text-typography-600 dark:text-typography-400 leading-relaxed font-medium"
                >
                  O React 19 cuidou silenciosamente de processar este arquivo maciço contendo
                  inúmeros componentes separados que aderem firmemente aos tokens estabelecidos no
                  DESIGN.md, resultando em uma página de alta velocidade e layout premium sem
                  gradientes.
                </Text>
              </VStack>
              <Button
                size="lg"
                className="w-full mt-4 rounded-xl h-16 bg-brand-600 hover:bg-brand-700 font-bold text-lg shadow-hard-2"
                onClick={() => setShowModal(false)}
              >
                Certo. Prosseguir!
              </Button>
            </VStack>
          </Box>
        </DialogContent>
      </Dialog>
    </AppContainer>
  )
}