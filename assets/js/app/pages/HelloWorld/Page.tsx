import {
  Container,
  Stack,
  Heading,
  Text,
  Button,
  Flex,
  Icon,
  useColorMode,
  useColorModeValue,
  Box,
  SimpleGrid,
  Divider,
  VStack,
  HStack,
  Grid,
  GridItem,
  IconButton,
  Link,
} from '@chakra-ui/react'
import {
  LayoutDashboard,
  Code2,
  Palette,
  Smartphone,
  Rocket,
  FolderGit2,
  Route,
  Laptop2,
  Package,
  Cpu,
  Layers,
  Activity,
  Database,
  ArrowRight,
  CheckCircle,
  Moon,
  Sun,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Component(): JSX.Element {
  const { colorMode, toggleColorMode } = useColorMode()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const primaryColor = useColorModeValue('brand.600', 'brand.300')
  const secondaryColor = useColorModeValue('brand.500', 'brand.200')
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const navigate = useNavigate()

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW={'7xl'} py={{ base: 8, md: 16 }} centerContent>
        <Box position="absolute" top={4} right={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <Moon /> : <Sun />}
            onClick={toggleColorMode}
            variant="ghost"
            colorScheme="brand"
          />
        </Box>

        <VStack
          spacing={8}
          textAlign="center"
          w="full"
          bg={cardBg}
          p={{ base: 6, md: 12 }}
          rounded="xl"
          shadow="sm"
          mb={12}
        >
          <Heading
            size="2xl"
            fontWeight="extrabold"
            color={primaryColor}
            letterSpacing="tight"
            lineHeight="1.2"
          >
            Hello World
          </Heading>

          <Text fontSize="xl" color={secondaryColor} fontWeight="medium">
            React + Symfony com TypeScript e Chakra UI
          </Text>

          <Text color={textColor} maxW="2xl" fontSize="lg" lineHeight="tall">
            Uma estrutura leve e minimalista, unindo a interface interativa do React com o backend
            robusto do Symfony, para construir aplicações escaláveis e eficientes.
          </Text>

          <HStack spacing={6} mt={4}>
            <Button
              as={Link}
              href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
              isExternal
              colorScheme="brand"
              variant="solid"
              size="lg"
              px={8}
              rounded="full"
              fontWeight="bold"
              rightIcon={<ArrowRight size={18} />}
            >
              Explorar Código
            </Button>
            <Button
              as={Link}
              href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
              isExternal
              colorScheme="brand"
              variant="outline"
              size="lg"
              px={8}
              rounded="full"
              fontWeight="bold"
            >
              Documentação
            </Button>
          </HStack>
        </VStack>

        <Box w="full" mb={16}>
          <Heading size="xl" mb={10} textAlign="center" color={primaryColor}>
            Principais Recursos
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <FeatureCard
              icon={LayoutDashboard}
              title="Estrutura Organizada"
              description="Páginas lazy-loaded em /app/pages, layouts compartilhados e temas centralizados"
              color="brand.400"
            />
            <FeatureCard
              icon={Code2}
              title="TypeScript"
              description="Tipagem estática para melhor autocompletar e detecção de erros"
              color="brand.500"
            />
            <FeatureCard
              icon={Palette}
              title="Design System"
              description="Tema brand personalizado com componentes consistentes e dark/light mode"
              color="brand.600"
            />
          </SimpleGrid>
        </Box>

        <Divider borderColor={useColorModeValue('gray.200', 'gray.700')} mb={16} />

        <Box w="full" mb={16}>
          <Heading size="xl" mb={10} textAlign="center" color={primaryColor}>
            Como Funciona
          </Heading>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
            <WorkStep
              step="1"
              icon={FolderGit2}
              title="Estrutura"
              items={[
                'app/layouts para templates',
                'app/pages para rotas',
                'app/themes para configurações UI',
              ]}
            />
            <WorkStep
              step="2"
              icon={Route}
              title="Roteamento"
              items={[
                'Lazy loading de páginas',
                'Otimização de performance',
                'Carregamento sob demanda',
              ]}
            />
            <WorkStep
              step="3"
              icon={Cpu}
              title="Integração"
              items={[
                'React para frontend moderno',
                'Symfony para backend robusto',
                'API REST bem definida',
              ]}
            />
          </Grid>
        </Box>

        <Divider borderColor={useColorModeValue('gray.200', 'gray.700')} mb={16} />

        <Box w="full" mb={16}>
          <Heading size="xl" mb={10} textAlign="center" color={primaryColor}>
            Tecnologias Utilizadas
          </Heading>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            <TechCard
              icon={Laptop2}
              name="React 18"
              description="Frontend moderno"
              color="brand.400"
            />
            <TechCard
              icon={Package}
              name="Symfony 6"
              description="Backend robusto"
              color="brand.500"
            />
            <TechCard
              icon={Smartphone}
              name="Chakra UI"
              description="Componentes acessíveis"
              color="brand.600"
            />
            <TechCard
              icon={Rocket}
              name="TypeScript"
              description="Tipagem estática"
              color="brand.700"
            />
          </SimpleGrid>
        </Box>

        <Box w="full" bg={cardBg} p={{ base: 6, md: 10 }} rounded="xl" shadow="sm" mb={16}>
          <Heading size="xl" mb={8} color={primaryColor}>
            Detalhes da Arquitetura
          </Heading>

          <Stack spacing={8}>
            <FeatureDetail
              icon={Package}
              title="Lazy Loading"
              description="As páginas estão dentro da pasta @app/pages/* e são carregadas somente quando acessadas, deixando a aplicação mais rápida."
            />
            <FeatureDetail
              icon={Layers}
              title="Roteamento"
              description="Usamos react-router-dom com createBrowserRouter para navegar entre as páginas de forma eficiente."
            />
            <FeatureDetail
              icon={Activity}
              title="Layout"
              description="Todas as páginas ficam dentro de um layout comum chamado AppContainer, que contém o menu, cabeçalho e o conteúdo via Outlet."
            />
            <FeatureDetail
              icon={Palette}
              title="Tema"
              description="Utilizamos o Chakra UI com um tema customizado, usando as cores da paleta brand para manter consistência visual."
            />
            <FeatureDetail
              icon={Database}
              title="Back-end"
              description="O Symfony é responsável pela API e lógica do servidor, garantindo robustez e segurança."
            />
          </Stack>
        </Box>

        <VStack spacing={6} textAlign="center" w="full" bg={cardBg} p={10} rounded="xl" shadow="sm">
          <Heading size="xl" color={primaryColor}>
            Pronto para começar?
          </Heading>
          <Text fontSize="lg" color={textColor} maxW="2xl">
            Clone o repositório e comece a desenvolver sua aplicação com essa arquitetura moderna
            hoje mesmo.
          </Text>
          <Button
            as={Link}
            href="https://github.com/GabrielCirqueira/Catalyst-Skeleton"
            isExternal
            colorScheme="brand"
            variant="solid"
            size="lg"
            px={10}
            py={6}
            rounded="full"
            fontWeight="bold"
            rightIcon={<ArrowRight size={18} />}
          >
            Começar Agora
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: any
  title: string
  description: string
  color: string
}) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box
      p={8}
      bg={cardBg}
      borderRadius="xl"
      boxShadow="sm"
      borderLeftWidth="4px"
      borderLeftColor={color}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
    >
      <Flex align="center" mb={5}>
        <Icon as={icon} boxSize={8} color={color} mr={4} />
        <Heading size="lg" fontWeight="semibold">
          {title}
        </Heading>
      </Flex>
      <Text color={textColor} fontSize="md">
        {description}
      </Text>
    </Box>
  )
}

