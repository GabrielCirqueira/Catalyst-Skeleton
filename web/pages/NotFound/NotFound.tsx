import { AppContainer } from '@layouts'
import { Button } from '@shadcn/button'
import { Box, Container, HStack, VStack } from '@shadcn/layout'
import { Text, Title } from '@shadcn/typography'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Boxes,
  Cpu,
  Database,
  Globe,
  Home,
  Network,
  Search,
  Server,
  ShieldAlert,
  Terminal,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const DECORATIVE_ICONS = [
  { icon: Server, x: '8%', y: '12%', delay: 0, duration: 5 },
  { icon: Database, x: '88%', y: '15%', delay: 0.5, duration: 7 },
  { icon: ShieldAlert, x: '12%', y: '80%', delay: 1, duration: 6 },
  { icon: Cpu, x: '82%', y: '82%', delay: 1.5, duration: 8 },
  { icon: Network, x: '15%', y: '45%', delay: 2, duration: 9 },
  { icon: Boxes, x: '78%', y: '35%', delay: 2.5, duration: 5.5 },
  { icon: Globe, x: '5%', y: '30%', delay: 3, duration: 10 },
  { icon: Terminal, x: '92%', y: '50%', delay: 3.5, duration: 7.5 },
]

const SYSTEM_CHIPS = [
  { text: '0x404_VOID', x: '18%', y: '25%', duration: 4 },
  { text: 'COORD_LOST', x: '72%', y: '15%', duration: 6 },
  { text: 'SYS_INTEGRITY: OK', x: '25%', y: '70%', duration: 5 },
  { text: 'V4_CORE_ACTIVE', x: '78%', y: '60%', duration: 7 },
]

export function Component() {
  const navigate = useNavigate()

  return (
    <AppContainer>
      <Container className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1cc39d08_1px,transparent_1px),linear-gradient(to_bottom,#1cc39d08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_75%,transparent_100%)] -z-10" />

        <div className="absolute inset-0 pointer-events-none hidden lg:block overflow-hidden">
          {DECORATIVE_ICONS.map((item, i) => (
            <motion.div
              key={`bg-icon-${i}`}
              className="absolute"
              style={{ left: item.x, top: item.y }}
              animate={{
                y: [0, -25, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: item.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
                delay: item.delay,
              }}
            >
              <div className="p-5 rounded-3xl bg-white/10 dark:bg-background-900/40 border border-outline-100 dark:border-brand-500/20 backdrop-blur-xl shadow-2xl shadow-brand-500/5">
                <item.icon className="size-8 text-brand-500/30" strokeWidth={1} />
              </div>
            </motion.div>
          ))}

          {SYSTEM_CHIPS.map((chip, i) => (
            <motion.div
              key={`bg-chip-${i}`}
              className="absolute"
              style={{ left: chip.x, top: chip.y }}
              animate={{
                x: [0, 15, 0],
                y: [0, 10, 0],
              }}
              transition={{
                duration: chip.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
                delay: i * 0.4,
              }}
            >
              <div className="px-5 py-2.5 rounded-2xl bg-white/10 dark:bg-background-900/40 border border-outline-100 dark:border-brand-500/20 backdrop-blur-xl shadow-2xl shadow-brand-500/5">
                <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-500/30">
                  {chip.text}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full"
        >
          <VStack className="items-center text-center gap-5 max-w-4xl mx-auto px-4">
            <VStack className="items-center gap-1">
              <Box className="relative">
                <div className="absolute inset-0 bg-brand-500/20 blur-3xl rounded-full scale-150" />
                <div className="relative size-24 rounded-3xl bg-white dark:bg-background-900 border border-brand-500/20 flex items-center justify-center shadow-2xl">
                  <Search className="size-10 text-brand-500" strokeWidth={1.5} />
                </div>
              </Box>

              <VStack className="gap-1 items-center w-full">
                <div className="relative flex flex-col items-center justify-center w-full min-h-[200px]">
                  <Text className="text-[12rem] md:text-[20rem] font-black text-brand-500/[0.04] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 tracking-tighter leading-none select-none pointer-events-none">
                    404
                  </Text>

                  <Title
                    as="h1"
                    className="text-4xl sm:text-7xl font-black leading-[1.1] tracking-tight text-typography-950 dark:text-white"
                  >
                    Página não <span className="text-brand-500">encontrada</span>
                  </Title>
                </div>

                <Text className="text-lg md:text-2xl text-typography-600 dark:text-typography-400 max-w-2xl mx-auto leading-relaxed font-medium">
                  Parece que suas coordenadas estão incorretas. O recurso solicitado foi purgado ou
                  movido para um novo quadrante.
                </Text>
              </VStack>
            </VStack>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
              {[
                { icon: Cpu, label: '0x404_ERR', text: 'Roteamento Falhou' },
                { icon: Terminal, label: 'SYS_DEBUG', text: 'Status: Offline' },
                { icon: Globe, label: 'GLOBAL_NET', text: 'Requisição Externa' },
              ].map((item) => (
                <Box
                  key={item.label}
                  className="p-6 rounded-2xl bg-white/10 dark:bg-background-900 border border-outline-100 dark:border-brand-500/10 backdrop-blur-md"
                >
                  <VStack className="items-center gap-4">
                    <item.icon className="size-6 text-brand-500/50" strokeWidth={1.5} />
                    <VStack className="gap-1 items-center">
                      <Text className="text-[10px] font-black uppercase tracking-widest text-brand-500">
                        {item.label}
                      </Text>
                      <Text className="text-xs font-bold text-typography-600 dark:text-typography-400">
                        {item.text}
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              ))}
            </div>

            <HStack className="gap-4 w-full sm:w-auto flex-col sm:flex-row pt-6">
              <Link to="/" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-black h-16 px-10 rounded-2xl shadow-xl shadow-brand-500/20 transition-all hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto gap-3 text-lg"
                >
                  <Home className="size-6" />
                  Voltar para Home
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                className="h-16 px-10 rounded-2xl border-2 border-outline-100 dark:border-outline-900 bg-white/10 dark:bg-background-900/50 backdrop-blur-md hover:bg-background-100 dark:hover:bg-background-800 text-typography-950 dark:text-white font-bold transition-all w-full sm:w-auto gap-3 text-lg"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="size-6" />
                Retornar
              </Button>
            </HStack>

            <Box className="pt-10 flex flex-col items-center gap-4 opacity-20">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-typography-950 dark:via-white to-transparent" />
              <Text className="text-[10px] font-black uppercase tracking-[0.4em] text-typography-950 dark:text-white">
                Catalyst Skeleton · Elite v4.0.0
              </Text>
            </Box>
          </VStack>
        </motion.div>
      </Container>
    </AppContainer>
  )
}