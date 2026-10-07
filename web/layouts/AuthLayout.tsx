import { Box, Center, HStack, Link, Text, VStack } from '@chakra-ui/react'
import { Code2 } from 'lucide-react'
import { Outlet, Link as RouterLink } from 'react-router-dom'

export function AuthLayout() {
  return (
    <VStack minH="100vh" align="center" justify="center" px="4" py="12" gap="0">
      <Link asChild mb="8">
        <RouterLink to="/">
          <HStack>
            <Center
              boxSize="8"
              rounded="xl"
              bg="catalist.brand.500"
              color="catalist.grey.0"
              boxShadow="md"
            >
              <Code2 size={16} color="currentColor" strokeWidth={2.5} />
            </Center>
            <Text as="span" fontWeight="bold" fontSize="xl" fontFamily="heading">
              Catalyst
            </Text>
          </HStack>
        </RouterLink>
      </Link>

      <Box w="full" maxW="sm">
        <Outlet />
      </Box>
    </VStack>
  )
}
