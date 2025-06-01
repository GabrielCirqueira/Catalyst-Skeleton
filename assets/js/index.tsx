import App from 'App'
import { ChakraProvider } from '@chakra-ui/react'
import ReactDOM from 'react-dom/client'

const element = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(element)

root.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>
)
