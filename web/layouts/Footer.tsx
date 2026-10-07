import { Box, Center, HStack, Link, Text } from '@chakra-ui/react'
import { Code2, Github } from 'lucide-react'
import { memo } from 'react'
import { Link as RouterLink } from 'react-router-dom'

const footerLinks = [
  { href: '/#showcase', label: 'Componentes' },
  { href: '/#stack', label: 'Stack' },
  { href: '/#steps', label: 'Como funciona' },
]

export const Footer = memo(function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" bg="catalist.grey.0">
      <HStack maxW="6xl" mx="auto" px="6" h="16" justify="space-between" wrap="wrap">
        <Link asChild>
          <RouterLink to="/">
            <HStack>
              <Center boxSize="6" rounded="md" bg="catalist.brand.500" color="catalist.grey.0">
                <Code2 size={14} color="currentColor" strokeWidth={2.5} />
              </Center>
              <Text
                as="span"
                fontWeight="black"
                fontSize="xs"
                letterSpacing="tight"
                fontFamily="heading"
              >
                Catalyst{' '}
                <Text as="span" color="catalist.brand.700">
                  Skeleton
                </Text>
              </Text>
            </HStack>
          </RouterLink>
        </Link>

        <HStack as="nav" hideBelow="sm" gap="5" fontSize="xs" color="catalist.grey.600">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} _hover={{ color: 'catalist.grey.900' }}>
              {link.label}
            </Link>
          ))}
        </HStack>

        <HStack gap="3" fontSize="xs" color="catalist.grey.600">
          <Text as="span">MIT License</Text>
          <Link href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github size={16} />
          </Link>
        </HStack>
      </HStack>
    </Box>
  )
})
