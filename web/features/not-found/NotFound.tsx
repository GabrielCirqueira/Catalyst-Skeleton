import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import { MoveLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Component() {
  return (
    <VStack flex="1" align="center" justify="center" gap="6" px="4" textAlign="center">
      <VStack gap="2">
        <Text
          as="span"
          fontSize="8xl"
          fontWeight="black"
          fontFamily="heading"
          color="catalist.brand.200"
          lineHeight="1"
        >
          404
        </Text>
        <Heading as="h1" size="xl">
          Página não encontrada
        </Heading>
        <Text color="catalist.grey.600" maxW="sm">
          A rota que você tentou acessar não existe ou foi removida.
        </Text>
      </VStack>

      <Button asChild colorPalette="brand" variant="subtle">
        <Link to="/">
          <MoveLeft size={16} />
          Voltar para o início
        </Link>
      </Button>
    </VStack>
  )
}
