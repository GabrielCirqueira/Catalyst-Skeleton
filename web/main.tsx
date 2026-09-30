import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { theme } from './config/theme/theme.ts'
import { ThemeProvider } from './contexts'
import { Toaster } from './shared/ui/toaster.tsx'

import '@fontsource/poppins/400.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import '@fontsource/poppins/900.css'
import '@fontsource/lato/400.css'
import '@fontsource/lato/700.css'

window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading page...', event)
  window.location.reload()
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ChakraProvider value={theme}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </ChakraProvider>
  </StrictMode>
)
