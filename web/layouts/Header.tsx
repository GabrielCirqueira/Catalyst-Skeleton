import { useTheme } from '@/contexts'
import { Box, HStack, Text } from '@/shared/ui/layout'
import { useAuthStore } from '@/stores/useAuthStore'
import { Chip, buttonVariants } from '@heroui/react'
import { Code2, LogIn, Moon, Sun, User } from 'lucide-react'
import { memo } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { href: '/#showcase', label: 'Componentes' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#steps', label: 'Como funciona' },
]

interface HeaderProps {
  onAbrirModal: () => void
}

export const Header = memo(function Header({ onAbrirModal }: HeaderProps) {
  const autenticado = useAuthStore((s) => s.autenticado)
  const usuario = useAuthStore((s) => s.usuario)
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const isAuthPage = pathname === '/login' || pathname === '/cadastro'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <HStack className="max-w-6xl mx-auto px-6 h-14 justify-between">
        <Link to="/">
          <HStack>
            <Box className="size-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <Code2 className="size-4 text-white" strokeWidth={2.5} />
            </Box>
            <Text as="span" className="font-black font-sans text-sm tracking-tight">
              Catalyst{' '}
              <Text as="span" className="text-brand-500">
                Skeleton
              </Text>
            </Text>
          </HStack>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <HStack>
          <button
            type="button"
            onClick={toggleTheme}
            className="size-8 rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {autenticado ? (
            <Chip color="success" variant="soft" size="sm">
              <User className="size-3 mr-1" />
              {usuario?.username}
            </Chip>
          ) : (
            !isAuthPage && (
              <button
                type="button"
                onClick={onAbrirModal}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                <LogIn className="size-3.5" />
                Entrar
              </button>
            )
          )}
        </HStack>
      </HStack>
    </header>
  )
})
