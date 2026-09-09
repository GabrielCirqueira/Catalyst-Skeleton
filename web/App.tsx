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
      {/* Rotas públicas */}
      <Route element={<MainLayout />}>
        <Route index lazy={() => lazyWithRetry(() => import('@pages/Home/Home'))} />
        <Route path="login" lazy={() => lazyWithRetry(() => import('@pages/Login/Login'))} />
        <Route path="cadastro" lazy={() => lazyWithRetry(() => import('@pages/Cadastro/Cadastro'))} />
        <Route path="*" lazy={() => lazyWithRetry(() => import('@pages/NotFound/NotFound'))} />
      </Route>

      {/*
       * Rotas protegidas — RotaProtegida redireciona para /login se não autenticado.
       * Substitua MainLayout por um DashboardLayout quando criar a área logada.
       */}
      <Route element={<MainLayout />}>
        <Route element={<RotaProtegida />}>
          <Route path="app" lazy={() => lazyWithRetry(() => import('@pages/Home/Home'))} />
        </Route>
      </Route>
    </Route>
  )
)

export default function App() {
  return <RouterProvider router={router} />
}
