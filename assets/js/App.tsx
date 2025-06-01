import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { AppContainer as AppLayout } from '@app/layouts/AppContainer'
import theme from '@app/themes/theme'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
        <Route path="*" lazy={() => import('@app/pages/HelloWorld')} />
    </Route>
  )
)

function App() {
  return (
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  )
}

export default App
