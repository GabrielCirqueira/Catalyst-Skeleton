import { useColorModeValue, ColorModeButton } from '@app/components/ui/color-mode'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  List,
  useToken,
  chakra,
  Code,
  Link,
  Badge,
} from '@chakra-ui/react'
import {
  Blocks,
  PenLine,
  LayoutDashboard,
  Code2,
  Palette,
  PackagePlus,
  Zap,
  CheckCircle,
  Database,
  ServerCog,
  PackagePlus as PackageIcon,
  Wrench,
  Terminal,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaReact as ReactIcon } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = chakra(motion.div)
const MotionStack = chakra(motion.div)

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export function Component() {
  const [brand] = useToken('colors', ['brand.500'])
  const cardBg = useColorModeValue('white', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const muted = useColorModeValue('gray.500', 'gray.400')

  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    document.title = 'Home'
    const t = setTimeout(() => {
      try {
        const seen = localStorage.getItem('catalyst_welcome_seen')
        if (!seen) {
          setShowTips(true)
          localStorage.setItem('catalyst_welcome_seen', '1')
        }
      } catch {
        // ignore storage errors
      }
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <VStack gap={24} align="stretch" px={{ base: 4, md: 14 }} py={5}>
        <ColorModeButton size="lg" alignSelf="flex-end" _hover={{ transform: 'scale(1.1)' }} />

        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="show"
          position="relative"
          overflow="hidden"
          rounded="2xl"
          py={{ base: 14, md: 20 }}
          px={{ base: 6, md: 16 }}
          textAlign="center"
          bg={cardBg}
        >
          <MotionBox
            position="absolute"
            top={-24}
            left={-24}
            w={64}
            h={64}
            rounded="full"
            filter="blur(48px)"
            bgGradient="linear(to-br, brand.500, teal.400)"
            opacity={0.25}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
          />
          <MotionBox
            position="absolute"
            bottom={-24}
            right={-24}
            w={64}
            h={64}
            rounded="full"
            filter="blur(48px)"
            bgGradient="linear(to-tr, cyan.400, brand.500)"
            opacity={0.25}
            animate={{ rotate: -360 }}
            transition={{ duration: 36, ease: 'linear', repeat: Infinity }}
          />

          <MotionStack variants={itemVariants}>
            <Heading size="4xl" color="brand.500">
              Catalyst Skeleton
            </Heading>
            <Text fontSize="2xl" color={textColor}>
              Symfony 7 + React 19 + Vite 7 + Chakra UI v3
            </Text>
            <Text mt={3} fontSize="lg" color={textColor}>
              Base moderna full‑stack com roteamento assíncrono, tema semântico, Docker e qualidade
              de código automatizada.
            </Text>
            <Text mt={6} maxW="3xl" mx="auto" color={textColor} opacity={0.9}>
              Construa rápido: dev server com HMR, design system acessível, ORM e migrações com
              Doctrine, e fluxo de CI local com linters/fixers.
            </Text>
          </MotionStack>

          <HStack mt={10} gap={6} justify="center" flexWrap="wrap">
            <MotionBox variants={itemVariants} whileHover={{ y: -3 }}>
              <Button colorScheme="brand" size="lg" shadow="sm">
                <Blocks size={18} />
                Explorar Código
              </Button>
            </MotionBox>
            <MotionBox variants={itemVariants} whileHover={{ y: -3 }}>
              <Button variant="outline" size="lg" _hover={{ bg: 'bg' }}>
                <PenLine size={18} />
                Documentação
              </Button>
            </MotionBox>
          </HStack>
        </MotionBox>

        <VStack gap={8} as="section">
          <Heading textAlign="center" color="brand.500">
            Por que o Catalyst?
          </Heading>
          <Text maxW="3xl" mx="auto" textAlign="center" color={textColor}>
            Um boilerplate opinado para acelerar produtos: integra front e back com padrões sólidos,
            DX amigável e decisões que evitam retrabalho. Foque no domínio; a infraestrutura já vem
            pronta.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} mt={4}>
            {[
              {
                icon: PackagePlus,
                title: 'Stack equilibrado',
                desc: 'React 19 + Vite 7 + Chakra v3 no front; Symfony 7.3 + Doctrine no back. Tudo conectado por Docker e Make.',
              },
              {
                icon: Palette,
                title: 'Design System',
                desc: 'Tema semântico com paleta brand, dark/light suaves e componentes acessíveis prontos para compor.',
              },
              {
                icon: Zap,
                title: 'Produtividade',
                desc: 'Hot reload imediato, scripts de lint/fix, migrações e comandos make para rotina diária.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <MotionBox
                key={title}
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <HStack align="start" gap={4}>
                  <Box p={3} bg="brand.500" color="white" rounded="md">
                    <Icon size={18} />
                  </Box>
                  <Box>
                    <Heading size="md">{title}</Heading>
                    <Text mt={2} color={textColor}>
                      {desc}
                    </Text>
                  </Box>
                </HStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>

        <VStack gap={6} as="section">
          <Heading textAlign="center" color="brand.500">
            Bibliotecas Principais
          </Heading>
          <HStack gap={6} flexWrap="wrap" justify="center">
            {[
              { icon: ReactIcon, label: 'React 19' },
              { icon: Blocks, label: 'Chakra UI v3' },
              { icon: Code2, label: 'TypeScript' },
              { icon: LayoutDashboard, label: 'Vite 7' },
            ].map(({ icon: Icon, label }) => (
              <MotionBox
                key={label}
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <HStack gap={2} px={3} py={2} rounded="full" bg={cardBg} shadow="xs">
                  <Box color="brand.500">
                    <Icon size={18} />
                  </Box>
                  <Text color={textColor}>{label}</Text>
                </HStack>
              </MotionBox>
            ))}
          </HStack>
        </VStack>

        <VStack gap={10} as="section">
          <Heading textAlign="center" color="brand.500">
            Stack Completo
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
            <MotionBox
              variants={itemVariants}
              whileInView="show"
              initial="hidden"
              viewport={{ once: true }}
            >
              <HStack gap={3} mb={3}>
                <Box p={2} bg="brand.500" color="white" rounded="md">
                  <ServerCog size={18} />
                </Box>
                <Heading size="md">Backend (Symfony 7)</Heading>
                <Badge colorPalette="green">estável</Badge>
              </HStack>
              <Text color={textColor}>
                API e páginas servidas pelo Symfony 7.3 com bundles essenciais. Persistência por
                Doctrine ORM e migrações versionadas. Observabilidade via Monolog e mensageria com
                Messenger quando necessário.
              </Text>
              <List.Root gap="2" mt={3}>
                {[
                  'FrameworkBundle, Security, Validator',
                  'Doctrine ORM + Migrations',
                  'Monolog, Messenger, Mailer',
                  'Twig + Vite Bundle (assets)',
                ].map((b) => (
                  <List.Item key={b}>
                    <HStack gap={2}>
                      <CheckCircle size={14} color={brand} />
                      <Text color={textColor}>{b}</Text>
                    </HStack>
                  </List.Item>
                ))}
              </List.Root>
            </MotionBox>
            <MotionBox
              variants={itemVariants}
              whileInView="show"
              initial="hidden"
              viewport={{ once: true }}
            >
              <HStack gap={3} mb={3}>
                <Box p={2} bg="brand.500" color="white" rounded="md">
                  <LayoutDashboard size={18} />
                </Box>
                <Heading size="md">Frontend (React)</Heading>
                <Badge colorPalette="blue">rápido</Badge>
              </HStack>
              <Text color={textColor}>
                SPA com React 19, roteamento assíncrono e tema unificado no Chakra UI. Build e HMR
                via Vite 7. Animações elegantes com Framer Motion.
              </Text>
              <List.Root gap="2" mt={3}>
                {[
                  'Router v7 (lazy routes)',
                  'Chakra v3 + tokens semânticos',
                  'Framer Motion (microinterações)',
                  'TypeScript estrito',
                ].map((b) => (
                  <List.Item key={b}>
                    <HStack gap={2}>
                      <CheckCircle size={14} color={brand} />
                      <Text color={textColor}>{b}</Text>
                    </HStack>
                  </List.Item>
                ))}
              </List.Root>
            </MotionBox>
          </SimpleGrid>
          <Box rounded="xl" px={{ base: 5, md: 8 }} py={{ base: 5, md: 6 }} bg={cardBg}>
            <HStack gap={3} mb={2}>
              <Box p={2} bg="brand.500" color="white" rounded="md">
                <Database size={18} />
              </Box>
              <Heading size="sm">Infra & Dados</Heading>
            </HStack>
            <Text color={muted}>
              Stack Docker com serviços para Symfony, Vite e MySQL 8. Variáveis configuráveis em
              <Code ml={1}>.env</Code> e <Code ml={1}>ports.env</Code>. Pronto para adicionar Redis
              quando necessário.
            </Text>
          </Box>
        </VStack>

        <VStack gap={12} as="section">
          <Heading textAlign="center" color="brand.500">
            Automação & Qualidade
          </Heading>
          <Box
            rounded="xl"
            px={{ base: 5, md: 8 }}
            py={{ base: 6, md: 8 }}
            bgGradient="linear(to-b, rgba(0,0,0,0), rgba(0,0,0,0))"
            borderWidth="1px"
            borderColor={useColorModeValue('gray.200', 'gray.700')}
          >
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
              <MotionBox
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <HStack gap={3}>
                  <Box p={2} bg="brand.500" color="white" rounded="md">
                    <Wrench size={18} />
                  </Box>
                  <Heading size="sm">Linters & Fix</Heading>
                </HStack>
                <List.Root gap="2" mt={3}>
                  {[
                    'ESLint + Prettier (web)',
                    'PHPStan (análise estática)',
                    'PHPCS/PHPCBF (PSR‑12)',
                    'Hook: cli/install-hooks.sh',
                  ].map((b) => (
                    <List.Item key={b}>
                      <HStack gap={2}>
                        <CheckCircle size={14} color={brand} />
                        <Text color={textColor}>{b}</Text>
                      </HStack>
                    </List.Item>
                  ))}
                </List.Root>
              </MotionBox>
              <MotionBox
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <HStack gap={3}>
                  <Box p={2} bg="brand.500" color="white" rounded="md">
                    <Terminal size={18} />
                  </Box>
                  <Heading size="sm">Atalhos Make</Heading>
                </HStack>
                <VStack align="start" mt={3} gap={2}>
                  {[
                    ['make up-d', 'subir stack'],
                    ['make install', 'deps PHP/Node'],
                    ['make lint-all', 'QA completa'],
                    ['make fix-php-diff', 'autofix mudanças'],
                  ].map(([cmd, desc]) => (
                    <HStack key={cmd} gap={2}>
                      <Code>{cmd}</Code>
                      <Text color={muted}>— {desc}</Text>
                    </HStack>
                  ))}
                </VStack>
              </MotionBox>
              <MotionBox
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <HStack gap={3}>
                  <Box p={2} bg="brand.500" color="white" rounded="md">
                    <PackageIcon size={18} />
                  </Box>
                  <Heading size="sm">Docker Compose</Heading>
                </HStack>
                <Text mt={3} color={textColor}>
                  Services: <Code>symfony</Code>, <Code>vite-react</Code>, <Code>database</Code>.
                  Logs e shells rápidos via <Code>make logs-*</Code> e <Code>make bash-*</Code>.
                </Text>
              </MotionBox>
            </SimpleGrid>
          </Box>
        </VStack>

        <VStack gap={12} as="section">
          <Heading textAlign="center" color="brand.500">
            Theming & Rotas
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
            {[
              {
                title: 'Theming & Cor',
                bullets: [
                  'Tokens bg / fg nativos',
                  'Palette brand configurada',
                  'Animações built-in',
                ],
              },
              {
                title: 'Rotas',
                bullets: [
                  'Home – landing + animações',
                  'NotFound – mensagem 404',
                  'lazy() p/ carregamento',
                ],
              },
              {
                title: 'Lint & Formatação',
                bullets: [
                  'ESLint + Prettier (web)',
                  'PHPStan + PHPCS (api)',
                  'Comandos make e npm',
                ],
              },
            ].map(({ title, bullets }) => (
              <MotionBox
                key={title}
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <Heading size="md">{title}</Heading>
                <List.Root gap="2" mt={4}>
                  {bullets.map((b) => (
                    <List.Item key={b}>
                      <HStack gap={2}>
                        <CheckCircle size={14} color={brand} />
                        <Text color={textColor}>{b}</Text>
                      </HStack>
                    </List.Item>
                  ))}
                </List.Root>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>

        <VStack gap={8} as="section">
          <Heading textAlign="center" color="brand.500">
            Quick Start
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            {[
              ['1. Subir stack', 'make up-d'],
              ['2. Instalar dependências', 'make install'],
              ['3. Rodar dev (Vite)', 'npm run dev'],
            ].map(([title, cmd]) => (
              <MotionBox
                key={title}
                variants={itemVariants}
                whileInView="show"
                initial="hidden"
                viewport={{ once: true }}
              >
                <Text fontWeight="semibold">{title}</Text>
                <Code mt={2}>{cmd}</Code>
              </MotionBox>
            ))}
          </SimpleGrid>
          <Box borderTopWidth="1px" borderColor={useColorModeValue('gray.200', 'gray.700')} />
          <HStack gap={4} justify="center">
            <Text color={textColor}>Leia o README para detalhes adicionais.</Text>
            <Link
              href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
              isExternal
              color="brand.500"
            >
              Repositório
            </Link>
          </HStack>
        </VStack>

        <VStack gap={8}>
          <Heading textAlign="center" color="brand.500">
            Considerações
          </Heading>
          <Text mx="auto" maxW="3xl" textAlign="center" color={textColor}>
            Um starter enxuto porém completo: back em Symfony 7 com Doctrine, front em React 19 com
            Chakra UI e animações Framer Motion, além de Docker, Make e linters para manter a base
            saudável. Use como base para novos serviços ou MVPs.
          </Text>
        </VStack>
      </VStack>

      <AnimatePresence>
        {showTips && (
          <MotionBox
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            position="fixed"
            bottom={{ base: 6, md: 10 }}
            right={{ base: 4, md: 10 }}
            zIndex={50}
          >
            <Box bg={cardBg} rounded="xl" shadow="lg" p={4} maxW={{ base: 'xs', md: 'sm' }}>
              <HStack gap={2} mb={1}>
                <Box p={1.5} bg="brand.500" color="white" rounded="md">
                  <Zap size={14} />
                </Box>
                <Text fontWeight="bold">Dica rápida</Text>
              </HStack>
              <Text color={textColor} fontSize="sm">
                Use <Code>make up-d</Code> para subir o ambiente e <Code>npm run dev</Code> para o
                frontend com HMR. Precisa de qualidade? <Code>composer qa</Code> e{' '}
                <Code>make lint-all</Code>.
              </Text>
              <HStack mt={3} gap={2} justify="flex-end">
                <Button size="sm" variant="ghost" onClick={() => setShowTips(false)}>
                  Fechar
                </Button>
              </HStack>
            </Box>
          </MotionBox>
        )}
      </AnimatePresence>
    </>
  )
}
