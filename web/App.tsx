import { MainLayout } from '@app/layouts'
import theme from '@app/themes/theme'
import { MantineProvider } from '@mantine/core'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => import('@app/pages/Home')} />
        <Route path="*" lazy={() => import('@app/pages/NotFound')} />
      </Route>
    </Route>
  )
)

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <RouterProvider router={router} />
    </MantineProvider>
  )
}

export default App
