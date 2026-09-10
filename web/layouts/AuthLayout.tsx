import { Box, HStack, Text, VStack } from '@/shared/ui/layout'
import { Code2 } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <VStack className="min-h-screen items-center justify-center px-4 py-12 gap-0">
      <Link to="/" className="mb-8 group">
        <HStack>
          <Box className="size-8 rounded-xl bg-accent flex items-center justify-center shadow group-hover:scale-105 transition-transform">
            <Code2 className="size-4 text-white" strokeWidth={2.5} />
          </Box>
          <Text as="span" className="font-sans font-bold text-xl">Catalyst</Text>
        </HStack>
      </Link>

      <Box className="w-full max-w-sm">
        <Outlet />
      </Box>
    </VStack>
  )
}
