import { useTheme } from '@/contexts'
import { useAuthStore } from '@/stores/useAuthStore'
import { Badge, Box, Button, Center, HStack, IconButton, Link, Text } from '@chakra-ui/react'
import { Code2, LogIn, Moon, Sun, User } from 'lucide-react'
import { memo } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'

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
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      borderBottomWidth="1px"
      bg="bg/80"
      backdropFilter="blur(12px)"
    >
      <HStack maxW="6xl" mx="auto" px="6" h="14" justify="space-between">
        <Link asChild>
          <RouterLink to="/">
            <HStack>
              <Center boxSize="7" rounded="lg" bg="brand.solid">
                <Code2 size={16} color="white" strokeWidth={2.5} />
              </Center>
              <Text
                as="span"
                fontWeight="black"
                fontSize="sm"
                letterSpacing="tight"
                fontFamily="heading"
              >
                Catalyst{' '}
                <Text as="span" color="brand.fg">
                  Skeleton
                </Text>
              </Text>
            </HStack>
          </RouterLink>
        </Link>

        <HStack as="nav" hideBelow="md" gap="6" fontSize="sm" color="fg.muted">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} _hover={{ color: 'fg' }}>
              {link.label}
            </Link>
          ))}
        </HStack>

        <HStack>
          <IconButton
            type="button"
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>

          {autenticado ? (
            <Badge colorPalette="green" variant="subtle" size="sm">
              <User size={12} />
              {usuario?.username}
            </Badge>
          ) : (
            !isAuthPage && (
              <Button type="button" onClick={onAbrirModal} colorPalette="brand" size="sm">
                <LogIn size={14} />
                Entrar
              </Button>
            )
          )}
        </HStack>
      </HStack>
    </Box>
  )
})
