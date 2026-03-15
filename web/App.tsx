import { ThemeProvider } from "@/contexts";
import { MainLayout } from "@layouts";
import { RotaProtegida } from "@routes";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

/**
 * Rotas da aplicação.
 *
 * Todas as rotas são lazy-loaded via lazy().
 * Rotas protegidas ficam dentro de <RotaProtegida />.
 *
 * Consulte GUIA-GERAL.md seção 6.8 para regras de roteamento.
 */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => import("@pages/Home/Home")} />
        <Route path="*" lazy={() => import("@pages/NotFound/NotFound")} />

        <Route element={<RotaProtegida />}>
        </Route>
      </Route>
    </Route>
  )
);

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}