import { ThemeProvider } from '@/contexts'
import { MainLayout } from '@layouts'
import { RotaProtegida } from '@routes'
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

import { lazyWithRetry } from '@/shared/utils/lazyWithRetry'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => lazyWithRetry(() => import('@pages/Home/Home'))} />
        <Route path="*" lazy={() => lazyWithRetry(() => import('@pages/NotFound/NotFound'))} />
      </Route>

      <Route element={<MainLayout />}>
        <Route element={<RotaProtegida />} />
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
