import { useAuthStore } from '@/stores'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * Guarda de rota totalmente protegida.
 *
 * Redireciona para /login se o usuário não estiver autenticado.
 * Use no App.tsx envolvendo rotas privadas.
 *
 * @example
 * <Route element={<RotaProtegida />}>
 *   <Route path="/dashboard" lazy={() => import('@pages/Dashboard/Dashboard')} />
 * </Route>
 */
export function RotaProtegida() {
  const { autenticado } = useAuthStore()

  if (!autenticado) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
