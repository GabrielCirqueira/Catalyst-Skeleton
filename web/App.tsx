import { ThemeProvider } from '@/contexts'
import { MainLayout } from '@layouts'
import { RotaProtegida } from '@routes'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      {/* Rotas públicas */}
      <Route element={<MainLayout />}>
        <Route index lazy={() => import('@pages/Home/Home')} />
        <Route path="*" lazy={() => import('@pages/NotFound/NotFound')} />
      </Route>

      {/* Rotas protegidas */}
      <Route element={<MainLayout />}>
        <Route element={<RotaProtegida />}>{/* Adicione rotas privadas aqui */}</Route>
      </Route>
    </Route>
  )
)

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
