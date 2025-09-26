import {
  useColorModeValue,
  ColorModeButton,
} from '@app/components/ui/color-mode'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  List,
  useToken,
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
} from 'lucide-react'
import { useEffect } from 'react'
import { FaReact as ReactIcon } from 'react-icons/fa'

export function Component() {
  const [brand] = useToken('colors', ['brand.500'])
  const cardBg = useColorModeValue('white', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    document.title = 'Home'
  }, [])

  return (
    <VStack gap={24} align="stretch" px={{ base: 4, md: 14 }} py={20}>
      <ColorModeButton
        size="lg"
        alignSelf="flex-end"
        _hover={{ transform: 'scale(1.1)' }}
      />

      <Box
        rounded="2xl"
        py={{ base: 14, md: 20 }}
        px={{ base: 6, md: 16 }}
        textAlign="center"
        bg={cardBg}
        animationName="fade-in, slide-from-bottom"
        animationDuration="600ms"
      >
        <Heading size="3xl" color="brand.500">
          Skeleton Vite + React + Chakra UI v3
        </Heading>
        <Text mt={3} fontSize="lg" color={textColor}>
          Estrutura mínima com roteamento, tema custom e lint prontos para uso
        </Text>
        <Text mt={6} maxW="3xl" mx="auto" color={textColor}>
          Comece projetos com tipagem forte em TypeScript, page-routing
          assíncrono e tokens semânticos que alternam suavemente entre modos
          claro e escuro.
        </Text>
        <HStack mt={10} gap={6} justify="center" flexWrap="wrap">
          <Button
            colorScheme="brand"
            size="lg"
            shadow="sm"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          >
            <Blocks size={18} />
            Explorar Código
          </Button>
          <Button
            variant="outline"
            size="lg"
            _hover={{ bg: 'bg', transform: 'translateY(-2px)' }}
          >
            <PenLine size={18} />
            Documentação
          </Button>
        </HStack>
      </Box>

      <VStack gap={12}>
        <Heading textAlign="center" color="brand.500">
          Visão Geral do Skeleton
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
          {[
            {
              icon: PackagePlus,
              title: 'Dependências',
              bullets: [
                'React 18 + Vite 5',
                'Chakra UI v3',
                'Recharts p/ gráficos',
                'ESLint + Prettier',
              ],
            },
            {
              icon: Palette,
              title: 'Tema & Cor',
              bullets: [
                'Paleta brand (ciano→verde)',
                'Tokens semânticos bg / fg',
                'Transição suave dark/light',
              ],
            },

            {
              icon: Zap,
              title: 'Scripts úteis',
              bullets: [
                '`npm run start` – dev server 5175',
                '`npm run build` – produção',
                '`npm run preview` – preview estático',
                '`npm run lint(:fix)` – qualidade',
              ],
            },
          ].map(({ icon: Icon, title, bullets }) => (
            <Card.Root
              key={title}
              bg={cardBg}
              p={8}
              rounded="xl"
              border="none"
              transition="all .25s"
              _hover={{ transform: 'translateY(-6px)' }}
            >
              <HStack gap={4}>
                <Box p={4} bg="brand.500" rounded="md" color="white">
                  <Icon size={20} />
                </Box>
                <Heading size="md">{title}</Heading>
              </HStack>
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
            </Card.Root>
          ))}
        </SimpleGrid>
      </VStack>

      <VStack gap={12}>
        <Heading textAlign="center" color="brand.500">
          Bibliotecas Principais
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 4 }} gap={8}>
          {[
            { icon: ReactIcon, label: 'React 18', desc: 'UI declarativa' },
            { icon: Blocks, label: 'Chakra UI v3', desc: 'Design System' },
            { icon: Code2, label: 'TypeScript', desc: 'Tipagem estática' },
            { icon: LayoutDashboard, label: 'Vite 5', desc: 'Bundler rápido' },
          ].map(({ icon: Icon, label, desc }) => (
            <Card.Root
              key={label}
              bg={cardBg}
              p={8}
              rounded="xl"
              border="none"
              textAlign="center"
              transition="all .25s"
              _hover={{ transform: 'translateY(-6px)' }}
            >
              <HStack>
                <Box
                  mx="auto"
                  w={12}
                  h={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="brand.500"
                  rounded="md"
                  color="white"
                >
                  <Icon size={22} />
                </Box>
                <Box>
                  {' '}
                  <Heading size="sm" mt={5}>
                    {label}
                  </Heading>
                  <Text mt={2} color={textColor}>
                    {desc}
                  </Text>
                </Box>
              </HStack>
            </Card.Root>
          ))}
        </SimpleGrid>
      </VStack>

      <VStack gap={12}>
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
                'Home – demonstra tema + gráfico',
                'NotFound – mensagem 404',
                'lazy() p/ carregamento',
              ],
            },
            {
              title: 'Lint & Formatação',
              bullets: [
                'ESLint (plugins React, Hooks, TS)',
                'Prettier integrado',
                'Regras recomendadas ativas',
              ],
            },
          ].map(({ title, bullets }) => (
            <Card.Root
              key={title}
              bg={cardBg}
              p={8}
              rounded="xl"
              border="none"
              transition="all .25s"
              _hover={{ transform: 'translateY(-6px)' }}
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
            </Card.Root>
          ))}
        </SimpleGrid>
      </VStack>

      <VStack gap={8}>
        <Heading textAlign="center" color="brand.500">
          Considerações
        </Heading>
        <Text mx="auto" maxW="3xl" textAlign="center" color={textColor}>
          Este esqueleto demonstra uma configuração moderna de React +
          TypeScript com Chakra UI v3. Inclui navegação, suporte a dark mode,
          gráficos prontos e tema personalizável — ponto de partida ideal para
          projetos que precisam de theming consistente, roteamento e boas
          práticas de linting.
        </Text>
      </VStack>
    </VStack>
  )
}
