import { ThemeProvider } from "@/contexts";
import { MainLayout } from "@layouts";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<MainLayout />}>
        <Route index lazy={() => import("@pages/Home/Home")} />
        <Route path="*" lazy={() => import("@pages/NotFound/NotFound")} />
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
