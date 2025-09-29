import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'
import system from '@app/themes/theme'
import { ChakraProvider } from '@chakra-ui/react'
import { MainLayout } from '@app/layouts'
import { ColorModeProvider } from '@app/components/ui/color-mode'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => import('@app/pages/Home')} />
        <Route path="*" lazy={() => import('@app/pages/NotFound')} />
      </Route>
    </Route>,
  ),
)

function App() {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </ColorModeProvider>
  )
}

export default App
