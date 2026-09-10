import { Text, VStack } from '@/shared/ui/layout'
import { Button } from '@heroui/react'
import { MoveLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Component() {
  return (
    <VStack className="flex-1 items-center justify-center gap-6 px-4 text-center motion-preset-fade">
      <VStack className="gap-2">
        <Text as="span" className="text-8xl font-black font-sans text-accent/20 leading-none">
          404
        </Text>
        <Text as="h1" className="text-2xl font-bold font-sans">
          Página não encontrada
        </Text>
        <Text className="text-muted max-w-sm">
          A rota que você tentou acessar não existe ou foi removida.
        </Text>
      </VStack>

      <Button
        as={Link}
        to="/"
        color="accent"
        variant="flat"
        startContent={<MoveLeft className="size-4" />}
      >
        Voltar para o início
      </Button>
    </VStack>
  )
}
