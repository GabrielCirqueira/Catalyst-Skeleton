'use client'

import { Container, Stack, Heading, Text, Button, Flex, Box, Icon } from '@chakra-ui/react'
import { FaReact, FaSymfony } from 'react-icons/fa'

export default function IntroductionPage() {
  return (
    <Container maxW={'7xl'} py={{ base: 20, md: 28 }} centerContent>
      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={{ base: 8, md: 10 }}>
        
        <Heading
          fontWeight={700}
          fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
          lineHeight={'110%'}
          color={'blue.600'}>
          Hello World!
        </Heading>

        <Text fontSize={{ base: 'lg', sm: 'xl' }} color={'blue.500'} fontWeight={'bold'}>
          Uma aplicação moderna com React e Symfony
        </Text>

        <Text color={'gray.600'} maxW={'3xl'} mt={4} fontSize={'lg'}>
          Este é um exemplo simples de como integrar o poderoso React com Symfony para construir
          aplicações dinâmicas e escaláveis. O React cuida da interface interativa, enquanto o
          Symfony gerencia o backend e a integração com banco de dados.
        </Text>

        <Stack spacing={6} direction={'row'} justify={'center'} mt={6}>
          <Button
            rounded={'full'}
            px={6}
            colorScheme={'blue'}
            bg={'blue.500'}
            _hover={{ bg: 'blue.600' }}
            fontWeight={'bold'}>
            Começar
          </Button>
          <Button
            rounded={'full'}
            px={6}
            color={'blue.500'}
            variant="outline"
            fontWeight={'bold'}>
            Saiba mais
          </Button>
        </Stack>

        <Flex w={'full'} justify={'center'} gap={8} mt={10}>
          <Box textAlign="center">
            <Icon as={FaReact} boxSize={16} color={'blue.400'} />
            <Text mt={2} color={'gray.700'} fontWeight={'bold'}>React</Text>
          </Box>
          <Box textAlign="center">
            <Icon as={FaSymfony} boxSize={16} color={'purple.400'} />
            <Text mt={2} color={'gray.700'} fontWeight={'bold'}>Symfony</Text>
          </Box>
        </Flex>
      </Stack>
    </Container>
  )
}
