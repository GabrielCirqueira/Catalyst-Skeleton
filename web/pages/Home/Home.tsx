import { useTheme } from '@/contexts'
import { AppContainer } from '@/layouts'
import { Badge } from '@/shadcn/components/ui/badge'
import { Button } from '@/shadcn/components/ui/button'
import { Card } from '@/shadcn/components/ui/card'
import { Dialog, DialogContent } from '@/shadcn/components/ui/dialog'
import { Icon } from '@/shadcn/components/ui/icon'
import { Box, Container, Footer, Grid, HStack, VStack } from '@/shadcn/components/ui/layout'
import { Link } from '@/shadcn/components/ui/link'
import { Text, Title } from '@/shadcn/components/ui/typography'
import { useAuthStore } from '@/stores/useAuthStore'
import { ModalAuth } from '@features/auth'
import {
  ArrowRight,
  Code2,
  Cpu,
  FileCode2,
  FolderTree,
  Github,
  Globe2,
  Layers,
  LayoutTemplate,
  Lock,
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

const Navigation = ({ theme, toggleTheme, onOpenAuth, autenticado, usuario, onLogout }: any) => (
  <Container size="xl" className="py-4">
    <HStack className="justify-between items-center bg-white dark:bg-background-950 px-6 py-4 rounded-2xl border border-outline-100 dark:border-outline-900 shadow-sm sticky top-4 z-50">
      <HStack className="gap-3 items-center">
        <Box className="size-10 rounded-xl bg-brand-500 flex items-center justify-center">
          <Icon icon={Code2} className="size-6 text-white" strokeWidth={2.5} />
        </Box>
        <VStack className="gap-0">
          <Title
            size="xl"
            className="font-heading font-black text-typography-950 dark:text-white leading-tight"
          >
            Catalyst
          </Title>
        </VStack>
      </HStack>

      <HStack className="gap-8 items-center hidden lg:flex">
        <Link
          href="#features"
          className="text-sm font-bold text-typography-600 hover:text-typography-950 dark:hover:text-white transition-colors"
        >
          Recursos
        </Link>
        <Link
          href="#architecture"
          className="text-sm font-bold text-typography-600 hover:text-typography-950 dark:hover:text-white transition-colors"
        >
          Arquitetura
        </Link>
        <Link
          href="#tech-stack"
          className="text-sm font-bold text-typography-600 hover:text-typography-950 dark:hover:text-white transition-colors"
        >
          Componentes
        </Link>
        <Link
          href="#faq"
          className="text-sm font-bold text-typography-600 hover:text-typography-950 dark:hover:text-white transition-colors"
        >
          FAQ
        </Link>
      </HStack>

      <HStack className="gap-4 items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-lg bg-background-50 dark:bg-background-900 border border-outline-100 dark:border-outline-900 text-typography-600 hover:text-typography-950 dark:hover:text-white"
        >
          <Icon icon={theme === 'light' ? Moon : Sun} className="size-5" />
        </Button>

        {autenticado ? (
          <HStack className="gap-4 items-center">
            <Text className="text-sm font-bold text-typography-900 dark:text-white hidden md:block">
              Olá,{' '}
              <span className="text-brand-600 dark:text-brand-400">
                {usuario?.username || 'Usuário'}
              </span>
            </Text>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg h-10 border-outline-200 dark:border-outline-800 text-typography-950 dark:text-white px-4"
              onClick={onLogout}
            >
              Sair
            </Button>
          </HStack>
        ) : (
          <Button
            variant="outline"
            className="rounded-lg font-bold px-6 border-outline-200 dark:border-outline-800 text-typography-950 dark:text-white hidden md:flex hover:bg-background-50 dark:hover:bg-background-900"
            onClick={() => onOpenAuth('login')}
          >
            Acessar
          </Button>
        )}
      </HStack>
    </HStack>
  </Container>
)

const Hero = ({ onDemo, onOpenAuth, autenticado }: any) => {
  return (
    <Container size="xl" className="py-24 md:py-32">
      <Grid className="grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <VStack className="gap-8 relative z-10">
          <Badge
            variant="outline"
            className="w-fit px-4 py-2 rounded-lg border-brand-500/20 bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold uppercase tracking-widest text-xs animate-in fade-in slide-in-from-bottom duration-700"
          >
            Solid & Scalable
          </Badge>

          <VStack className="gap-6 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
            <Title
              size="4xl"
              className="font-heading font-black leading-[1.1] text-typography-950 dark:text-white md:text-6xl lg:text-7xl"
            >
              Software de alto nível. <br className="hidden lg:block" />
              Lançamento imediato.
            </Title>
            <Text className="text-xl leading-relaxed text-typography-600 dark:text-typography-400 font-medium max-w-xl">
              O Catalyst Skeleton não é só mais uma stack. É uma fundação opinativa construída com
              Clean Architecture. Pare de configurar Webpack e JWT manualmente.
            </Text>
          </VStack>

          <HStack className="gap-4 flex-wrap pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            {autenticado ? (
              <Button
                size="lg"
                className="h-16 px-10 text-lg font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-hard-3 hover:shadow-hard-4 transition-all duration-300 hover:-translate-y-1"
              >
                <HStack className="gap-3 items-center">
                  <Text>Ir para o Painel</Text>
                  <Icon icon={ArrowRight} className="size-6" />
                </HStack>
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-16 px-10 text-lg font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 shadow-hard-3 hover:shadow-hard-4 transition-all duration-300 hover:-translate-y-1"
                onClick={() => onOpenAuth('cadastro')}
              >
                <HStack className="gap-3 items-center">
                  <Text>Iniciar Projeto Agora</Text>
                  <Icon icon={ArrowRight} className="size-6" />
                </HStack>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-10 text-lg font-bold rounded-xl border-2 border-outline-200 dark:border-outline-800 bg-white dark:bg-background-950 text-typography-950 dark:text-white shadow-hard-1 hover:shadow-hard-2 transition-all duration-300 hover:-translate-y-1 hover:border-outline-300 dark:hover:border-outline-700"
              onClick={onDemo}
            >
              <HStack className="gap-3 items-center">
                <Icon icon={PlayCircle} className="size-6" />
                <Text>Assistir Demonstração</Text>
              </HStack>
            </Button>
          </HStack>
        </VStack>

        <Box className="relative animate-in fade-in slide-in-from-right duration-700 delay-300">
          <Card className="bg-white dark:bg-background-900 border border-outline-100 dark:border-outline-800 shadow-hard-4 rounded-3xl overflow-hidden p-2">
            <Box className="bg-background-50 dark:bg-black rounded-2xl overflow-hidden border border-outline-100 dark:border-outline-900">
              <HStack className="px-5 py-4 border-b border-outline-100 dark:border-outline-900 bg-white dark:bg-background-950 items-center justify-between">
                <HStack className="gap-2">
                  <div className="size-3 rounded-full bg-error-500" />
                  <div className="size-3 rounded-full bg-warning-500" />
                  <div className="size-3 rounded-full bg-success-500" />
                </HStack>
                <Text className="text-xs font-mono font-bold text-typography-500">make setup</Text>
              </HStack>
              <VStack className="gap-3 p-6 font-mono text-sm">
                <HStack className="gap-3">
                  <Text className="text-brand-500 font-bold">~</Text>
                  <Text className="text-typography-950 dark:text-typography-300">
                    $ git clone catalyst-skeleton
                  </Text>
                </HStack>
                <HStack className="gap-3">
                  <Text className="text-brand-500 font-bold">~</Text>
                  <Text className="text-typography-950 dark:text-typography-300">$ make setup</Text>
                </HStack>
                <Text className="text-success-600 dark:text-success-400 pl-5">
                  ✓ Building containers...
                </Text>
                <Text className="text-success-600 dark:text-success-400 pl-5">
                  ✓ Generating JWT Keypair...
                </Text>
                <Text className="text-success-600 dark:text-success-400 pl-5">
                  ✓ Running Doctrine migrations...
                </Text>
                <Text className="text-brand-500 font-bold pl-5 mt-2">
                  API running at localhost:1010
                </Text>
                <Text className="text-brand-500 font-bold pl-5">
                  React Vite running at localhost:1012
                </Text>
              </VStack>
            </Box>
          </Card>

          <Box className="absolute -bottom-8 -left-8 bg-white dark:bg-background-900 border border-outline-100 dark:border-outline-800 p-6 rounded-2xl shadow-hard-3">
            <HStack className="gap-4 items-center">
              <Box className="size-14 rounded-xl bg-success-500/10 flex items-center justify-center">
                <Icon
                  icon={ShieldCheck}
                  className="size-7 text-success-600 dark:text-success-500"
                />
              </Box>
              <VStack>
                <Title
                  size="xl"
                  className="font-heading font-black text-typography-950 dark:text-white"
                >
                  Prod Ready
                </Title>
                <Text className="text-sm font-bold text-typography-500">
                  Autenticação & Banco 100%
                </Text>
              </VStack>
            </HStack>
          </Box>
        </Box>
      </Grid>
    </Container>
  )
}

const FeatureSection = () => {
  return (
    <Box
      id="features"
      className="bg-background-50 dark:bg-background-900 border-y border-outline-100 dark:border-outline-900 py-32"
    >
      <Container size="xl">
        <VStack className="gap-20">
          <VStack className="gap-6 text-center max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mx-auto rounded-lg border-brand-500/20 bg-brand-500/10 text-brand-700 dark:text-brand-400 font-bold uppercase tracking-widest text-xs"
            >
              Tudo que você precisa
            </Badge>
            <Title
              size="4xl"
              className="font-heading font-black text-typography-950 dark:text-white"
            >
              Módulo de funcionalidades projetado para escala
            </Title>
            <Text className="text-xl text-typography-600 dark:text-typography-400 font-medium">
              De infraestrutura a estilos, reduzimos meses de decisões técnicas em um repositório
              maduro.
            </Text>
          </VStack>

          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: 'Backend Limpo (DDD)',
                desc: 'Entidades com UUID v7, Controllers limitados a rotas API, e Services executando a regra de negócio pura em PHP 8.4.',
              },
              {
                icon: Lock,
                title: 'Segurança por Padrão',
                desc: 'Firewall stateless nas rotas /api/* com verificação rigorosa de JWT. Refresh tokens rodam de maneira invisível.',
              },
              {
                icon: Cpu,
                title: 'Frontend React 19',
                desc: 'UI reativa ultra rápida usando Zustand para memória local e TanStack Query lidando com server-state em tempo real.',
              },
              {
                icon: LayoutTemplate,
                title: '80+ Componentes Nativos',
                desc: 'Esqueça bibliotecas engessadas. Implementamos Shadcn/ui direto no código base para acessibilidade total e redesign fácil.',
              },
              {
                icon: Code2,
                title: 'DX Absoluto',
                desc: 'PHPStan nível 6 e Biome.js rodando nos git hooks. Qualquer subida de código ruim será bloqueada automaticamente.',
              },
              {
                icon: Globe2,
                title: 'Deploy Invisível',
                desc: 'Nginx mapeado com resolutores de Docker interno, scripts bash de deploy zero-downtime já prontos no repositório.',
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="bg-white dark:bg-background-950 border border-outline-100 dark:border-outline-800 p-8 rounded-2xl shadow-sm hover:shadow-hard-2 hover:-translate-y-1 transition-all duration-300"
              >
                <VStack className="gap-6">
                  <Box className="size-14 rounded-xl bg-background-50 dark:bg-background-900 border border-outline-100 dark:border-outline-800 flex items-center justify-center">
                    <Icon icon={item.icon} className="size-7 text-typography-950 dark:text-white" />
                  </Box>
                  <VStack className="gap-3">
                    <Title
                      size="2xl"
                      className="font-heading font-black text-typography-950 dark:text-white"
                    >
                      {item.title}
                    </Title>
                    <Text className="text-lg text-typography-600 dark:text-typography-400 leading-relaxed">
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
                  <Icon icon={LayoutTemplate} className="size-6 text-brand-400" />
                </div>
                <Title size="xl" className="font-heading font-bold text-white">
                  Acessibilidade
                </Title>
                <Text className="text-typography-500 leading-relaxed">
                  Componentes que seguem os padrões WAI-ARIA, garantindo inclusão e navegação
                  perfeita via teclado.
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
      q: 'Hospedagem',
      a: 'Qualquer VPS serve. O projeto roda inteiro dentro de Docker e o docker-compose.prod.yaml sobe Nginx reverso e SSL com Certbot de maneira rápida.',
    },
    {
      q: 'Posso usar Tailwind customizado?',
      a: 'Sim, tudo no frontend reside na sua máquina. O design system foi injetado via `tailwind.config.cjs`. Altere o `brand` e sua aplicação inteira ganha sua cor de marca.',
    },
    {
      q: 'O PHP e o React são servidos juntos?',
      a: 'Não. É uma Single Page Application separada que engole uma JSON API rigorosa (via api.ts). Tudo fica isolado com HMR rápido no dev.',
    },
    {
      q: 'Por que não Laravel/Nextjs?',
      a: 'O Catalyst prefere as amarrações seguras do SOLID impostas por atributos e tipagens pesadas do Symfony, aliado a renderização em cliente leve e altamente responsiva para SaaS corporativos.',
    },
  ]

  return (
    <Container size="xl" id="faq" className="py-32">
      <VStack className="gap-16 items-center">
        <VStack className="gap-4 text-center max-w-3xl">
          <Title size="4xl" className="font-heading font-black text-typography-950 dark:text-white">
            Dúvidas Frequentes
          </Title>
          <Text className="text-xl text-typography-600 dark:text-typography-400 font-medium">
            As respostas rápidas de quem leu o documento da arquitetura.
          </Text>
        </VStack>

        <Grid className="grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 max-w-5xl w-full">
          {faqs.map((f, i) => (
            <VStack key={i} className="gap-4">
              <HStack className="gap-4 items-start">
                <Box className="size-10 rounded-full bg-background-100 dark:bg-background-800 flex items-center justify-center shrink-0">
                  <Text className="font-black text-typography-950 dark:text-white">{i + 1}</Text>
                </Box>
                <VStack className="gap-2 pt-1">
                  <Title
                    size="xl"
                    className="font-heading font-black text-typography-950 dark:text-white"
                  >
                    {f.q}
                  </Title>
                  <Text className="text-lg text-typography-600 dark:text-typography-400 leading-relaxed font-medium">
                    {f.a}
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          ))}
        </Grid>
      </VStack>
    </Container>
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
  <Footer className="bg-background-50 dark:bg-background-950 border-t border-outline-100 dark:border-outline-900 py-24">
    <Container size="xl">
      <Grid className="grid-cols-1 md:grid-cols-12 gap-16 mb-20">
        <VStack className="md:col-span-5 gap-6">
          <HStack className="gap-3 items-center">
            <Box className="size-12 rounded-xl bg-brand-500 flex items-center justify-center">
              <Icon icon={Code2} className="size-6 text-white" strokeWidth={2.5} />
            </Box>
            <Title
              size="2xl"
              className="font-heading font-black text-typography-950 dark:text-white"
            >
              Catalyst
            </Title>
          </HStack>
          <Text className="text-lg text-typography-600 dark:text-typography-400 leading-relaxed font-medium">
            Uma obra prima modular corporativa pronta para se tornar a fundação vitalógica de
            sistemas imensos e maduros. Construído sem gambiarras, seguindo arquiteturas modernas e
            seguras.
          </Text>
          <HStack className="gap-6 mt-4">
            <a
              href="#"
              className="p-3 bg-white dark:bg-background-900 border border-outline-200 dark:border-outline-800 rounded-xl text-typography-500 hover:text-brand-500 transition-colors shadow-sm"
            >
              <Icon icon={Github} className="size-5" />
            </a>
            <a
              href="#"
              className="p-3 bg-white dark:bg-background-900 border border-outline-200 dark:border-outline-800 rounded-xl text-typography-500 hover:text-brand-500 transition-colors shadow-sm"
            >
              <Icon icon={MessageSquare} className="size-5" />
            </a>
          </HStack>
        </VStack>
        <Box className="md:col-span-7">
          <Grid className="grid-cols-2 sm:grid-cols-3 gap-12">
            <VStack className="gap-6">
              <Text className="text-lg font-black text-typography-950 dark:text-white uppercase tracking-widest text-sm">
                A Fundação
              </Text>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Recursos
              </Link>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Arquitetura DDD
              </Link>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Componentes Visuais
              </Link>
            </VStack>
            <VStack className="gap-6">
              <Text className="text-lg font-black text-typography-950 dark:text-white uppercase tracking-widest text-sm">
                Biblioteca
              </Text>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                ReadMe
              </Link>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Doc Técnica Inteira
              </Link>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Guias de Frontend
              </Link>
            </VStack>
            <VStack className="gap-6">
              <Text className="text-lg font-black text-typography-950 dark:text-white uppercase tracking-widest text-sm">
                Legalidade
              </Text>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Licença
              </Link>
              <Link
                href="#"
                className="text-lg font-medium text-typography-600 dark:text-typography-400 hover:text-brand-600 dark:hover:text-brand-400"
              >
                Código de Conduta
              </Link>
            </VStack>
          </Grid>
        </Box>
      </Grid>
      <Box className="border-t border-outline-200 dark:border-outline-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <Text className="text-typography-600 font-medium tracking-wide text-sm">
          © Catalyst Skeleton — Operado nativamente e com orgulho.
        </Text>
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
        <FeatureSection />
        <ArchitectureSection />
        <UIComponentsSection />
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
