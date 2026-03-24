import type { Usuario } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  usuario: Usuario | null
  token: string | null
  refreshToken: string | null
  autenticado: boolean
  setAutenticado: (usuario: Usuario, token: string, refreshToken: string) => void
  setToken: (token: string, refreshToken: string) => void
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
      refreshToken: null,
      autenticado: false,

      setAutenticado: (usuario, token, refreshToken) => {
        localStorage.setItem('token', token)
        set({ usuario, token, refreshToken, autenticado: true })
      },

      setToken: (token, refreshToken) => {
        localStorage.setItem('token', token)
        set({ token, refreshToken })
      },

      limpar: () => {
        localStorage.removeItem('token')
        set({ usuario: null, token: null, refreshToken: null, autenticado: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        usuario: state.usuario,
        token: state.token,
        refreshToken: state.refreshToken,
        autenticado: state.autenticado,
      }),
    }
  )
)