function WorkStep({
  icon,
  title,
  items,
  step,
}: {
  icon: any
  title: string
  items: string[]
  step: string
}) {
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <GridItem>
      <Flex align="center" mb={4}>
        <Box
          bg="brand.500"
          color="white"
          rounded="full"
          w={8}
          h={8}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={3}
          fontWeight="bold"
        >
          {step}
        </Box>
        <Flex align="center">
          <Icon as={icon} boxSize={6} color="brand.500" mr={2} />
          <Heading size="md" fontWeight="semibold">
            {title}
          </Heading>
        </Flex>
      </Flex>
      <Stack spacing={3} pl={11}>
        {items.map((item, index) => (
          <Flex key={index} align="center">
            <Icon as={CheckCircle} boxSize={4} color="brand.400" mr={3} />
            <Text fontSize="md" color={textColor}>
              {item}
            </Text>
          </Flex>
        ))}
      </Stack>
    </GridItem>
  )
}

function TechCard({
  icon,
  name,
  description,
  color,
}: {
  icon: any
  name: string
  description: string
  color: string
}) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box
      textAlign="center"
      p={6}
      bg={cardBg}
      borderRadius="xl"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
    >
      <Box bg={`${color}20`} color={color} p={4} rounded="xl" display="inline-flex" mb={4}>
        <Icon as={icon} boxSize={8} />
      </Box>
      <Heading size="md" mb={2} fontWeight="semibold">
        {name}
      </Heading>
      <Text fontSize="sm" color={textColor}>
        {description}
      </Text>
    </Box>
  )
}

function FeatureDetail({
  icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const iconBg = useColorModeValue('brand.50', 'brand.900')
  const iconColor = useColorModeValue('brand.600', 'brand.300')

  return (
    <HStack align="start" spacing={6}>
      <VStack bg={iconBg} color={iconColor} p={3} py={4} rounded="xl" flexShrink={0}>
        <Icon as={icon} boxSize={6} />
      </VStack>
      <Box>
        <Heading size="md" mb={2} fontWeight="semibold" color={iconColor}>
          {title}
        </Heading>
        <Text color={textColor}>{description}</Text>
      </Box>
    </HStack>
  )
}
