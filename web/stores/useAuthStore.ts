import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/shared/types'

interface AuthStore {
  usuario: Usuario | null
  token: string | null
  autenticado: boolean
  setAutenticado: (usuario: Usuario, token: string) => void
  limpar: () => void
}

/**
 * Store de autenticação global.
 *
 * Persistido no localStorage para sobreviver ao refresh de página.
 *
 * @example
 * const { usuario, autenticado } = useAuthStore()
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      autenticado: false,

      setAutenticado: (usuario, token) => {
        localStorage.setItem('token', token)
        set({ usuario, token, autenticado: true })
      },

      limpar: () => {
        localStorage.removeItem('token')
        set({ usuario: null, token: null, autenticado: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ usuario: state.usuario, token: state.token }),
    }
  )
)
