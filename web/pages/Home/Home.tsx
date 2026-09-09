import { useAuthStore } from '@/stores/useAuthStore'
import { Button, Card, CardBody, Chip } from '@heroui/react'
import { Code2, Github, LogIn, Rocket, Shield, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

const stack = [
  { label: 'PHP 8.4 + Symfony 7.3', color: 'secondary' as const },
  { label: 'React 19 + TypeScript 5.9', color: 'primary' as const },
  { label: 'Tailwind CSS 4 + HeroUI', color: 'default' as const },
  { label: 'JWT RS256 Auth', color: 'success' as const },
  { label: 'TanStack Query 5', color: 'warning' as const },
  { label: 'Docker + Vite 7', color: 'default' as const },
]

const features = [
  {
    icon: Shield,
    title: 'Auth JWT pronto',
    description: 'Login, cadastro, refresh token e rota protegida configurados com RS256.',
  },
  {
    icon: Zap,
    title: 'DX otimizada',
    description: 'PHPStan nível 6, Biome, Husky, Commitlint e hot reload com Vite.',
  },
  {
    icon: Rocket,
    title: 'Lean por padrão',
    description: 'Core enxuto. Módulos async, observability e ui-extra ativados no setup.',
  },
]

export function Component() {
  const autenticado = useAuthStore((s) => s.autenticado)
  const usuario = useAuthStore((s) => s.usuario)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-12 px-4 py-16">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 text-center max-w-2xl">
        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
          <Code2 className="size-8 text-white" strokeWidth={2.5} />
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold font-sans tracking-tight">
            Catalyst <span className="text-primary">Skeleton</span>
          </h1>
          <p className="text-default-500 text-lg">
            Fundação opinativa para aplicações full-stack Symfony + React.
          </p>
        </div>

        {autenticado ? (
          <p className="text-sm text-success font-medium">
            ✓ Logado como <strong>{usuario?.nomeCompleto ?? usuario?.username}</strong>
          </p>
        ) : (
          <div className="flex gap-3 flex-wrap justify-center">
            <Button as={Link} to="/login" color="primary" startContent={<LogIn className="size-4" />}>
              Fazer login
            </Button>
            <Button as={Link} to="/cadastro" variant="bordered">
              Criar conta
            </Button>
          </div>
        )}
      </div>

      {/* Stack chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {stack.map((item) => (
          <Chip key={item.label} color={item.color} variant="flat" size="sm">
            {item.label}
          </Chip>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
        {features.map((f) => (
          <Card key={f.title} className="shadow-sm">
            <CardBody className="flex flex-col gap-3 p-5">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="size-5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold font-sans">{f.title}</p>
                <p className="text-sm text-default-500 mt-0.5">{f.description}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Footer link */}
      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-sm text-default-400 hover:text-default-600 transition-colors"
      >
        <Github className="size-4" />
        Ver no GitHub
      </a>
    </div>
  )
}
