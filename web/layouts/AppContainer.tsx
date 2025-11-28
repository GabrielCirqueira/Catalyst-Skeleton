import * as React from "react";
import { Box } from "@shadcn/layout";
import { cn } from "@shadcn/lib/utils";

export interface AppContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Conteúdo da página
   */
  children: React.ReactNode;
  /**
   * Classes CSS adicionais
   */
  className?: string;
  /**
   * Largura máxima do container
   * @default "7xl"
   */
  maxWidth?: "full" | "7xl" | "6xl" | "5xl" | "4xl" | "3xl" | "2xl" | "xl" | "lg";
  /**
   * Padding vertical
   * @default "8"
   */
  paddingY?: "0" | "4" | "6" | "8" | "12" | "16";
  /**
   * Padding horizontal
   * @default "6"
   */
  paddingX?: "0" | "4" | "6" | "8" | "12";
  /**
   * Se deve centralizar o conteúdo
   * @default true
   */
  centered?: boolean;
}

const maxWidthClasses = {
  full: "max-w-full",
  "7xl": "max-w-7xl",
  "6xl": "max-w-6xl",
  "5xl": "max-w-5xl",
  "4xl": "max-w-4xl",
  "3xl": "max-w-3xl",
  "2xl": "max-w-2xl",
  xl: "max-w-xl",
  lg: "max-w-lg",
};

const paddingYClasses = {
  "0": "py-0",
  "4": "py-4",
  "6": "py-6",
  "8": "py-8",
  "12": "py-12",
  "16": "py-16",
};

const paddingXClasses = {
  "0": "px-0",
  "4": "px-4",
  "6": "px-6",
  "8": "px-8",
  "12": "px-12",
};

/**
 * AppContainer - Container padrão para conteúdo das páginas
 *
 * Define configurações consistentes de largura, padding e alinhamento
 * para todas as páginas da aplicação.
 *
 * @example
 * ```tsx
 * import { AppContainer } from "@layouts/AppContainer";
 *
 * export default function MyPage() {
 *   return (
 *     <AppContainer>
 *       <h1>Minha Página</h1>
 *       <p>Conteúdo...</p>
 *     </AppContainer>
 *   );
 * }
 * ```
 */
export const AppContainer = React.forwardRef<HTMLDivElement, AppContainerProps>(
  (
    {
      children,
      className,
      maxWidth = "full",
      paddingY = "8",
      paddingX = "6",
      centered = true,
      ...props
    },
    ref
  ) => {
    return (
      <Box
        ref={ref}
        className={cn(
          "w-full",
          maxWidthClasses[maxWidth],
          paddingYClasses[paddingY],
          paddingXClasses[paddingX],
          centered && "mx-auto",
          className
        )}
        {...props}
      >
        {children}
      </Box>
    );
  }
);

AppContainer.displayName = "AppContainer";
