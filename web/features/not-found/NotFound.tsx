import { Button } from '@heroui/react'
import { MoveLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Component() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center motion-preset-fade">
      <div className="flex flex-col gap-2">
        <span className="text-8xl font-black font-sans text-accent/20 leading-none">404</span>
        <h1 className="text-2xl font-bold font-sans">Página não encontrada</h1>
        <p className="text-muted max-w-sm">
          A rota que você tentou acessar não existe ou foi removida.
        </p>
      </div>

      <Button
        as={Link}
        to="/"
        color="accent"
        variant="flat"
        startContent={<MoveLeft className="size-4" />}
      >
        Voltar para o início
      </Button>
    </div>
  )
}
