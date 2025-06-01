import { Container } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useColorMode } from '@chakra-ui/react'
import { ReactNode } from 'react'

const ThemeTransitionWrapper = ({ children }: { children: ReactNode }) => {
  const { colorMode } = useColorMode()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={colorMode}
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export function AppContainer({ children }: { children?: React.ReactNode }) {
  return (
    <Container
      maxW="full"
      flex={1}
      py={14}
      flexDirection="column"
      px={{ base: 4, md: 20 }}
      justifyItems="center"
    >
      <ThemeTransitionWrapper>
        {children || <Outlet />}
      </ThemeTransitionWrapper>
    </Container>
  )
}