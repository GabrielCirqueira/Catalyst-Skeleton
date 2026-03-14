import { useTheme } from "@/contexts";
import { AppContainer } from "@/layouts";
import { Badge } from "@/shadcn/components/ui/badge";
import { Button } from "@/shadcn/components/ui/button";
import { Card } from "@/shadcn/components/ui/card";
import { Dialog, DialogContent } from "@/shadcn/components/ui/dialog";
import { Icon } from "@/shadcn/components/ui/icon";
import { Box, Container, Footer, Grid, HStack, VStack } from "@/shadcn/components/ui/layout";
import { Link } from "@/shadcn/components/ui/link";
import { Text, Title } from "@/shadcn/components/ui/typography";
import {
  Award,
  BarChart,
  CheckCircle,
  ChevronRight,
  Code2,
  GitBranch,
  Heart,
  Lightbulb,
  Moon,
  Palette,
  Rocket,
  Shield,
  Star,
  Sun,
  Target,
  Terminal,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

export function Component() {
  const { theme, toggleTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);

  return (
    <AppContainer paddingX="0" className="min-h-screen transition-colors duration-500 w-full">
      <Container size="xl" className="py-4">
        <HStack className="justify-between items-center">
          <HStack className="gap-2 items-center">
            <Icon icon={Code2} className="size-8 text-brand-600 dark:text-brand-400" />
            <Title size="xl" className="font-heading font-bold">
              React Skeleton
            </Title>
          </HStack>

          <HStack className="gap-4 items-center">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
            >
              Features
            </Link>
            <Link
              href="#valores"
              className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
            >
              Valores
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-all duration-300"
            >
              <Icon icon={theme === "light" ? Moon : Sun} className="size-5" />
            </Button>
            <Button className=" text-white rounded-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 transition-all duration-300 shadow-hard-2">
              Começar
            </Button>
          </HStack>
        </HStack>
      </Container>

      <Container size="xl" className="py-20 md:py-32">
        <Grid className="grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <VStack className="gap-8 animate-in fade-in slide-in-from-left duration-700">
            <Badge
              variant="secondary"
              className="w-fit rounded-full px-4 py-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800"
            >
              <HStack className="gap-2 items-center">
                <Icon icon={Zap} className="size-4" />
                <Text size="sm" className="font-semibold">
                  Aceleração Máxima
                </Text>
              </HStack>
            </Badge>

            <VStack className="gap-4">
              <Title size="4xl" className="font-heading font-black leading-tight">
                Construa aplicações modernas{" "}
                <Text as="span" className="text-brand-600 dark:text-brand-400">
                  mais rápido
                </Text>
              </Title>
              <Text className="leading-relaxed">
                Um template completo com React 19, TypeScript, Vite, Tailwind CSS e mais de 80
                componentes shadcn/ui prontos para uso. Configure seu projeto em minutos.
              </Text>
            </VStack>

            <HStack className="gap-4 flex-wrap">
              <Button
                size="lg"
                className="rounded-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white font-semibold px-8 py-6 shadow-hard-3 hover:shadow-hard-4 transition-all duration-300 hover:scale-105"
                onClick={() => setShowModal(true)}
              >
                <HStack className="gap-2 items-center">
                  <Text>Ver demonstração</Text>
                  <Icon icon={ChevronRight} className="size-5" />
                </HStack>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-zinc-300 dark:border-zinc-700 hover:border-brand-600 dark:hover:border-brand-500 font-semibold px-8 py-6 transition-all duration-300 hover:scale-105"
              >
                <HStack className="gap-2 items-center">
                  <Icon icon={GitBranch} className="size-5" />
                  <Text>GitHub</Text>
                </HStack>
              </Button>
            </HStack>

            <HStack className="gap-6 pt-4">
              <HStack className="gap-2 items-center">
                <HStack className="gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} icon={Star} className="size-5" />
                  ))}
                </HStack>
              </HStack>
            </HStack>
          </VStack>

          <Box className="relative animate-in fade-in slide-in-from-right duration-700 delay-200">
            <Card className="p-8 bg-zinc-50 dark:bg-brand-900 border-zinc-200 shadow-hard-3 hover:shadow-hard-4 transition-all duration-500 rounded-xl overflow-hidden">
              <VStack className="gap-4">
                <HStack className="gap-2 items-center">
                  <Icon icon={Terminal} className="size-6 text-brand-600 dark:text-brand-400" />
                  <Title size="lg" className="font-heading font-bold text-zinc-900 dark:text-white">
                    Instalação rápida
                  </Title>
                </HStack>
                <Box className="bg-zinc-900 dark:bg-black p-6 rounded-xl border w-full border-zinc-800 dark:border-zinc-700">
                  <VStack className="gap-3 font-mono text-xs">
                    <Text className="text-zinc-400">
                      <Text as="span" className="text-green-400">
                        $
                      </Text>{" "}
                      git clone react-skeleton
                    </Text>
                    <Text className="text-zinc-400">
                      <Text as="span" className="text-green-400">
                        $
                      </Text>{" "}
                      make setup
                    </Text>
                    <Text className="text-brand-400">✓ Ready in 2s</Text>
                  </VStack>
                </Box>
              </VStack>
            </Card>
          </Box>
        </Grid>
      </Container>

      <Container size="xl" className="py-16">
        <VStack className="gap-8 items-center animate-in fade-in slide-in-from-bottom duration-700">
          <Text
            size="sm"
            className="text-zinc-500 dark:text-zinc-500 uppercase tracking-wider font-semibold"
          >
            Tecnologias que você já conhece e ama
          </Text>
          <Grid className="grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center w-full">
            {[
              { name: "React", icon: Code2 },
              { name: "TypeScript", icon: Code2 },
              { name: "Vite", icon: Zap },
              { name: "Tailwind", icon: Palette },
              { name: "shadcn/ui", icon: Target },
              { name: "ESLint", icon: CheckCircle },
            ].map((tech) => (
              <Badge
                key={tech.name}
                variant="outline"
                className="justify-center py-4 px-6 rounded-2xl border-2 border-zinc-200 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-hard-2 transition-all duration-300 hover:scale-110"
              >
                <HStack className="gap-3 items-center">
                  <Icon icon={tech.icon} className="size-5 text-zinc-600" />
                  <Text className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {tech.name}
                  </Text>
                </HStack>
              </Badge>
            ))}
          </Grid>
        </VStack>
      </Container>

      <Container size="xl" id="features" className="py-24">
        <VStack className="gap-16">
          <VStack className="gap-4 items-center text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom duration-700">
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-2 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800"
            >
              Features
            </Badge>
            <Title size="3xl" className="font-heading font-black text-zinc-900 dark:text-white">
              Tudo que você precisa para começar
            </Title>
            <Text size="lg" className="text-zinc-600">
              Um conjunto completo de ferramentas modernas para acelerar seu desenvolvimento
            </Text>
          </VStack>

          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Rocket,
                title: "Performance Otimizada",
                description: "Vite + React 19 para builds ultra-rápidos e hot reload instantâneo",
                color: "text-blue-600 dark:text-blue-400",
                bgColor: "bg-blue-50 dark:bg-blue-950",
              },
              {
                icon: Palette,
                title: "80+ Componentes",
                description:
                  "Biblioteca completa shadcn/ui com componentes acessíveis e customizáveis",
                color: "text-purple-600 dark:text-purple-400",
                bgColor: "bg-purple-50 dark:bg-purple-950",
              },
              {
                icon: Shield,
                title: "Type-Safe",
                description:
                  "TypeScript configurado com strict mode para máxima segurança de tipos",
                color: "text-green-600 dark:text-green-400",
                bgColor: "bg-green-50 dark:bg-green-950",
              },
              {
                icon: Zap,
                title: "Tailwind CSS",
                description: "Sistema de design completo com tema dark/light e paleta customizável",
                color: "text-cyan-600 dark:text-cyan-400",
                bgColor: "bg-cyan-50 dark:bg-cyan-950",
              },
              {
                icon: CheckCircle,
                title: "Code Quality",
                description: "ESLint, Prettier, Husky e lint-staged configurados para código limpo",
                color: "text-orange-600 dark:text-orange-400",
                bgColor: "bg-orange-50 dark:bg-orange-950",
              },
              {
                icon: GitBranch,
                title: "Git Hooks",
                description: "Commitlint e conventional commits para histórico organizado",
                color: "text-pink-600 dark:text-pink-400",
                bgColor: "bg-pink-50 dark:bg-pink-950",
              },
            ].map((feature, idx) => (
              <Card
                key={feature.title}
                className="p-8 rounded-xl hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-hard-4 transition-all duration-500 hover:scale-105 bg-white dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${idx * 100}ms`, animationDuration: "700ms" }}
              >
                <VStack className="gap-4">
                  <Box
                    className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center`}
                  >
                    <Icon icon={feature.icon} className={`size-7 ${feature.color}`} />
                  </Box>
                  <VStack className="gap-2">
                    <Title
                      size="lg"
                      className="font-heading font-bold text-zinc-900 dark:text-white"
                    >
                      {feature.title}
                    </Title>
                    <Text className="text-zinc-600 leading-relaxed">{feature.description}</Text>
                  </VStack>
                </VStack>
              </Card>
            ))}
          </Grid>
        </VStack>
      </Container>

      <Container size="xl" className="py-16">
        <Grid className="grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "80+", label: "Componentes", icon: Target },
            { value: "2s", label: "Build Time", icon: Zap },
            { value: "100%", label: "Type-Safe", icon: Shield },
            { value: "1.2k+", label: "Desenvolvedores", icon: Users },
          ].map((stat, idx) => (
            <Card
              key={stat.label}
              className="p-8 rounded-xl text-center hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-hard-3 transition-all duration-500 hover:scale-110 bg-white dark:bg-zinc-900 animate-in fade-in zoom-in"
              style={{ animationDelay: `${idx * 100}ms`, animationDuration: "700ms" }}
            >
              <VStack className="gap-3 items-center">
                <Icon icon={stat.icon} className="size-8 text-brand-600 dark:text-brand-400" />
                <Title size="3xl" className="font-heading font-black text-zinc-900 dark:text-white">
                  {stat.value}
                </Title>
                <Text className="text-zinc-600 font-semibold">{stat.label}</Text>
              </VStack>
            </Card>
          ))}
        </Grid>
      </Container>

      <Box id="valores" className="bg-zinc-900 dark:bg-black py-24 transition-colors duration-500">
        <Container size="xl">
          <VStack className="gap-16 items-center">
            <VStack className="gap-4 items-center text-center max-w-3xl selection:mx-auto animate-in fade-in slide-in-from-bottom duration-700">
              <Badge
                variant="secondary"
                className="rounded-full px-4 py-2 bg-brand-900 text-brand-300 border-brand-800"
              >
                Nossos Valores
              </Badge>
              <Title size="3xl" className="font-heading font-black text-white">
                Construído com propósito
              </Title>
              <Text size="lg" className="text-zinc-400">
                Princípios que guiam cada decisão no desenvolvimento deste template
              </Text>
            </VStack>

            <Grid className="grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Lightbulb,
                  title: "Simplicidade",
                  description:
                    "Arquitetura clara e organizada. Sem complexidade desnecessária, apenas o essencial para você começar.",
                },
                {
                  icon: Heart,
                  title: "Developer Experience",
                  description:
                    "Ferramentas modernas, documentação completa e workflow otimizado para máxima produtividade.",
                },
                {
                  icon: Award,
                  title: "Qualidade",
                  description:
                    "Code review automatizado, testes de tipo, e padrões de código que garantem excelência.",
                },
              ].map((value, idx) => (
                <Card
                  key={value.title}
                  className="p-10 rounded-xl bg-zinc-800 dark:bg-zinc-900 border-2 border-zinc-700 dark:border-zinc-800 hover:border-brand-500 hover:shadow-hard-4 transition-all duration-500 hover:scale-105 animate-in fade-in slide-in-from-bottom"
                  style={{ animationDelay: `${idx * 150}ms`, animationDuration: "700ms" }}
                >
                  <VStack className="gap-6">
                    <Box className="w-16 h-16 rounded-2xl bg-brand-900 flex items-center justify-center">
                      <Icon icon={value.icon} className="size-8 text-brand-400" />
                    </Box>
                    <VStack className="gap-3">
                      <Title size="xl" className="font-heading font-bold text-white">
                        {value.title}
                      </Title>
                      <Text size="lg" className="text-zinc-400 leading-relaxed">
                        {value.description}
                      </Text>
                    </VStack>
                  </VStack>
                </Card>
              ))}
            </Grid>
          </VStack>
        </Container>
      </Box>

      <Container size="xl" className="py-32">
        <Card className="p-16 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-800 dark:to-brand-900 border-0 shadow-hard-5 overflow-hidden relative animate-in fade-in slide-in-from-bottom duration-700">
          <VStack className="gap-8 items-center text-center relative z-10">
            <VStack className="gap-4 max-w-2xl items-center">
              <Title size="4xl" className="font-heading font-black text-gray-200 ">
                Pronto para acelerar seu desenvolvimento?
              </Title>
              <Text className="text-brand-100 text-lg text-center">
                Comece agora com o melhor template React do mercado
              </Text>
            </VStack>
            <HStack className="gap-4 flex-wrap justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full bg-white hover:bg-zinc-100 text-brand-700 font-bold px-10 py-7 shadow-hard-3 hover:shadow-hard-4 transition-all duration-300 hover:scale-110"
              >
                <HStack className="gap-2 items-center">
                  <Icon icon={Rocket} className="size-6" />
                  <Text size="lg">Começar gratuitamente</Text>
                </HStack>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-2 border-white/30 hover:border-white text-white hover:bg-white/10 font-bold px-10 py-7 transition-all duration-300 hover:scale-110"
              >
                <HStack className="gap-2 items-center">
                  <Icon icon={BarChart} className="size-6" />
                  <Text size="lg">Ver documentação</Text>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        </Card>
      </Container>

      <Footer className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 transition-colors duration-500">
        <Container size="xl" className="py-12">
          <Grid className="grid-cols-1 md:grid-cols-4 gap-12">
            <VStack className="gap-4">
              <HStack className="gap-2 items-center">
                <Icon icon={Code2} className="size-7 text-brand-600 dark:text-brand-400" />
                <Title size="lg" className="font-heading font-bold text-zinc-900 dark:text-white">
                  React Skeleton
                </Title>
              </HStack>
              <Text className="text-zinc-600">
                Template moderno para aplicações React com TypeScript, Vite e Tailwind CSS
              </Text>
            </VStack>

            <VStack className="gap-4">
              <Title size="sm" className="font-heading font-bold text-zinc-900 dark:text-white">
                Produto
              </Title>
              <VStack className="gap-2">
                <Link
                  href="#features"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Features
                </Link>
                <Link
                  href="#valores"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Valores
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Documentação
                </Link>
              </VStack>
            </VStack>

            <VStack className="gap-4">
              <Title size="sm" className="font-heading font-bold text-zinc-900 dark:text-white">
                Recursos
              </Title>
              <VStack className="gap-2">
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  GitHub
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Changelog
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Comunidade
                </Link>
              </VStack>
            </VStack>

            <VStack className="gap-4">
              <Title size="sm" className="font-heading font-bold text-zinc-900 dark:text-white">
                Legal
              </Title>
              <VStack className="gap-2">
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Privacidade
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Termos
                </Link>
                <Link
                  href="#"
                  className="text-zinc-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  Licença
                </Link>
              </VStack>
            </VStack>
          </Grid>

          <Box className="mt-12 pt-8 border-t border-zinc-200">
            <HStack className="justify-between items-center flex-wrap gap-4">
              <Text className="text-zinc-500 dark:text-zinc-500">
                © 2025 React Skeleton. Todos os direitos reservados.
              </Text>
              <HStack className="gap-4">
                <Link
                  href="#"
                  className="text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  <Icon icon={GitBranch} className="size-5" />
                </Link>
                <Link
                  href="#"
                  className="text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-300"
                >
                  <Icon icon={Heart} className="size-5" />
                </Link>
              </HStack>
            </HStack>
          </Box>
        </Container>
      </Footer>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl rounded-xl p-0 border-2 border-zinc-200">
          <Box className="p-10">
            <VStack className="gap-6">
              <VStack className="gap-4 text-center">
                <Box className="w-20 h-20 mx-auto rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                  <Icon icon={Rocket} className="size-10 text-brand-600 dark:text-brand-400" />
                </Box>
                <Title size="2xl" className="font-heading font-bold text-zinc-900 dark:text-white">
                  Demonstração Interativa
                </Title>
                <Text size="lg" className="text-zinc-600">
                  Explore todos os componentes e funcionalidades deste template
                </Text>
              </VStack>

              <Card className="p-6 bg-zinc-50 border-zinc-200 rounded-2xl">
                <VStack className="gap-4">
                  <HStack className="gap-3 items-start">
                    <Icon
                      icon={CheckCircle}
                      className="size-6 text-green-600 dark:text-green-400 mt-0.5"
                    />
                    <VStack className="gap-1">
                      <Text className="font-semibold text-zinc-900 dark:text-white">
                        80+ Componentes shadcn/ui
                      </Text>
                      <Text className="text-sm text-zinc-600">
                        Todos acessíveis e customizáveis
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack className="gap-3 items-start">
                    <Icon
                      icon={CheckCircle}
                      className="size-6 text-green-600 dark:text-green-400 mt-0.5"
                    />
                    <VStack className="gap-1">
                      <Text className="font-semibold text-zinc-900 dark:text-white">
                        Tema Dark/Light
                      </Text>
                      <Text className="text-sm text-zinc-600">
                        Suporte completo com transições suaves
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack className="gap-3 items-start">
                    <Icon
                      icon={CheckCircle}
                      className="size-6 text-green-600 dark:text-green-400 mt-0.5"
                    />
                    <VStack className="gap-1">
                      <Text className="font-semibold text-zinc-900 dark:text-white">
                        Animações Fluidas
                      </Text>
                      <Text className="text-sm text-zinc-600">
                        Transições de 300-700ms otimizadas
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Card>

              <HStack className="gap-4 pt-4">
                <Button
                  className="flex-1 rounded-full bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 font-semibold py-6 transition-all duration-300"
                  onClick={() => setShowModal(false)}
                >
                  Começar agora
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-full border-2 font-semibold py-6 transition-all duration-300"
                  onClick={() => setShowModal(false)}
                >
                  Fechar
                </Button>
              </HStack>
            </VStack>
          </Box>
        </DialogContent>
      </Dialog>
    </AppContainer>
  );
}
