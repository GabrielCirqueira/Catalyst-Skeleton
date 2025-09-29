import { useColorModeValue } from '@app/components/ui/color-mode'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  List,
  useToken,
} from '@chakra-ui/react'
import { Home, SmilePlus, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Link as RouterLink } from 'react-router-dom'

export function Component() {
  const [brand] = useToken('colors', ['brand.500'])
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Not Found'
  }, [])

  return (
    <VStack
      gap={16}
      py={20}
      px={{ base: 4, md: 14 }}
      align="stretch"
      textAlign="center"
    >
      <Box animationName="fade-in, scale-in" animationDuration="600ms">
        <Icon as={SmilePlus} boxSize={16} color="brand.500" mb={10} />
        <Heading fontSize="8xl" color="brand.500">
          404
        </Heading>
        <Text mt={100} fontSize="lg" color={textColor}>
          Ops... não encontramos esta página.
        </Text>
      </Box>

      <HStack justify="center" flexWrap="wrap" gap={6}>
        <Button
          as={RouterLink as any}
          onClick={() => navigate('/')}
          colorScheme="brand"
          size="xl"
        >
          <Home size={18} />
          Ir para Home
        </Button>
      </HStack>

      <VStack gap={6}>
        <Heading size="md" color="brand.500">
          Dicas rápidas
        </Heading>
        <List.Root gap="2" justifyContent="left" alignItems="start">
          {[
            'Verifique a URL digitada',
            'Use a busca acima',
            'Acesse links sugeridos',
            'Reporte se o problema persistir',
          ].map((item) => (
            <List.Item key={item}>
              <HStack gap={2} justify="center">
                <CheckCircle size={14} color={brand} />
                <Text color={textColor}>{item}</Text>
              </HStack>
            </List.Item>
          ))}
        </List.Root>
      </VStack>
    </VStack>
  )
}
