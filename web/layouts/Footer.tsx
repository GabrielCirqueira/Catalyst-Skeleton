import { Box, HStack, Text } from '@/shared/ui/layout'
import { Code2, Github } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'

const footerLinks = [
  { href: '/#showcase', label: 'Componentes' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#steps', label: 'Como funciona' },
]

export const Footer = memo(function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <HStack className="max-w-6xl mx-auto px-6 h-16 justify-between flex-wrap">
        <Link to="/">
          <HStack>
            <Box className="size-6 rounded-md bg-brand-500 flex items-center justify-center">
              <Code2 className="size-3.5 text-white" strokeWidth={2.5} />
            </Box>
            <Text as="span" className="font-black font-sans text-xs tracking-tight">
              Catalyst{' '}
              <Text as="span" className="text-brand-500">
                Skeleton
              </Text>
            </Text>
          </HStack>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-xs text-muted">
          {footerLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">
              {link.label}
            </a>
          ))}
        </nav>

        <HStack className="gap-3 text-xs text-muted">
          <Text as="span">MIT License</Text>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github className="size-4" />
          </a>
        </HStack>
      </HStack>
    </footer>
  )
})
