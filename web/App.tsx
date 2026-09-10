import { MainLayout } from '@/layouts'
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'

import { RotaProtegida } from '@/routes'
import { lazyWithRetry } from '@/shared/utils/lazyWithRetry'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => lazyWithRetry(() => import('@/features/home/Home'))} />
        <Route path="login" lazy={() => lazyWithRetry(() => import('@/features/auth/Login'))} />
        <Route
          path="cadastro"
          lazy={() => lazyWithRetry(() => import('@/features/cadastro/Cadastro'))}
        />
        <Route path="*" lazy={() => lazyWithRetry(() => import('@/features/not-found/NotFound'))} />
      </Route>

      <Route element={<MainLayout />}>
        <Route element={<RotaProtegida />}>
          <Route path="app" lazy={() => lazyWithRetry(() => import('@/features/home/Home'))} />
        </Route>
      </Route>
    </Route>
  )
)

export default function App() {
  return <RouterProvider router={router} />
}