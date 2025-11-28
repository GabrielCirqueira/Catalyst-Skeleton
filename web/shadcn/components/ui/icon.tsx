import { cn } from "@shadcn/lib/utils";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

export interface IconProps extends React.SVGAttributes<SVGElement> {
  /**
   * O ícone do Lucide React a ser renderizado
   */
  icon: LucideIcon;
  /**
   * Tamanho do ícone (em pixels)
   * @default 24
   */
  size?: number;
  /**
   * Classes CSS adicionais
   */
  className?: string;
  /**
   * Cor do stroke (espessura da linha)
   * @default 2
   */
  strokeWidth?: number;
}

/**
 * Componente Icon - renderiza dinamicamente qualquer ícone do Lucide React
 *
 * @example
 * ```tsx
 * import { Icon } from "@shadcn/icon";
 * import { Heart, Star, Bell } from "lucide-react";
 *
 * <Icon icon={Heart} size={24} className="text-red-500" />
 * <Icon icon={Star} size={32} className="text-brand-500" strokeWidth={1.5} />
 * <Icon icon={Bell} className="text-info-600" />
 * ```
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: LucideIconComponent, size = 24, className, strokeWidth = 2, ...props }, ref) => {
    return (
      <LucideIconComponent
        ref={ref}
        size={size}
        strokeWidth={strokeWidth}
        className={cn("inline-block text-gray-700 dark:text-gray-300 ", className)}
        {...props}
      />
    );
  }
);

Icon.displayName = "Icon";
